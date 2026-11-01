import { NextResponse } from "next/server";
import { deleteVehicle, requireAdmin, updateVehicle, validateVehicle, type VehiclePayload } from "@/lib/admin";

export const dynamic = "force-dynamic";

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: Request, context: Ctx) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
  const { id } = await context.params;
  try {
    const body = (await req.json()) as VehiclePayload;
    const problem = validateVehicle(body);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    const updated = await updateVehicle(Number(id), body);
    if (!updated) return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    return NextResponse.json({ vehicle: updated });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not update the unit" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: Ctx) {
  if (!requireAdmin(req)) return NextResponse.json({ error: "Invalid admin PIN" }, { status: 401 });
  const { id } = await context.params;
  try {
    const removed = await deleteVehicle(Number(id));
    if (!removed) return NextResponse.json({ error: "Unit not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Could not delete the unit" },
      { status: 409 }
    );
  }
}
