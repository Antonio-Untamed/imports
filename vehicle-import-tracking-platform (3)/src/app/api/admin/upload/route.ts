import { NextResponse } from "next/server";
import { requireAdmin, saveUploadedImage } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
  try {
    const form = await req.formData();
    const file = form.get("file");
    if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    const url = await saveUploadedImage(file);
    return NextResponse.json({ url, name: file.name, size: file.size }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 400 }
    );
  }
}
