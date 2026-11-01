import { eq } from "drizzle-orm";
import { db } from "./index";
import { clients, engagements, orders, shipmentEvents, vehicles } from "./schema";
import { calculateDuty } from "@/lib/duty";
import { DELIVERY_MODES, STAGES } from "@/lib/constants";

type PostSeed = {
  ref?: string;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  body: string;
  imageUrl: string | null;
  reactions: Record<string, number>;
  pinned?: boolean;
  daysAgo: number;
  replyTo?: string;
};

const IMG = {
  rav4: "https://images.pexels.com/photos/2036544/pexels-photo-2036544.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  blackSuv:
    "https://images.pexels.com/photos/33532868/pexels-photo-33532868.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  whiteSuv:
    "https://images.pexels.com/photos/31775318/pexels-photo-31775318.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  blueSuv:
    "https://images.pexels.com/photos/31501638/pexels-photo-31501638.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  sportage:
    "https://images.pexels.com/photos/27286179/pexels-photo-27286179.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  sunsetSuv:
    "https://images.pexels.com/photos/33980827/pexels-photo-33980827.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  redSuv:
    "https://images.pexels.com/photos/13767773/pexels-photo-13767773.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  whiteToyota:
    "https://images.pexels.com/photos/13598897/pexels-photo-13598897.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  peugeot:
    "https://images.pexels.com/photos/20667627/pexels-photo-20667627.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ranger:
    "https://images.pexels.com/photos/16058149/pexels-photo-16058149.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  tundra:
    "https://images.pexels.com/photos/5661743/pexels-photo-5661743.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  triton:
    "https://images.pexels.com/photos/21517574/pexels-photo-21517574.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  tritonWater:
    "https://images.pexels.com/photos/21517573/pexels-photo-21517573.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  blackPickup:
    "https://images.pexels.com/photos/28316226/pexels-photo-28316226.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  mudPickup:
    "https://images.pexels.com/photos/10196543/pexels-photo-10196543.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  auris:
    "https://images.pexels.com/photos/35016609/pexels-photo-35016609.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  focus:
    "https://images.pexels.com/photos/27138903/pexels-photo-27138903.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  civic:
    "https://images.pexels.com/photos/12821565/pexels-photo-12821565.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  ship: "https://images.pexels.com/photos/12841119/pexels-photo-12841119.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  shipCranes:
    "https://images.pexels.com/photos/1211787/pexels-photo-1211787.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  portSunset:
    "https://images.pexels.com/photos/38393808/pexels-photo-38393808.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  portColor:
    "https://images.pexels.com/photos/31244440/pexels-photo-31244440.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  nairobi:
    "https://images.pexels.com/photos/37993590/pexels-photo-37993590.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  nairobiSky:
    "https://images.pexels.com/photos/15496542/pexels-photo-15496542.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
  nairobiRoad:
    "https://images.pexels.com/photos/10154857/pexels-photo-10154857.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200",
};

type VehicleSeed = {
  slug: string;
  stockRef: string;
  make: string;
  model: string;
  trim: string;
  year: number;
  mileageKm: number;
  engineCc: number;
  fuel: string;
  transmission: string;
  drivetrain: string;
  bodyType: string;
  color: string;
  seats: number;
  origin: string;
  sourceNote: string;
  grade: string;
  heroImage: string;
  gallery: string[];
  features: string[];
  summary: string;
  fobUsd: number;
  freightUsd: number;
  insuranceUsd: number;
  transitDays: number;
  status: string;
  popularity: number;
};

const VEHICLE_SEED: VehicleSeed[] = [
  {
    slug: "toyota-rav4-x-4wd-2020",
    stockRef: "BM-JP-4412",
    make: "Toyota",
    model: "RAV4",
    trim: "X 2.0 4WD",
    year: 2020,
    mileageKm: 42800,
    engineCc: 1986,
    fuel: "petrol",
    transmission: "CVT",
    drivetrain: "4WD",
    bodyType: "SUV",
    color: "Pearl White",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Tokyo — Lot 4412",
    grade: "Grade 4.5 · Interior B",
    heroImage: IMG.rav4,
    gallery: [IMG.rav4, IMG.whiteSuv, IMG.sunsetSuv],
    features: [
      "Toyota Safety Sense",
      "Adaptive cruise control",
      "360° parking camera",
      "Heated front seats",
      "Power tailgate",
      "18-inch alloys",
    ],
    summary:
      "The Nairobi favourite. Clean 4.5 grade auction sheet, one owner, full Toyota service history and no accident repair marks anywhere on the chassis.",
    fobUsd: 19500,
    freightUsd: 1450,
    insuranceUsd: 215,
    transitDays: 38,
    status: "available",
    popularity: 96,
  },
  {
    slug: "toyota-harrier-premium-2019",
    stockRef: "BM-JP-7781",
    make: "Toyota",
    model: "Harrier",
    trim: "2.0 Premium Advanced",
    year: 2019,
    mileageKm: 51300,
    engineCc: 1998,
    fuel: "petrol",
    transmission: "CVT",
    drivetrain: "2WD",
    bodyType: "SUV",
    color: "Black",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Nagoya — Lot 7781",
    grade: "Grade 4.5 · Interior B",
    heroImage: IMG.blackSuv,
    gallery: [IMG.blackSuv, IMG.peugeot, IMG.sunsetSuv],
    features: [
      "JBL premium audio",
      "Panoramic roof",
      "Leather interior",
      "Blind spot monitor",
      "Lane keep assist",
      "Memory driver seat",
    ],
    summary:
      "Executive cruiser spec with panoramic roof and JBL sound. Interior is near-new — auction sheet notes no cigarette smell and no pet transport.",
    fobUsd: 21800,
    freightUsd: 1450,
    insuranceUsd: 240,
    transitDays: 38,
    status: "available",
    popularity: 88,
  },
  {
    slug: "subaru-forester-x-break-2019",
    stockRef: "BM-JP-2205",
    make: "Subaru",
    model: "Forester",
    trim: "2.0i-S X-Break AWD",
    year: 2019,
    mileageKm: 58900,
    engineCc: 1995,
    fuel: "petrol",
    transmission: "CVT (Lineartronic)",
    drivetrain: "AWD",
    bodyType: "SUV",
    color: "Crystal White",
    seats: 5,
    origin: "Japan",
    sourceNote: "CAA Tokyo — Lot 2205",
    grade: "Grade 4 · Interior B",
    heroImage: IMG.whiteSuv,
    gallery: [IMG.whiteSuv, IMG.mudPickup, IMG.sunsetSuv],
    features: [
      "Symmetrical AWD",
      "X-Mode off-road assist",
      "EyeSight driver assist",
      "Water-repellent seats",
      "Roof rails",
      "Rear gate lamp",
    ],
    summary:
      "Built for Nanyuki, Naivasha and the murram beyond. X-Break trim gets waterproof cargo lining and orange stitching — a genuine rough-road spec.",
    fobUsd: 13900,
    freightUsd: 1500,
    insuranceUsd: 165,
    transitDays: 38,
    status: "available",
    popularity: 74,
  },
  {
    slug: "mazda-cx5-xd-diesel-2019",
    stockRef: "BM-JP-5540",
    make: "Mazda",
    model: "CX-5",
    trim: "XD PROACTIVE Diesel",
    year: 2019,
    mileageKm: 63500,
    engineCc: 2191,
    fuel: "diesel",
    transmission: "6AT Skyactiv",
    drivetrain: "AWD",
    bodyType: "Crossover",
    color: "Soul Red",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Osaka — Lot 5540",
    grade: "Grade 4 · Interior B",
    heroImage: IMG.blueSuv,
    gallery: [IMG.blueSuv, IMG.redSuv, IMG.peugeot],
    features: [
      "Skyactiv-D 2.2 turbo diesel",
      "Bose 10-speaker audio",
      "Head-up display",
      "Adaptive LED headlights",
      "Power liftgate",
      "i-Activ AWD",
    ],
    summary:
      "Torque-rich diesel with excellent long-run economy on the Nairobi–Mombasa highway. 25% excise band keeps the landed cost friendlier than a big petrol.",
    fobUsd: 12400,
    freightUsd: 1450,
    insuranceUsd: 150,
    transitDays: 38,
    status: "available",
    popularity: 69,
  },
  {
    slug: "kia-sportage-gt-line-2020",
    stockRef: "BM-AE-1187",
    make: "Kia",
    model: "Sportage",
    trim: "2.0 GT-Line AWD",
    year: 2020,
    mileageKm: 38700,
    engineCc: 1999,
    fuel: "petrol",
    transmission: "6AT",
    drivetrain: "AWD",
    bodyType: "SUV",
    color: "Snow White Pearl",
    seats: 5,
    origin: "UAE",
    sourceNote: "GCC spec — Dubai, single owner",
    grade: "Bandari 128-point check",
    heroImage: IMG.sportage,
    gallery: [IMG.sportage, IMG.sunsetSuv, IMG.whiteSuv],
    features: [
      "GCC cooling package",
      "Ventilated seats",
      "Wireless charging",
      "Apple CarPlay / Android Auto",
      "Panoramic sunroof",
      "Rear cross-traffic alert",
    ],
    summary:
      "Direct from Dubai with 26-day transit instead of 38. GCC spec means heavier air-con and radiator — already matched to Kenyan conditions.",
    fobUsd: 13200,
    freightUsd: 1250,
    insuranceUsd: 160,
    transitDays: 26,
    status: "available",
    popularity: 81,
  },
  {
    slug: "toyota-hilux-double-cab-4x4-2019",
    stockRef: "BM-JP-9034",
    make: "Toyota",
    model: "Hilux",
    trim: "Double Cab 2.8 GD-6 4x4",
    year: 2019,
    mileageKm: 71400,
    engineCc: 2755,
    fuel: "diesel",
    transmission: "6AT",
    drivetrain: "4x4 (part-time)",
    bodyType: "Pickup",
    color: "Attitude Black",
    seats: 5,
    origin: "Japan",
    sourceNote: "TAA Kyushu — Lot 9034",
    grade: "Grade 4 · Interior C",
    heroImage: IMG.ranger,
    gallery: [IMG.ranger, IMG.mudPickup, IMG.blackPickup],
    features: [
      "Rear diff lock",
      "Heavy-duty suspension",
      "Tow bar & wiring",
      "Line-x bed liner",
      "Snorkel-ready intake",
      "Steel underbody guards",
    ],
    summary:
      "Farm and site workhorse. Bed liner, tow bar and diff lock fitted. Chassis is straight with only cosmetic stone chips — see auction sheet photos.",
    fobUsd: 22500,
    freightUsd: 1650,
    insuranceUsd: 250,
    transitDays: 38,
    status: "reserved",
    popularity: 93,
  },
  {
    slug: "mitsubishi-l200-triton-2020",
    stockRef: "BM-JP-3311",
    make: "Mitsubishi",
    model: "L200 Triton",
    trim: "2.4 GSR 4WD",
    year: 2020,
    mileageKm: 47200,
    engineCc: 2442,
    fuel: "diesel",
    transmission: "6AT",
    drivetrain: "Super Select 4WD-II",
    bodyType: "Pickup",
    color: "Titanium Grey",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Yokohama — Lot 3311",
    grade: "Grade 4.5 · Interior B",
    heroImage: IMG.triton,
    gallery: [IMG.triton, IMG.tritonWater, IMG.mudPickup],
    features: [
      "Super Select 4WD-II",
      "Hill descent control",
      "Leather & heated seats",
      "Forward collision mitigation",
      "Bed roller cover",
      "Rear camera",
    ],
    summary:
      "Underrated value: Hilux mechanicals for materially less duty. 4.5 grade with a documented single-owner history in Hokkaido.",
    fobUsd: 15600,
    freightUsd: 1600,
    insuranceUsd: 185,
    transitDays: 38,
    status: "available",
    popularity: 66,
  },
  {
    slug: "isuzu-d-max-v-cross-2019",
    stockRef: "BM-JP-6620",
    make: "Isuzu",
    model: "D-Max",
    trim: "V-Cross 4x4",
    year: 2019,
    mileageKm: 82100,
    engineCc: 2499,
    fuel: "diesel",
    transmission: "6AT",
    drivetrain: "4x4",
    bodyType: "Pickup",
    color: "Silky White",
    seats: 5,
    origin: "Japan",
    sourceNote: "CAA Chiba — Lot 6620",
    grade: "Grade 4 · Interior C",
    heroImage: IMG.blackPickup,
    gallery: [IMG.blackPickup, IMG.mudPickup, IMG.ranger],
    features: [
      "Isuzu 4JJ3 diesel",
      "Roll bar & sports hoop",
      "Tonneau cover",
      "All-terrain tyres",
      "Cruise control",
      "Bluetooth audio",
    ],
    summary:
      "Parts availability in Kenya is unbeatable and resale holds. Higher mileage reflected honestly in the FOB price — mechanically inspected and sound.",
    fobUsd: 14200,
    freightUsd: 1600,
    insuranceUsd: 170,
    transitDays: 38,
    status: "available",
    popularity: 71,
  },
  {
    slug: "toyota-fielder-hybrid-2020",
    stockRef: "BM-JP-1195",
    make: "Toyota",
    model: "Corolla Fielder",
    trim: "1.5 Hybrid G",
    year: 2020,
    mileageKm: 34600,
    engineCc: 1497,
    fuel: "hybrid",
    transmission: "e-CVT",
    drivetrain: "2WD",
    bodyType: "Wagon",
    color: "Silver Metallic",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Tokyo — Lot 1195",
    grade: "Grade 5 · Interior A",
    heroImage: IMG.auris,
    gallery: [IMG.auris, IMG.focus, IMG.whiteToyota],
    features: [
      "Hybrid battery health 92%",
      "Flat-fold rear seats",
      "Rear parking sensors",
      "Keyless entry & start",
      "Auto climate control",
      "LED headlights",
    ],
    summary:
      "Grade 5 — the highest band we buy. Hybrid battery tested at 92% health before listing. The cheapest car to run per kilometre in this inventory.",
    fobUsd: 8900,
    freightUsd: 1250,
    insuranceUsd: 110,
    transitDays: 38,
    status: "available",
    popularity: 90,
  },
  {
    slug: "honda-fit-hybrid-2019",
    stockRef: "BM-JP-4408",
    make: "Honda",
    model: "Fit",
    trim: "1.5 Hybrid S",
    year: 2019,
    mileageKm: 46900,
    engineCc: 1498,
    fuel: "hybrid",
    transmission: "7-speed DCT",
    drivetrain: "2WD",
    bodyType: "Hatchback",
    color: "Premium Red",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Nagoya — Lot 4408",
    grade: "Grade 4.5 · Interior B",
    heroImage: IMG.civic,
    gallery: [IMG.civic, IMG.focus, IMG.auris],
    features: [
      "Magic Seats (ultra fold)",
      "i-DCD hybrid",
      "Cruise control",
      "Push start",
      "Alloy wheels",
      "Rear camera",
    ],
    summary:
      "Magic Seats fold completely flat — hauls a mattress from Ruaraka to Kilimani. Perfect first import or ride-hailing unit.",
    fobUsd: 7400,
    freightUsd: 1250,
    insuranceUsd: 95,
    transitDays: 38,
    status: "available",
    popularity: 84,
  },
  {
    slug: "nissan-note-epower-2020",
    stockRef: "BM-JP-8814",
    make: "Nissan",
    model: "Note",
    trim: "e-POWER X",
    year: 2020,
    mileageKm: 29800,
    engineCc: 1198,
    fuel: "hybrid",
    transmission: "Single-speed e-POWER",
    drivetrain: "2WD",
    bodyType: "Hatchback",
    color: "Dark Blue",
    seats: 5,
    origin: "Japan",
    sourceNote: "TAA Yokohama — Lot 8814",
    grade: "Grade 4.5 · Interior A",
    heroImage: IMG.focus,
    gallery: [IMG.focus, IMG.civic, IMG.blueSuv],
    features: [
      "Series hybrid e-POWER",
      "ProPILOT assist",
      "360° around-view monitor",
      "Zero-emission city drive",
      "Fold-flat rear bench",
      "LED signature lights",
    ],
    summary:
      "Petrol engine only charges the battery — wheels are always driven electrically. Excise duty is 0% on hybrids, so the tax bill is dramatically lower.",
    fobUsd: 7900,
    freightUsd: 1250,
    insuranceUsd: 100,
    transitDays: 38,
    status: "available",
    popularity: 87,
  },
  {
    slug: "toyota-vanguard-2018",
    stockRef: "BM-JP-2077",
    make: "Toyota",
    model: "Vanguard",
    trim: "350S 4WD 7-seat",
    year: 2018,
    mileageKm: 88400,
    engineCc: 2362,
    fuel: "petrol",
    transmission: "CVT",
    drivetrain: "4WD",
    bodyType: "SUV",
    color: "Bronze",
    seats: 7,
    origin: "Japan",
    sourceNote: "USS Tokyo — Lot 2077",
    grade: "Grade 4 · Interior B",
    heroImage: IMG.redSuv,
    gallery: [IMG.redSuv, IMG.sunsetSuv, IMG.whiteSuv],
    features: [
      "7 seats, fold-flat third row",
      "Smart entry",
      "Rear air-con vents",
      "Roof rails",
      "Traction control",
      "Alloy wheels",
    ],
    summary:
      "Seven seats for school runs and upcountry trips. Already sold and in transit — shown as a reference for what we can source on request.",
    fobUsd: 11500,
    freightUsd: 1450,
    insuranceUsd: 135,
    transitDays: 38,
    status: "sold",
    popularity: 58,
  },
  {
    slug: "volkswagen-tiguan-14tsi-2019",
    stockRef: "BM-UK-0932",
    make: "Volkswagen",
    model: "Tiguan",
    trim: "1.4 TSI Comfortline",
    year: 2019,
    mileageKm: 44100,
    engineCc: 1395,
    fuel: "petrol",
    transmission: "7-speed DSG",
    drivetrain: "2WD",
    bodyType: "Crossover",
    color: "Indium Grey",
    seats: 5,
    origin: "UK",
    sourceNote: "Manheim UK — full VW dealer history",
    grade: "Bandari 128-point check",
    heroImage: IMG.peugeot,
    gallery: [IMG.peugeot, IMG.blackSuv, IMG.blueSuv],
    features: [
      "DSG dual-clutch gearbox",
      "Park assist + camera",
      "Digital cockpit display",
      "Heated front seats",
      "Adaptive chassis control",
      "2 owners, 42 stamps",
    ],
    summary:
      "Right-hand-drive UK unit with a stamped VW service book. 1.4 TSI sits in the lowest excise band, which matters a lot on a European car.",
    fobUsd: 14800,
    freightUsd: 1850,
    insuranceUsd: 190,
    transitDays: 42,
    status: "available",
    popularity: 62,
  },
  {
    slug: "toyota-probox-van-2020",
    stockRef: "BM-JP-6601",
    make: "Toyota",
    model: "Probox",
    trim: "1.5 Van Extra",
    year: 2020,
    mileageKm: 55200,
    engineCc: 1497,
    fuel: "petrol",
    transmission: "CVT",
    drivetrain: "2WD",
    bodyType: "Van",
    color: "White",
    seats: 5,
    origin: "Japan",
    sourceNote: "USS Osaka — Lot 6601",
    grade: "Grade 4 · Interior C",
    heroImage: IMG.whiteToyota,
    gallery: [IMG.whiteToyota, IMG.auris, IMG.focus],
    features: [
      "1.0m flat load bay",
      "Reinforced rear springs",
      "Sliding side door",
      "Roof-mounted cargo net points",
      "Fuel efficient 1NZ-FE",
      "Bulkhead barrier",
    ],
    summary:
      "The backbone of Kenyan SME logistics. Cheap to buy, cheap to fix, and takes a full tonne of stock without complaining.",
    fobUsd: 6200,
    freightUsd: 1200,
    insuranceUsd: 80,
    transitDays: 38,
    status: "available",
    popularity: 79,
  },
];


/** KRA Current Retail Selling Price (revised July 2025 schedule) per unit, KES. */
const CRSP_BY_SLUG: Record<string, number> = {
  "toyota-rav4-x-4wd-2020": 6_850_000,
  "toyota-harrier-premium-2019": 8_400_000,
  "subaru-forester-x-break-2019": 5_200_000,
  "mazda-cx5-xd-diesel-2019": 5_600_000,
  "kia-sportage-gt-line-2020": 5_100_000,
  "toyota-hilux-double-cab-4x4-2019": 8_200_000,
  "mitsubishi-l200-triton-2020": 5_400_000,
  "isuzu-d-max-v-cross-2019": 4_900_000,
  "toyota-fielder-hybrid-2020": 3_300_000,
  "honda-fit-hybrid-2019": 2_400_000,
  "nissan-note-epower-2020": 2_600_000,
  "toyota-vanguard-2018": 3_900_000,
  "volkswagen-tiguan-14tsi-2019": 6_300_000,
  "toyota-probox-van-2020": 2_150_000,
};

const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000);
const daysAhead = (n: number) => new Date(Date.now() + n * 86_400_000);

let inFlight: Promise<void> | null = null;

export function ensureSeed(): Promise<void> {
  if (!inFlight) {
    inFlight = runSeed().catch((err) => {
      inFlight = null;
      console.error("[seed] failed", err);
      throw err;
    });
  }
  return inFlight;
}

async function runSeed() {
  const existing = await db.select({ id: vehicles.id }).from(vehicles).limit(1);
  if (existing.length > 0) return;

  const inserted = await db
    .insert(vehicles)
    .values(VEHICLE_SEED.map((v) => ({ ...v, crspKes: CRSP_BY_SLUG[v.slug] ?? 0 })))
    .returning({ id: vehicles.id, slug: vehicles.slug });
  const idBySlug = Object.fromEntries(inserted.map((v) => [v.slug, v.id]));

  const clientSeed = [
    { name: "Amina Wanjiru", email: "amina.wanjiru@bandari-demo.co.ke", phone: "+254 712 448 902", kraPin: "A012345678Q", city: "Nairobi" },
    { name: "Brian Otieno", email: "brian.otieno@bandari-demo.co.ke", phone: "+254 733 210 556", kraPin: "A099887766R", city: "Kisumu" },
    { name: "Fatuma Ali", email: "fatuma.ali@bandari-demo.co.ke", phone: "+254 700 118 224", kraPin: "A045566778S", city: "Mombasa" },
    { name: "Kevin Mwangi", email: "kevin.mwangi@bandari-demo.co.ke", phone: "+254 722 909 411", kraPin: "A077332211T", city: "Nakuru" },
    { name: "Grace Akinyi", email: "grace.akinyi@bandari-demo.co.ke", phone: "+254 715 660 780", kraPin: "A061122334U", city: "Eldoret" },
  ];
  const insertedClients = await db.insert(clients).values(clientSeed).returning({ id: clients.id, name: clients.name });
  const clientId = Object.fromEntries(insertedClients.map((c) => [c.name, c.id]));

  const feeFor = (mode: string) => DELIVERY_MODES.find((m) => m.id === mode)?.feeKes ?? 0;

  const orderSpecs = [
    {
      slug: "toyota-hilux-double-cab-4x4-2019",
      client: "Amina Wanjiru",
      stage: 5,
      plan: "deposit",
      mode: "doorstep",
      city: "Nairobi",
      ref: "BM-2604-HLX",
      passcode: "481209",
      vessel: "MV Hoegh Target",
      voyage: "V.2611W",
      bl: "HLCUYOK26044118",
      container: "RoRo deck 4 · bay 12",
      entry: "C-4419-2026",
      orderedDays: 46,
      etaDays: 9,
    },
    {
      slug: "toyota-rav4-x-4wd-2020",
      client: "Brian Otieno",
      stage: 6,
      plan: "installments",
      mode: "nairobi_inland",
      city: "Kisumu",
      ref: "BM-2603-RV4",
      passcode: "773154",
      vessel: "MSC Kalina",
      voyage: "V.614A",
      bl: "MEDUJ9912446",
      container: "MSKU 771944-0 (40ft HC)",
      entry: "C-4388-2026",
      orderedDays: 58,
      etaDays: -3,
    },
    {
      slug: "toyota-fielder-hybrid-2020",
      client: "Fatuma Ali",
      stage: 9,
      plan: "full",
      mode: "mombasa_port",
      city: "Mombasa",
      ref: "BM-2601-FLD",
      passcode: "109337",
      vessel: "MV Morning Chorus",
      voyage: "V.2604E",
      bl: "MOLU1188234512",
      container: "RoRo deck 2 · bay 07",
      entry: "C-4102-2026",
      orderedDays: 88,
      etaDays: -22,
    },
    {
      slug: "volkswagen-tiguan-14tsi-2019",
      client: "Kevin Mwangi",
      stage: 4,
      plan: "deposit",
      mode: "nairobi_inland",
      city: "Nakuru",
      ref: "BM-2605-TIG",
      passcode: "552901",
      vessel: "MV BBC Adriatic",
      voyage: "V.2618N",
      bl: "SUDUSO3388114",
      container: "TGHU 448120-6 (40ft)",
      entry: "",
      orderedDays: 28,
      etaDays: 21,
    },
    {
      slug: "nissan-note-epower-2020",
      client: "Amina Wanjiru",
      stage: 1,
      plan: "deposit",
      mode: "nairobi_inland",
      city: "Nairobi",
      ref: "BM-2606-NTE",
      passcode: "664208",
      vessel: "",
      voyage: "",
      bl: "",
      container: "",
      entry: "",
      orderedDays: 5,
      etaDays: 44,
    },
  ];

  for (const spec of orderSpecs) {
    const vehicle = VEHICLE_SEED.find((v) => v.slug === spec.slug)!;
    const duty = calculateDuty({
      fobUsd: vehicle.fobUsd,
      freightUsd: vehicle.freightUsd,
      insuranceUsd: vehicle.insuranceUsd,
      engineCc: vehicle.engineCc,
      fuel: vehicle.fuel,
      crspKes: CRSP_BY_SLUG[spec.slug] ?? 0,
      year: vehicle.year,
      deliveryFeeKes: feeFor(spec.mode),
    });
    const total = duty.totalLandedKes;
    const paid =
      spec.plan === "full" ? total : spec.stage >= 7 ? Math.round(total * 0.92) : Math.round(total * 0.3);

    const [order] = await db
      .insert(orders)
      .values({
        ref: spec.ref,
        passcode: spec.passcode,
        vehicleId: idBySlug[spec.slug],
        clientId: clientId[spec.client],
        clientName: spec.client,
        stage: spec.stage,
        paymentPlan: spec.plan,
        deliveryMode: spec.mode,
        destinationCity: spec.city,
        totalKes: total,
        paidKes: paid,
        depositKes: Math.round(total * 0.3),
        vessel: spec.vessel,
        voyage: spec.voyage,
        blNumber: spec.bl,
        containerNo: spec.container,
        entryNumber: spec.entry,
        portOfLoading: vehicle.origin === "UK" ? "Southampton, UK" : vehicle.origin === "UAE" ? "Jebel Ali, UAE" : "Yokohama, Japan",
        eta: daysAhead(spec.etaDays),
        orderDate: daysAgo(spec.orderedDays),
        departedAt: spec.stage >= 4 ? daysAgo(spec.orderedDays - 20) : null,
        arrivedAt: spec.stage >= 5 ? daysAgo(Math.max(1, spec.orderedDays - 46)) : null,
        deliveredAt: spec.stage >= 9 ? daysAgo(4) : null,
        notes: "",
      })
      .returning({ id: orders.id });

    const events: Array<{
      stage: number;
      kind: string;
      title: string;
      detail: string;
      location: string;
      occurredAt: Date;
    }> = [];

    for (let s = 0; s <= spec.stage; s++) {
      const stageDef = STAGES[s];
      const offset = spec.orderedDays - Math.round((s / 9) * spec.orderedDays);
      events.push({
        stage: s,
        kind: "milestone",
        title: stageDef.label,
        detail: stageDef.detail,
        location: stageDef.place,
        occurredAt: daysAgo(Math.max(0, offset)),
      });
    }

    if (spec.stage >= 3) {
      events.push({
        stage: 3,
        kind: "document",
        title: "Bill of Lading issued",
        detail: `BL ${spec.bl || "pending"} · ${spec.container || "RoRo deck"} · consignee ${spec.client}`,
        location: "Port of loading",
        occurredAt: daysAgo(Math.max(0, spec.orderedDays - 21)),
      });
    }
    if (spec.stage >= 2) {
      events.push({
        stage: 2,
        kind: "document",
        title: "QISJ Certificate of Inspection uploaded",
        detail: "Roadworthiness & conformity certificate attached to your order file.",
        location: "Yokohama, JP",
        occurredAt: daysAgo(Math.max(0, spec.orderedDays - 13)),
      });
    }
    if (spec.ref === "BM-2603-RV4") {
      events.push({
        stage: 6,
        kind: "alert",
        title: "KRA valuation query raised",
        detail:
          "Customs queried the declared value against the current year import book. Our agent filed a counter-valuation with the auction sheet — expect a 2–3 day delay.",
        location: "Mombasa, KE",
        occurredAt: daysAgo(2),
      });
    }
    if (spec.ref === "BM-2604-HLX") {
      events.push({
        stage: 5,
        kind: "update",
        title: "Vessel berthed at KPA Container Terminal 1",
        detail: "Discharge confirmed. Your unit is on deck 4 — photos taken at discharge are uploaded below.",
        location: "Kilindini Harbour, Mombasa",
        occurredAt: daysAgo(1),
      });
    }

    events.sort((a, b) => a.occurredAt.getTime() - b.occurredAt.getTime());
    if (events.length) {
      await db
        .insert(shipmentEvents)
        .values(events.map((e) => ({ ...e, orderId: order.id })));
    }
  }

  const allOrders = await db.select().from(orders);
  const byRef = Object.fromEntries(allOrders.map((o) => [o.ref, o]));

  const posts: PostSeed[] = [
    {
      ref: "BM-2604-HLX",
      authorName: "Bandari Cargo Desk",
      authorHandle: "bandari.desk",
      authorRole: "agent",
      body: "MV Hoegh Target berthed at Kilindini at 06:40 EAT. Your Hilux is discharged and parked in the KPA bonded yard — deck photos attached. Clearing starts tomorrow morning once the manifest is reconciled.",
      imageUrl: IMG.ship,
      reactions: { like: 14, fire: 6 },
      pinned: true,
      daysAgo: 1,
    },
    {
      ref: "BM-2604-HLX",
      authorName: "Amina Wanjiru",
      authorHandle: "amina.w",
      authorRole: "client",
      body: "Asante sana! Been refreshing this page all week 😅 Please confirm whether the tow bar survived the RoRo lashings.",
      imageUrl: null,
      reactions: { like: 9, heart: 4 },
      daysAgo: 0.8,
    },
    {
      ref: "BM-2603-RV4",
      authorName: "Bandari Clearing Agent",
      authorHandle: "bandari.clearing",
      authorRole: "agent",
      body: "Update on the KRA valuation query: counter-valuation filed with the USS Tokyo auction sheet and the Japanese export certificate. Similar cases cleared in 48 hours last month. No demurrage risk — we are inside the 5 free days.",
      imageUrl: IMG.portColor,
      reactions: { like: 21 },
      pinned: true,
      daysAgo: 2,
    },
    {
      ref: "BM-2603-RV4",
      authorName: "Brian Otieno",
      authorHandle: "brian.o",
      authorRole: "client",
      body: "Appreciated. How much extra should I provision if KRA holds the higher valuation?",
      imageUrl: null,
      reactions: { like: 3 },
      daysAgo: 1.5,
      replyTo: "Bandari Clearing Agent",
    },
    {
      ref: "BM-2601-FLD",
      authorName: "Fatuma Ali",
      authorHandle: "fatuma.a",
      authorRole: "client",
      body: "DELIVERED! 🎉 Collected my Fielder Hybrid from the yard this morning. Logbook processed in 3 days, plates on, hybrid battery reading 92% just as promised. Third import with Bandari and still the smoothest one.",
      imageUrl: IMG.auris,
      reactions: { like: 48, fire: 12, heart: 7 },
      pinned: true,
      daysAgo: 4,
    },
    {
      ref: "BM-2605-TIG",
      authorName: "Bandari Cargo Desk",
      authorHandle: "bandari.desk",
      authorRole: "agent",
      body: "MV BBC Adriatic departed Southampton, now transiting the Bay of Biscay. AIS shows an on-schedule arrival window. Container TGHU 448120-6 is sealed and moisture-bagged.",
      imageUrl: IMG.shipCranes,
      reactions: { like: 7 },
      daysAgo: 8,
    },
    {
      ref: "BM-2606-NTE",
      authorName: "Bandari Sourcing Desk",
      authorHandle: "bandari.sourcing",
      authorRole: "agent",
      body: "Bid won at TAA Yokohama: Note e-POWER X, lot 8814, grade 4.5/A, 29,800 km. Hammer price came in USD 7,900 — exactly at your ceiling. Auction sheet uploading to the order file now.",
      imageUrl: IMG.focus,
      reactions: { like: 16, fire: 3 },
      daysAgo: 5,
    },
  ];

  const communityPosts: PostSeed[] = [
    {
      authorName: "Grace Akinyi",
      authorHandle: "grace.a",
      authorRole: "client",
      body: "PSA for anyone importing a diesel this year: a 2,191cc Mazda sits in the ≤2,500cc diesel excise band at 25%, not 35%. That single fact saved me about KES 380K on my CX-5. Run the duty calculator before you fall in love with an engine size.",
      imageUrl: IMG.blueSuv,
      reactions: { like: 63, fire: 18, heart: 9 },
      pinned: true,
      daysAgo: 6,
    },
    {
      authorName: "Bandari Sourcing Desk",
      authorHandle: "bandari.sourcing",
      authorRole: "agent",
      body: "Weekly auction note: yen weakness is holding, so FOB prices on 2019–2020 Japanese units are still soft. The 8-year age rule means nothing older than 2018 (first registration) can clear Kenyan customs — we reject those listings automatically.",
      imageUrl: null,
      reactions: { like: 34 },
      daysAgo: 3,
    },
    {
      authorName: "Brian Otieno",
      authorHandle: "brian.o",
      authorRole: "client",
      body: "Question for people who did doorstep delivery: did you register the car in your name at Mombasa or at your home county? Trying to figure out where the logbook gets issued.",
      imageUrl: null,
      reactions: { like: 11 },
      daysAgo: 2,
      replyTo: "Grace Akinyi",
    },
    {
      authorName: "Kevin Mwangi",
      authorHandle: "kevin.m",
      authorRole: "client",
      body: "UK imports took 42 days door to door for me, not the 60 everyone quotes. Freight is pricier out of Southampton but the sourcing window is much shorter. Worth it if you need the car this quarter.",
      imageUrl: IMG.portSunset,
      reactions: { like: 27, fire: 5 },
      daysAgo: 9,
    },
  ];

  const insertedPosts: Array<{ id: number; authorName: string }> = [];

  for (const p of [...posts, ...communityPosts]) {
    const order = p.ref ? byRef[p.ref] : undefined;
    const [row] = await db
      .insert(engagements)
      .values({
        orderId: order ? order.id : null,
        authorName: p.authorName,
        authorHandle: p.authorHandle,
        authorRole: p.authorRole,
        body: p.body,
        imageUrl: p.imageUrl ?? null,
        reactions: p.reactions,
        pinned: p.pinned ?? false,
        createdAt: new Date(Date.now() - p.daysAgo * 86_400_000),
      })
      .returning({ id: engagements.id });
    insertedPosts.push({ id: row.id, authorName: p.authorName });
  }

  // A couple of threaded replies inside order conversations.
  const hiluxClient = insertedPosts[1];
  const hiluxAgent = insertedPosts[0];
  await db.insert(engagements).values([
    {
      orderId: byRef["BM-2604-HLX"].id,
      parentId: hiluxAgent.id,
      authorName: "Bandari Cargo Desk",
      authorHandle: "bandari.desk",
      authorRole: "agent",
      body: "Tow bar is intact and the wiring loom is still clipped to the chassis rail. Minor scuff on the rear bumper from lashing — noted on the discharge report, no structural damage.",
      reactions: { like: 5 },
      createdAt: new Date(Date.now() - 0.6 * 86_400_000),
    },
    {
      orderId: byRef["BM-2603-RV4"].id,
      parentId: hiluxClient.id,
      authorName: "Bandari Clearing Agent",
      authorHandle: "bandari.clearing",
      authorRole: "agent",
      body: "Worst case provision is roughly KES 148,000 in extra duty + VAT if KRA holds their value. We only ask for that if the counter-valuation is rejected — historically it is not.",
      reactions: { like: 8 },
      createdAt: new Date(Date.now() - 1.2 * 86_400_000),
    },
  ]);

  await db
    .update(vehicles)
    .set({ status: "in_transit" })
    .where(eq(vehicles.slug, "toyota-hilux-double-cab-4x4-2019"));
}

