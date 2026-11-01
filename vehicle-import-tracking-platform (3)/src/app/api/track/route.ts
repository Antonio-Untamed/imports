import { NextResponse } from "next/server";
import { findOrderRef, getOrderByRef } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const q = sp.get("ref")?.trim() ?? sp.get("q")?.trim() ?? "";
  if (!q) return NextResponse.json({ error: "Provide a tracking reference or passcode" }, { status: 400 });

  const resolved = await findOrderRef(q);
  if (!resolved) return NextResponse.json({ error: `No shipment matches “${q}”`, found: false }, { status: 404 });

  const order = await getOrderByRef(resolved);
  if (!order) return NextResponse.json({ error: "No shipment matches that reference", found: false }, { status: 404 });
  return NextResponse.json({ found: true, order });
}
