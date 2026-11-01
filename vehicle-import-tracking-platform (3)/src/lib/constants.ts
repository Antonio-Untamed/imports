export const USD_TO_KES = 129.5;

export const BRAND = {
  name: "Bandari Motors",
  short: "Bandari",
  tagline: "Japan · UK · UAE → Mombasa → Your gate",
  phone: "+254 799 007 101",
  whatsapp: "254799007101",
  email: "cargo@bandarimotors.co.ke",
  office: "Barichi Road, Industrial Area, Nairobi",
  port: "Kilindini Harbour, Mombasa",
};

export type StageKind =
  | "order"
  | "sourcing"
  | "inspection"
  | "loading"
  | "transit"
  | "arrival"
  | "clearing"
  | "release"
  | "inland"
  | "delivery";

export type Stage = {
  key: StageKind;
  label: string;
  short: string;
  place: string;
  detail: string;
  window: string;
};

/** The 10-step pipeline every Bandari import walks through. */
export const STAGES: Stage[] = [
  {
    key: "order",
    label: "Order placed & deposit secured",
    short: "Order placed",
    place: "Nairobi, KE",
    detail:
      "Sales agreement signed, deposit received and the vehicle is soft-reserved in your name.",
    window: "Day 0",
  },
  {
    key: "sourcing",
    label: "Bought at auction in Japan",
    short: "Auction bid won",
    place: "Yokohama, JP",
    detail:
      "Our Yokohama desk bids on USS / CAA / TAA on your behalf. Auction sheet and grade report are uploaded to your order.",
    window: "Day 3 – 7",
  },
  {
    key: "inspection",
    label: "Pre-shipment inspection (QISJ / JEVIC)",
    short: "Inspection passed",
    place: "Yokohama, JP",
    detail:
      "KEBS-mandated roadworthiness & conformity inspection. Certificate of Inspection (CoI) issued before loading.",
    window: "Day 10 – 14",
  },
  {
    key: "loading",
    label: "Loaded — RoRo or container stuffing",
    short: "Loaded on vessel",
    place: "Port of Yokohama",
    detail:
      "Vehicle driven onto the vessel or stuffed into a 40ft container with your spare parts and accessories.",
    window: "Day 16 – 20",
  },
  {
    key: "transit",
    label: "Ocean transit — Indian Ocean",
    short: "At sea",
    place: "Indian Ocean",
    detail:
      "Vessel underway via Singapore / Colombo. Bill of Lading issued and shared to your tracking page.",
    window: "Day 20 – 45",
  },
  {
    key: "arrival",
    label: "Arrived Mombasa — Kilindini Harbour",
    short: "Discharged Mombasa",
    place: "Mombasa, KE",
    detail:
      "Vessel berthed, cargo discharged to the KPA terminal and the manifest reconciled against your BL.",
    window: "Day 45 – 48",
  },
  {
    key: "clearing",
    label: "Customs clearing with KRA (iCMS)",
    short: "Clearing in progress",
    place: "Mombasa, KE",
    detail:
      "Entry lodged on iCMS, valuation done, IDF/RDL and duty assessed. Clearing agent submits documents.",
    window: "Day 48 – 55",
  },
  {
    key: "release",
    label: "Duty paid & released",
    short: "Released by KRA",
    place: "Mombasa, KE",
    detail:
      "Import duty, excise, VAT and levies settled. Release order issued, port charges paid and gate pass printed.",
    window: "Day 55 – 58",
  },
  {
    key: "inland",
    label: "Inland transit to your city",
    short: "On the road",
    place: "Mombasa – Nairobi",
    detail:
      "Car carrier or self-drive up the Nairobi Expressway. Live location updates shared to your order thread.",
    window: "Day 58 – 61",
  },
  {
    key: "delivery",
    label: "Registered, plated & handed over",
    short: "Delivered",
    place: "Nairobi, KE",
    detail:
      "NTSA registration, number plates fitted, logbook processed and keys handed over with a full walk-around.",
    window: "Day 61 – 70",
  },
];

export const STAGE_BY_KEY = Object.fromEntries(STAGES.map((s, i) => [s.key, i])) as Record<
  StageKind,
  number
>;

export const DELIVERY_MODES = [
  {
    id: "mombasa_port",
    label: "Collect at Mombasa port",
    note: "You clear and pick up at Kilindini. We handle documents.",
    feeKes: 0,
  },
  {
    id: "nairobi_inland",
    label: "Inland delivery — Nairobi",
    note: "Car carrier Mombasa → Nairobi, offloaded at our Barichi Rd yard.",
    feeKes: 42000,
  },
  {
    id: "doorstep",
    label: "Doorstep, anywhere in Kenya",
    note: "Cleared, registered and driven to your gate in any town.",
    feeKes: 78000,
  },
] as const;

export const PAYMENT_PLANS = [
  {
    id: "deposit",
    label: "30% deposit, balance on release",
    note: "Most popular. Balance due once KRA releases the car in Mombasa.",
  },
  {
    id: "installments",
    label: "Milestone instalments",
    note: "30% on order · 30% at loading · 40% on release.",
  },
  {
    id: "full",
    label: "Pay in full upfront",
    note: "1.5% discount on the total landed cost.",
  },
] as const;

export const FIXED_COSTS = {
  clearingAgentKes: 48000,
  portChargesKes: 31500,
  qisjInspectionUsd: 110,
  registrationKes: 17850,
  ntsaVinspectionKes: 6500,
};

export const NAV_LINKS = [
  { href: "/marketplace", label: "Inventory" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/track", label: "Track shipment" },
  { href: "/dashboard", label: "My orders" },
  { href: "/community", label: "Community" },
];

export const MAKES = [
  "Toyota",
  "Subaru",
  "Mazda",
  "Nissan",
  "Honda",
  "Mitsubishi",
  "Isuzu",
  "Kia",
  "Volkswagen",
];

export const BODY_TYPES = ["SUV", "Pickup", "Hatchback", "Wagon", "Sedan", "Van", "Crossover"];

/* ------------------------------------------------------------------ *
 * KRA valuation & tax schedule (CRSP revised July 2025)
 * ------------------------------------------------------------------ */

/** Admin console gate. Override with the ADMIN_PIN environment variable. */
export const ADMIN_PIN = process.env.ADMIN_PIN ?? "bandari2026";

/** Import duty under the EAC Common External Tariff. */
export const IMPORT_DUTY_RATE = 0.25;
export const IMPORT_DUTY_RATE_ALT = 0.35;

/**
 * KRA depreciation on the Current Retail Selling Price for direct imports,
 * by age in years from first registration. Capped at 65% (8-year rule).
 */
export const CRSP_DEPRECIATION: Array<{ age: number; rate: number; label: string }> = [
  { age: 0, rate: 0, label: "Under 1 year" },
  { age: 1, rate: 0.1, label: "1 year" },
  { age: 2, rate: 0.2, label: "2 years" },
  { age: 3, rate: 0.3, label: "3 years" },
  { age: 4, rate: 0.4, label: "4 years" },
  { age: 5, rate: 0.5, label: "5 years" },
  { age: 6, rate: 0.55, label: "6 years" },
  { age: 7, rate: 0.6, label: "7 years" },
  { age: 8, rate: 0.65, label: "8 years (maximum allowed)" },
];

export function depreciationForAge(age: number): number {
  const a = Math.max(0, Math.min(8, Math.floor(age)));
  return CRSP_DEPRECIATION[a].rate;
}

/** Excise duty bands — revised schedule, by fuel and engine capacity. */
export const EXCISE_BANDS = [
  { fuel: "petrol", maxCc: 1500, rate: 0.2 },
  { fuel: "petrol", maxCc: 2000, rate: 0.25 },
  { fuel: "petrol", maxCc: 3000, rate: 0.3 },
  { fuel: "petrol", maxCc: Infinity, rate: 0.35 },
  { fuel: "diesel", maxCc: 2500, rate: 0.25 },
  { fuel: "diesel", maxCc: Infinity, rate: 0.35 },
  { fuel: "hybrid", maxCc: Infinity, rate: 0 },
  { fuel: "electric", maxCc: Infinity, rate: 0 },
];

export const IDF_RATE = 0.035;
export const IDF_MIN = 5_000;
export const IDF_MAX = 5_000_000;
export const RDL_RATE = 0.02;
export const RDL_MIN = 500;
export const VAT_RATE = 0.16;

export const CRSP_SOURCE = "KRA CRSP schedule, revised July 2025 (5,200+ models)";

/** Builds a wa.me deep link that lands the message straight in the office chat. */
export function waLink(message: string, phone: string = BRAND.whatsapp): string {
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

