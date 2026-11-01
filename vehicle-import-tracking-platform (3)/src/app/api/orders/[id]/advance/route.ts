import { NextResponse } from "next/server";
import { advanceOrder } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const order = await advanceOrder(Number(id));
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not advance the shipment" },
      { status: 500 }
    );
  }
}
