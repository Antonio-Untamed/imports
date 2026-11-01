#!/usr/bin/env node
/**
 * Pre-flight check for `wrangler deploy`.
 *
 * The Cloudflare failure
 *   ✘ Could not detect a directory containing static files (e.g. .html, .css and js)
 * means wrangler found no Wrangler config and tried to guess a static-site
 * folder. This script fails early with an actionable message instead.
 */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const problems = [];

const configPath = ["wrangler.jsonc", "wrangler.json", "wrangler.toml"]
  .map((f) => path.join(root, f))
  .find((p) => existsSync(p));

if (!configPath) {
  problems.push(
    "No Wrangler config found (wrangler.jsonc). Wrangler then tries to auto-detect a static site and fails. Commit wrangler.jsonc from this repo."
  );
} else {
  const raw = readFileSync(configPath, "utf8");
  const mainMatch = raw.match(/"main"\s*:\s*"([^"]+)"/) ?? raw.match(/main\s*=\s*"([^"]+)"/);
  const main = mainMatch?.[1];

  if (!main) {
    problems.push(`${path.basename(configPath)} has no "main" entry — wrangler needs one to deploy a Worker.`);
  } else if (!existsSync(path.join(root, main))) {
    problems.push(
      `Worker entry "${main}" is missing. The OpenNext build did not run. On Cloudflare set the Build command to "npm run build" (or "npx opennextjs-cloudflare build") — with no build command, nothing is generated.`
    );
  }

  const assetsMatch = raw.match(/"directory"\s*:\s*"([^"]+)"/);
  if (assetsMatch && !existsSync(path.join(root, assetsMatch[1]))) {
    problems.push(`Assets directory "${assetsMatch[1]}" is missing — run the OpenNext build first.`);
  }
}

if (!existsSync(path.join(root, "node_modules"))) {
  problems.push("node_modules is missing — the install step did not run. Check package-lock.json is committed.");
}

if (problems.length) {
  console.error("\n✘ Cloudflare deploy pre-flight failed:\n");
  for (const p of problems) console.error(`  • ${p}`);
  console.error("\nSee DEPLOY.md → Option C for the exact dashboard settings.\n");
  process.exit(1);
}

console.log("✔ Cloudflare deploy pre-flight passed.");
