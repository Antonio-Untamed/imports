import { NextResponse } from "next/server";
import { db } from "@/db";
import { orders, vehicles } from "@/db/schema";
import { sql } from "drizzle-orm";
import { createVehicle, requireAdmin, validateVehicle, type VehiclePayload } from "@/lib/admin";
import { ensureReady } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
  await ensureReady();
  const rows = await db
    .select({
      vehicle: vehicles,
      orders: sql<number>`(select count(*) from ${orders} where ${orders.vehicleId} = ${vehicles.id})`,
    })
    .from(vehicles)
    .orderBy(sql`${vehicles.id} desc`);
  return NextResponse.json({
    count: rows.length,
    vehicles: rows.map((r) => ({ ...r.vehicle, orderCount: Number(r.orders) })),
  });
}

export async function POST(req: Request) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
  try {
    const body = (await req.json()) as VehiclePayload;
    const problem = validateVehicle(body);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const created = await createVehicle(body);
    return NextResponse.json({ vehicle: created }, { status: 201 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not save the unit" },
      { status: 500 }
    );
  }
}
