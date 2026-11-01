import { NextResponse } from "next/server";
import { listInquiries, requireAdmin } from "@/lib/admin";
import { BRAND, waLink } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
  const rows = await listInquiries();
  return NextResponse.json({
    count: rows.length,
    whatsapp: BRAND.whatsapp,
    phone: BRAND.phone,
    inquiries: rows.map((r) => ({
      ...r,
      waLink: waLink(`Callback request (${r.topic}) — ${r.name} · ${r.contact}\n\n${r.message}`),
    })),
  });
}
