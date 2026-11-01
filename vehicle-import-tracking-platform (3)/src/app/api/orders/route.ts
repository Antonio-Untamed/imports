import { NextResponse } from "next/server";
import { createOrder, listOrders } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const refs = sp.get("refs")?.split(",").map((r) => r.trim()).filter(Boolean);
  const orders = await listOrders(refs && refs.length ? refs : undefined);
  return NextResponse.json({ count: orders.length, orders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const required = ["vehicleId", "name", "email", "phone"];
    for (const key of required) {
      if (body[key] === undefined || String(body[key]).trim() === "") {
        return NextResponse.json({ error: `${key} is required` }, { status: 400 });
      }
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(body.email))) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    const result = await createOrder({
      vehicleId: Number(body.vehicleId),
      name: String(body.name),
      email: String(body.email),
      phone: String(body.phone),
      kraPin: String(body.kraPin ?? ""),
      city: String(body.city ?? "Nairobi"),
      paymentPlan: String(body.paymentPlan ?? "deposit"),
      deliveryMode: String(body.deliveryMode ?? "nairobi_inland"),
      destinationCity: String(body.destinationCity ?? body.city ?? "Nairobi"),
      notes: String(body.notes ?? ""),
    });
    return NextResponse.json(result, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not create the order" },
      { status: 500 }
    );
  }
}
