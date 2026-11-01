import { NextResponse } from "next/server";
import { listVehicles, type VehicleFilters } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  const num = (k: string) => {
    const v = sp.get(k);
    return v && !Number.isNaN(Number(v)) ? Number(v) : undefined;
  };
  const filters: VehicleFilters = {
    q: sp.get("q") ?? undefined,
    make: sp.get("make") ?? undefined,
    bodyType: sp.get("body") ?? undefined,
    fuel: sp.get("fuel") ?? undefined,
    origin: sp.get("origin") ?? undefined,
    minYear: num("minYear"),
    maxYear: num("maxYear"),
    maxLanded: num("maxLanded"),
    sort: sp.get("sort") ?? undefined,
    limit: num("limit"),
  };
  const results = await listVehicles(filters);
  return NextResponse.json({ count: results.length, vehicles: results });
}
