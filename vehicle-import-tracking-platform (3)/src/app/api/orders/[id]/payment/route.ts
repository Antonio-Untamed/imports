import { NextResponse } from "next/server";
import { recordPayment } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  try {
    const body = await req.json();
    const amount = Number(body.amountKes);
    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json({ error: "Enter an amount greater than zero" }, { status: 400 });
    }
    const order = await recordPayment(Number(id), amount, String(body.method ?? "M-Pesa"));
    return NextResponse.json({ order });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not record the payment" },
      { status: 500 }
    );
  }
}
