import { NextResponse } from "next/server";
import { toggleReaction } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = Number(body.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    const handle = String(body.handle ?? "guest").trim().slice(0, 40) || "guest";
    const type = String(body.type ?? "like");
    const result = await toggleReaction(id, handle, type);
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update the reaction" },
      { status: 500 }
    );
  }
}
