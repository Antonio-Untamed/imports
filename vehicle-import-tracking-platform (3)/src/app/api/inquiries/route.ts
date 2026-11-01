import { NextResponse } from "next/server";
import { createInquiry } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const contact = String(body.contact ?? "").trim();
    const message = String(body.message ?? "").trim();
    if (name.length < 2 || contact.length < 3 || message.length < 5) {
      return NextResponse.json({ error: "Name, contact and a short message are required" }, { status: 400 });
    }
    const id = await createInquiry({ name, contact, message, topic: String(body.topic ?? "general") });
    return NextResponse.json({ id, ok: true }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save your request" },
      { status: 500 }
    );
  }
}
