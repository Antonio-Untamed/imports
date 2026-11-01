import { NextResponse } from "next/server";
import { createEngagement } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const authorName = String(body.authorName ?? "").trim();
    const text = String(body.body ?? "").trim();

    if (authorName.length < 2) {
      return NextResponse.json({ error: "Tell us your name so the desk knows who is asking" }, { status: 400 });
    }
    if (text.length < 2) {
      return NextResponse.json({ error: "Write something first" }, { status: 400 });
    }

    const post = await createEngagement({
      orderId: body.orderId ? Number(body.orderId) : null,
      parentId: body.parentId ? Number(body.parentId) : null,
      authorName,
      body: text,
      imageUrl: body.imageUrl ? String(body.imageUrl) : null,
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save the post" },
      { status: 500 }
    );
  }
}
