import {
  CRSP_DEPRECIATION,
  FIXED_COSTS,
  IDF_MAX,
  IDF_MIN,
  IDF_RATE,
  IMPORT_DUTY_RATE,
  RDL_MIN,
  RDL_RATE,
  USD_TO_KES,
  VAT_RATE,
  depreciationForAge,
} from "./constants";

export type DutyInput = {
  fobUsd: number;
  freightUsd: number;
  insuranceUsd: number;
  engineCc: number;
  fuel: string;
  /** KRA Current Retail Selling Price for this model, in KES. */
  crspKes?: number;
  /** Year of first registration — drives CRSP depreciation. */
  year?: number;
  /** EAC CET rate. 25% standard, 35% for bands raised in FY2026/27. */
  importDutyRate?: number;
  deliveryFeeKes?: number;
  fx?: number;
};

export type DutyLine = { label: string; hint: string; amountKes: number };

export type DutyResult = {
  fx: number;
  /** Declared transaction value: vehicle + freight + insurance. */
  cifKes: number;
  /** KRA list price before depreciation. */
  crspKes: number;
  ageYears: number;
  depreciationPct: number;
  /** CRSP after age depreciation. */
  crspAdjusted: number;
  /** The value duty is actually charged on — higher of CIF and depreciated CRSP. */
  customsValueKes: number;
  basis: "CIF" | "CRSP";
  /** How much more the CRSP basis costs the client than their invoice. */
  valuationUpliftKes: number;
  importDutyRate: number;
  importDuty: number;
  exciseDuty: number;
  exciseRate: number;
  idf: number;
  rdl: number;
  vat: number;
  fixed: DutyLine[];
  totalTaxKes: number;
  totalLandedKes: number;
  totalUsd: number;
  effectiveRatePct: number;
  breakdown: DutyLine[];
  valuation: DutyLine[];
};

/** KRA excise duty bands — revised schedule, by fuel and engine capacity. */
export function exciseRateFor(cc: number, fuel: string): number {
  const f = fuel.toLowerCase();
  if (f === "electric" || f === "hybrid") return 0;
  if (f === "diesel") return cc <= 2500 ? 0.25 : 0.35;
  if (cc <= 1500) return 0.2;
  if (cc <= 2000) return 0.25;
  if (cc <= 3000) return 0.3;
  return 0.35;
}

export function vehicleAge(year?: number, now: number = new Date().getFullYear()): number {
  if (!year) return 0;
  return Math.max(0, now - year);
}

export function depreciateCrsp(crspKes: number, year?: number) {
  const age = vehicleAge(year);
  const rate = depreciationForAge(age);
  return { age, rate, adjusted: Math.round(crspKes * (1 - rate)) };
}

export function calculateDuty(input: DutyInput): DutyResult {
  const fx = input.fx ?? USD_TO_KES;
  const fob = Math.max(0, input.fobUsd);
  const freight = Math.max(0, input.freightUsd);
  const insurance = Math.max(0, input.insuranceUsd);

  const cifUsd = fob + freight + insurance;
  const cifKes = Math.round(cifUsd * fx);

  // ── KRA valuation: higher of the declared CIF and the depreciated CRSP ──
  const crspKes = Math.max(0, Math.round(input.crspKes ?? 0));
  const { age, rate: depRate, adjusted: crspAdjusted } = depreciateCrsp(crspKes, input.year);
  const crspGoverns = crspKes > 0 && crspAdjusted > cifKes;
  const customsValueKes = crspGoverns ? crspAdjusted : cifKes;
  const basis: "CIF" | "CRSP" = crspGoverns ? "CRSP" : "CIF";

  const importDutyRate = input.importDutyRate ?? IMPORT_DUTY_RATE;
  const importDuty = Math.round(customsValueKes * importDutyRate);

  const exciseRate = exciseRateFor(input.engineCc, input.fuel);
  const exciseDuty = Math.round((customsValueKes + importDuty) * exciseRate);

  const idf = Math.round(Math.min(IDF_MAX, Math.max(IDF_MIN, customsValueKes * IDF_RATE)));
  const rdl = Math.round(Math.max(RDL_MIN, customsValueKes * RDL_RATE));

  const vatBase = customsValueKes + importDuty + exciseDuty + idf + rdl;
  const vat = Math.round(vatBase * VAT_RATE);

  const totalTaxKes = importDuty + exciseDuty + idf + rdl + vat;

  const fixed: DutyLine[] = [
    {
      label: "Clearing & forwarding agent",
      hint: "Licensed KRA agent, iCMS entry & documentation",
      amountKes: FIXED_COSTS.clearingAgentKes,
    },
    {
      label: "Port & terminal charges",
      hint: "KPA handling, wharfage and gate pass",
      amountKes: FIXED_COSTS.portChargesKes,
    },
    {
      label: "QISJ / JEVIC inspection",
      hint: "Pre-shipment roadworthiness certificate",
      amountKes: Math.round(FIXED_COSTS.qisjInspectionUsd * fx),
    },
    {
      label: "NTSA registration & plates",
      hint: "Logbook, number plates and TIMS entry",
      amountKes: FIXED_COSTS.registrationKes,
    },
    {
      label: "Vehicle inspection (Mombasa)",
      hint: "Verification on arrival",
      amountKes: FIXED_COSTS.ntsaVinspectionKes,
    },
  ];

  const deliveryFeeKes = input.deliveryFeeKes ?? 0;
  const fixedTotal = fixed.reduce((s, l) => s + l.amountKes, 0);
  const totalLandedKes = customsValueKes + totalTaxKes + fixedTotal + deliveryFeeKes;

  const valuation: DutyLine[] = [
    { label: "Declared CIF value", hint: "Invoice + freight + insurance to Mombasa", amountKes: cifKes },
    ...(crspKes > 0
      ? [
          { label: "KRA CRSP (list)", hint: "Current Retail Selling Price, revised schedule", amountKes: crspKes },
          {
            label: `Age depreciation (${Math.round(depRate * 100)}%)`,
            hint: `${age} year${age === 1 ? "" : "s"} from first registration`,
            amountKes: -Math.round(crspKes * depRate),
          },
          { label: "Depreciated CRSP", hint: "CRSP less the age allowance", amountKes: crspAdjusted },
        ]
      : []),
    {
      label: "Customs value applied",
      hint: crspKes > 0 ? `KRA takes the higher of CIF and depreciated CRSP → ${basis}` : "No CRSP on file — CIF used",
      amountKes: customsValueKes,
    },
  ];

  const breakdown: DutyLine[] = [
    {
      label: `Customs value (${basis})`,
      hint:
        basis === "CRSP"
          ? `Depreciated CRSP ${crspAdjusted.toLocaleString()} beats your CIF ${cifKes.toLocaleString()}`
          : "Your declared CIF governs — CRSP is lower",
      amountKes: customsValueKes,
    },
    {
      label: `Import duty (${Math.round(importDutyRate * 100)}%)`,
      hint: "EAC Common External Tariff on the customs value",
      amountKes: importDuty,
    },
    {
      label: `Excise duty (${Math.round(exciseRate * 100)}%)`,
      hint: `${input.engineCc}cc · ${input.fuel} · on customs value + import duty`,
      amountKes: exciseDuty,
    },
    { label: `IDF (${Math.round(IDF_RATE * 1000) / 10}%)`, hint: "Import Declaration Fee", amountKes: idf },
    { label: `RDL (${Math.round(RDL_RATE * 100)}%)`, hint: "Railway Development Levy", amountKes: rdl },
    { label: `VAT (${Math.round(VAT_RATE * 100)}%)`, hint: "On customs value + duty + excise + levies", amountKes: vat },
    ...fixed,
    ...(deliveryFeeKes > 0
      ? [{ label: "Inland delivery", hint: "Mombasa to your town", amountKes: deliveryFeeKes }]
      : []),
  ];

  return {
    fx,
    cifKes,
    crspKes,
    ageYears: age,
    depreciationPct: depRate,
    crspAdjusted,
    customsValueKes,
    basis,
    valuationUpliftKes: Math.max(0, customsValueKes - cifKes),
    importDutyRate,
    importDuty,
    exciseDuty,
    exciseRate,
    idf,
    rdl,
    vat,
    fixed,
    totalTaxKes,
    totalLandedKes,
    totalUsd: Math.round((totalLandedKes / fx) * 100) / 100,
    effectiveRatePct: customsValueKes > 0 ? Math.round((totalTaxKes / customsValueKes) * 1000) / 10 : 0,
    breakdown,
    valuation,
  };
}

export function formatKes(value: number): string {
  const abs = Math.abs(Math.round(value));
  const sign = value < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}KES ${(abs / 1_000_000).toFixed(2)}M`;
  if (abs >= 10_000) return `${sign}KES ${Math.round(abs / 1000)}K`;
  return `${sign}KES ${abs.toLocaleString("en-KE")}`;
}

export function formatKesFull(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}KES ${Math.abs(Math.round(value)).toLocaleString("en-KE")}`;
}

export function formatUsd(value: number): string {
  return `USD ${Math.round(value).toLocaleString("en-US")}`;
}

export { CRSP_DEPRECIATION };
