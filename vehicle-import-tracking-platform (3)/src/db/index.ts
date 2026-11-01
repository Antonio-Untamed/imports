import { drizzle, type NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

type DB = NodePgDatabase<Record<string, never>>;

const globalForDb = globalThis as typeof globalThis & {
  __bandariPool?: Pool;
  __bandariDb?: DB;
};

function connectionString(): string {
  const url =
    process.env.DATABASE_URL ??
    process.env.HYPERDRIVE_CONNECTION_STRING ??
    process.env.CLOUDFLARE_HYPERDRIVE_URL;

  if (!url) {
    throw new Error(
      "No database configured. Set DATABASE_URL (or HYPERDRIVE_CONNECTION_STRING on Cloudflare Workers) — see DEPLOY.md."
    );
  }
  return url;
}

export function getPool(): Pool {
  if (!globalForDb.__bandariPool) {
    globalForDb.__bandariPool = new Pool({
      connectionString: connectionString(),
      // Keep the pool small: serverless runtimes and Hyperdrive multiplex for us.
      max: process.env.NODE_ENV === "production" ? 5 : 10,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
    });
  }
  return globalForDb.__bandariPool;
}

export function getDb(): DB {
  if (!globalForDb.__bandariDb) {
    globalForDb.__bandariDb = drizzle(getPool());
  }
  return globalForDb.__bandariDb;
}

/**
 * Lazy proxy so importing this module never opens a connection and never
 * throws. Builds (and Workers cold starts) can import route modules before
 * secrets are wired up; the error only surfaces when a query actually runs.
 */
export const db: DB = new Proxy({} as DB, {
  get(_target, prop, receiver) {
    const real = getDb() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver as object);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

/** Retained for callers that need the raw pool. */
export const pool = new Proxy({} as Pool, {
  get(_target, prop, receiver) {
    const real = getPool() as unknown as Record<string | symbol, unknown>;
    const value = Reflect.get(real, prop, receiver as object);
    return typeof value === "function" ? value.bind(real) : value;
  },
});
