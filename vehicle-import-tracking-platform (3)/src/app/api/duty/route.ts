import { NextResponse } from "next/server";
import { calculateDuty } from "@/lib/duty";
import { DELIVERY_MODES } from "@/lib/constants";

export const dynamic = "force-dynamic";

type Payload = {
  fobUsd?: number;
  freightUsd?: number;
  insuranceUsd?: number;
  engineCc?: number;
  fuel?: string;
  /** KRA Current Retail Selling Price for the model, in KES. */
  crspKes?: number;
  /** Year of first registration — drives CRSP age depreciation. */
  year?: number;
  /** EAC CET rate: 0.25 standard, 0.35 for bands raised in FY2026/27. */
  importDutyRate?: number;
  deliveryMode?: string;
  fx?: number;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Payload;
    const deliveryFeeKes = DELIVERY_MODES.find((m) => m.id === body.deliveryMode)?.feeKes ?? 0;
    const result = calculateDuty({
      fobUsd: Number(body.fobUsd ?? 0),
      freightUsd: Number(body.freightUsd ?? 0),
      insuranceUsd: Number(body.insuranceUsd ?? 0),
      engineCc: Number(body.engineCc ?? 1500),
      fuel: String(body.fuel ?? "petrol"),
      crspKes: Number(body.crspKes ?? 0),
      year: body.year ? Number(body.year) : undefined,
      importDutyRate: body.importDutyRate ? Number(body.importDutyRate) : undefined,
      deliveryFeeKes,
      fx: body.fx ? Number(body.fx) : undefined,
    });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Invalid calculation request" },
      { status: 400 }
    );
  }
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  return POST(new Request(req.url, { method: "POST", body: JSON.stringify(Object.fromEntries(sp)) }));
}
