import { NextResponse } from "next/server";
import { readStoredImage } from "@/lib/admin";

export const dynamic = "force-dynamic";

const SAFE_NAME = /^[a-z0-9][a-z0-9._-]{0,120}\.(jpg|jpeg|png|webp|avif)$/i;

/** Streams admin-uploaded photos straight out of Postgres. */
export async function GET(_req: Request, context: { params: Promise<{ name: string }> }) {
  const { name } = await context.params;
  if (!SAFE_NAME.test(name)) return new NextResponse("Not found", { status: 404 });

  const stored = await readStoredImage(name);
  if (!stored) return new NextResponse("Not found", { status: 404 });

  const body = new Uint8Array(stored.bytes.length);
  body.set(stored.bytes);

  return new NextResponse(body.buffer as ArrayBuffer, {
    headers: {
      "Content-Type": stored.mime,
      "Content-Length": String(stored.bytes.length),
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
