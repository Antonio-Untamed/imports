import { and, asc, count, desc, eq, ilike, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import { clients, engagements, orders, shipmentEvents, vehicles } from "@/db/schema";
import { DELIVERY_MODES, STAGES } from "./constants";
import { calculateDuty } from "./duty";

const iso = (d: Date | null | undefined) => (d ? new Date(d).toISOString() : null);

export type VehicleDTO = {
  id: number;
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
  crspKes: number;
  crspAdjustedKes: number;
  customsValueKes: number;
  valuationBasis: "CIF" | "CRSP";
  transitDays: number;
  status: string;
  popularity: number;
  cifKes: number;
  totalLandedKes: number;
  dutyKes: number;
  createdAt: string;
};

export type EventDTO = {
  id: number;
  stage: number;
  kind: string;
  title: string;
  detail: string;
  location: string;
  occurredAt: string;
};

export type EngagementDTO = {
  id: number;
  orderId: number | null;
  orderRef: string | null;
  parentId: number | null;
  authorName: string;
  authorHandle: string;
  authorRole: string;
  body: string;
  imageUrl: string | null;
  reactions: Record<string, number>;
  pinned: boolean;
  createdAt: string;
  children: EngagementDTO[];
};

export type OrderDTO = {
  id: number;
  ref: string;
  passcode: string;
  clientName: string;
  clientCity: string;
  stage: number;
  stageLabel: string;
  stageShort: string;
  progressPct: number;
  paymentPlan: string;
  deliveryMode: string;
  destinationCity: string;
  totalKes: number;
  paidKes: number;
  balanceKes: number;
  depositKes: number;
  vessel: string;
  voyage: string;
  blNumber: string;
  containerNo: string;
  portOfLoading: string;
  portOfDischarge: string;
  entryNumber: string;
  eta: string | null;
  orderDate: string;
  departedAt: string | null;
  arrivedAt: string | null;
  deliveredAt: string | null;
  vehicle: VehicleDTO;
  events: EventDTO[];
  engagements: EngagementDTO[];
};

export async function ensureReady() {
  const { ensureSeed } = await import("@/db/seed");
  await ensureSeed();
}

function mapVehicle(v: typeof vehicles.$inferSelect): VehicleDTO {
  const duty = calculateDuty({
    fobUsd: Number(v.fobUsd),
    freightUsd: Number(v.freightUsd),
    insuranceUsd: Number(v.insuranceUsd),
    engineCc: v.engineCc,
    fuel: v.fuel,
    crspKes: v.crspKes,
    year: v.year,
  });
  return {
    ...v,
    fobUsd: Number(v.fobUsd),
    freightUsd: Number(v.freightUsd),
    insuranceUsd: Number(v.insuranceUsd),
    crspKes: v.crspKes,
    crspAdjustedKes: duty.crspAdjusted,
    customsValueKes: duty.customsValueKes,
    valuationBasis: duty.basis,
    gallery: (v.gallery ?? []) as string[],
    features: (v.features ?? []) as string[],
    cifKes: duty.cifKes,
    totalLandedKes: duty.totalLandedKes,
    dutyKes: duty.totalTaxKes,
    createdAt: iso(v.createdAt) ?? "",
  };
}

export type VehicleFilters = {
  q?: string;
  make?: string;
  bodyType?: string;
  fuel?: string;
  origin?: string;
  maxYear?: number;
  minYear?: number;
  maxLanded?: number;
  minLanded?: number;
  sort?: string;
  limit?: number;
};

export async function listVehicles(f: VehicleFilters = {}) {
  await ensureReady();
  const rows = await db.select().from(vehicles);
  let mapped = rows.map(mapVehicle);

  if (f.q) {
    const q = f.q.toLowerCase();
    mapped = mapped.filter((v) =>
      `${v.make} ${v.model} ${v.trim} ${v.bodyType} ${v.stockRef} ${v.year}`.toLowerCase().includes(q)
    );
  }
  if (f.make && f.make !== "all") mapped = mapped.filter((v) => v.make === f.make);
  if (f.bodyType && f.bodyType !== "all") mapped = mapped.filter((v) => v.bodyType === f.bodyType);
  if (f.fuel && f.fuel !== "all") mapped = mapped.filter((v) => v.fuel === f.fuel);
  if (f.origin && f.origin !== "all") mapped = mapped.filter((v) => v.origin === f.origin);
  if (f.maxYear) mapped = mapped.filter((v) => v.year <= f.maxYear!);
  if (f.minYear) mapped = mapped.filter((v) => v.year >= f.minYear!);
  if (f.maxLanded) mapped = mapped.filter((v) => v.totalLandedKes <= f.maxLanded!);
  if (f.minLanded) mapped = mapped.filter((v) => v.totalLandedKes >= f.minLanded!);

  const sort = f.sort ?? "popular";
  mapped.sort((a, b) => {
    switch (sort) {
      case "price-asc":
        return a.totalLandedKes - b.totalLandedKes;
      case "price-desc":
        return b.totalLandedKes - a.totalLandedKes;
      case "year-desc":
        return b.year - a.year || b.popularity - a.popularity;
      case "mileage-asc":
        return a.mileageKm - b.mileageKm;
      case "newest":
        return (b.createdAt ?? "").localeCompare(a.createdAt ?? "");
      default:
        return b.popularity - a.popularity;
    }
  });

  return f.limit ? mapped.slice(0, f.limit) : mapped;
}

export async function getVehicleBySlug(slug: string) {
  await ensureReady();
  const rows = await db.select().from(vehicles).where(eq(vehicles.slug, slug)).limit(1);
  if (!rows.length) return null;
  const v = mapVehicle(rows[0]);
  const related = (await listVehicles({ bodyType: v.bodyType, limit: 4 })).filter((r) => r.id !== v.id).slice(0, 3);
  return { ...v, related };
}

export async function getVehicleById(id: number) {
  await ensureReady();
  const rows = await db.select().from(vehicles).where(eq(vehicles.id, id)).limit(1);
  return rows.length ? mapVehicle(rows[0]) : null;
}

function mapEvent(e: typeof shipmentEvents.$inferSelect): EventDTO {
  return { ...e, occurredAt: iso(e.occurredAt) ?? "" };
}

export function buildEngagementTree(rows: EngagementRow[]): EngagementDTO[] {
  const byId = new Map<number, EngagementDTO>();
  const roots: EngagementDTO[] = [];
  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      orderId: r.orderId,
      orderRef: r.orderRef ?? null,
      parentId: r.parentId,
      authorName: r.authorName,
      authorHandle: r.authorHandle,
      authorRole: r.authorRole,
      body: r.body,
      imageUrl: r.imageUrl,
      reactions: (r.reactions ?? {}) as Record<string, number>,
      pinned: r.pinned,
      createdAt: iso(r.createdAt) ?? "",
      children: [],
    });
  }
  for (const r of rows) {
    const node = byId.get(r.id)!;
    const parent = r.parentId ? byId.get(r.parentId) : undefined;
    if (parent) parent.children.push(node);
    else roots.push(node);
  }
  const rank = (n: EngagementDTO) => (n.pinned ? 0 : 1);
  roots.sort((a, b) => rank(a) - rank(b) || b.createdAt.localeCompare(a.createdAt));
  for (const n of byId.values()) n.children.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  return roots;
}

type EngagementRow = typeof engagements.$inferSelect & { orderRef: string | null };

export async function getOrderByRef(ref: string): Promise<OrderDTO | null> {
  await ensureReady();
  const key = ref.trim().toUpperCase();
  const rows = await db
    .select({ order: orders, vehicle: vehicles, client: clients })
    .from(orders)
    .innerJoin(vehicles, eq(vehicles.id, orders.vehicleId))
    .innerJoin(clients, eq(clients.id, orders.clientId))
    .where(or(eq(sql`upper(${orders.ref})`, key), eq(orders.passcode, ref.trim())))
    .limit(1);
  if (!rows.length) return null;
  return assembleOrder(rows[0].order, rows[0].vehicle, rows[0].client.city);
}

export async function getOrderById(id: number): Promise<OrderDTO | null> {
  await ensureReady();
  const rows = await db
    .select({ order: orders, vehicle: vehicles, client: clients })
    .from(orders)
    .innerJoin(vehicles, eq(vehicles.id, orders.vehicleId))
    .innerJoin(clients, eq(clients.id, orders.clientId))
    .where(eq(orders.id, id))
    .limit(1);
  if (!rows.length) return null;
  return assembleOrder(rows[0].order, rows[0].vehicle, rows[0].client.city);
}

async function assembleOrder(
  order: typeof orders.$inferSelect,
  vehicle: typeof vehicles.$inferSelect,
  clientCity: string
): Promise<OrderDTO> {
  const evRows = await db
    .select()
    .from(shipmentEvents)
    .where(eq(shipmentEvents.orderId, order.id))
    .orderBy(asc(shipmentEvents.occurredAt));

  const engRows = await db
    .select({ e: engagements, ref: orders.ref })
    .from(engagements)
    .leftJoin(orders, eq(orders.id, engagements.orderId))
    .where(eq(engagements.orderId, order.id))
    .orderBy(asc(engagements.createdAt));

  const stage = Math.min(order.stage, STAGES.length - 1);
  return {
    id: order.id,
    ref: order.ref,
    passcode: order.passcode,
    clientName: order.clientName,
    clientCity,
    stage,
    stageLabel: STAGES[stage].label,
    stageShort: STAGES[stage].short,
    progressPct: Math.round((stage / (STAGES.length - 1)) * 100),
    paymentPlan: order.paymentPlan,
    deliveryMode: order.deliveryMode,
    destinationCity: order.destinationCity,
    totalKes: order.totalKes,
    paidKes: order.paidKes,
    balanceKes: Math.max(0, order.totalKes - order.paidKes),
    depositKes: order.depositKes,
    vessel: order.vessel,
    voyage: order.voyage,
    blNumber: order.blNumber,
    containerNo: order.containerNo,
    portOfLoading: order.portOfLoading,
    portOfDischarge: order.portOfDischarge,
    entryNumber: order.entryNumber,
    eta: iso(order.eta),
    orderDate: iso(order.orderDate) ?? "",
    departedAt: iso(order.departedAt),
    arrivedAt: iso(order.arrivedAt),
    deliveredAt: iso(order.deliveredAt),
    vehicle: mapVehicle(vehicle),
    events: evRows.map(mapEvent),
    engagements: buildEngagementTree(
      engRows.map((r) => ({ ...r.e, orderRef: r.ref }))
    ),
  };
}

export async function listOrders(refs?: string[]): Promise<OrderDTO[]> {
  await ensureReady();
  const rows = await db
    .select({ order: orders, vehicle: vehicles, client: clients })
    .from(orders)
    .innerJoin(vehicles, eq(vehicles.id, orders.vehicleId))
    .innerJoin(clients, eq(clients.id, orders.clientId))
    .orderBy(desc(orders.orderDate));

  const filtered = refs && refs.length ? rows.filter((r) => refs.includes(r.order.ref)) : rows;
  return Promise.all(filtered.map((r) => assembleOrder(r.order, r.vehicle, r.client.city)));
}

export async function getFeed(scope: "all" | "community" = "all") {
  await ensureReady();
  const rows = await db
    .select({ e: engagements, ref: orders.ref, vehicle: vehicles.model })
    .from(engagements)
    .leftJoin(orders, eq(orders.id, engagements.orderId))
    .leftJoin(vehicles, eq(vehicles.id, orders.vehicleId))
    .orderBy(desc(engagements.pinned), desc(engagements.createdAt))
    .limit(80);

  const wanted =
    scope === "community"
      ? rows.filter((r) => r.e.orderId === null)
      : rows;

  return buildEngagementTree(wanted.map((r) => ({ ...r.e, orderRef: r.ref })));
}

export async function getStats() {
  await ensureReady();
  const [v, o, e, delivered, inTransit] = await Promise.all([
    db.select({ n: count() }).from(vehicles),
    db.select({ n: count() }).from(orders),
    db.select({ n: count() }).from(engagements),
    db.select({ n: count() }).from(orders).where(eq(orders.stage, STAGES.length - 1)),
    db
      .select({ n: count() })
      .from(orders)
      .where(and(lte(orders.stage, 6), sql`${orders.stage} > 0`)),
  ]);
  const totalUnits = await db
    .select({ n: sql<number>`coalesce(sum(${orders.paidKes}), 0)` })
    .from(orders);
  return {
    vehicles: v[0].n,
    orders: o[0].n,
    engagements: e[0].n,
    delivered: delivered[0].n,
    inTransit: inTransit[0].n,
    valueHandledKes: Number(totalUnits[0].n),
  };
}

/* ---------------------------------- writes --------------------------------- */

export type CreateOrderInput = {
  vehicleId: number;
  name: string;
  email: string;
  phone: string;
  kraPin: string;
  city: string;
  paymentPlan: string;
  deliveryMode: string;
  destinationCity: string;
  notes?: string;
};

function randomRef() {
  const now = new Date();
  const ym = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  const letters = Array.from({ length: 3 }, () => "ABCDEFGHJKLMNPQRSTUVWXYZ"[Math.floor(Math.random() * 24)]).join("");
  return `BM-${ym}-${letters}`;
}

const VESSELS = [
  { name: "MV Hoegh Target", voyage: "V.2618W" },
  { name: "MSC Kalina", voyage: "V.620A" },
  { name: "MV Morning Chorus", voyage: "V.2612E" },
  { name: "NYK Ocean Ace", voyage: "V.0917S" },
];

export async function createOrder(input: CreateOrderInput) {
  await ensureReady();
  const vehicleRows = await db.select().from(vehicles).where(eq(vehicles.id, input.vehicleId)).limit(1);
  if (!vehicleRows.length) throw new Error("Vehicle not found");
  const vehicle = vehicleRows[0];

  const deliveryFee = DELIVERY_MODES.find((m) => m.id === input.deliveryMode)?.feeKes ?? 0;
  const duty = calculateDuty({
    fobUsd: Number(vehicle.fobUsd),
    freightUsd: Number(vehicle.freightUsd),
    insuranceUsd: Number(vehicle.insuranceUsd),
    engineCc: vehicle.engineCc,
    fuel: vehicle.fuel,
    crspKes: vehicle.crspKes,
    year: vehicle.year,
    deliveryFeeKes: deliveryFee,
  });
  const total = input.paymentPlan === "full" ? Math.round(duty.totalLandedKes * 0.985) : duty.totalLandedKes;
  const deposit = Math.round(total * 0.3);
  const paid = input.paymentPlan === "full" ? total : deposit;

  const existingClient = await db
    .select()
    .from(clients)
    .where(ilike(clients.email, input.email.trim()))
    .limit(1);

  let clientId = existingClient[0]?.id;
  if (!clientId) {
    const [created] = await db
      .insert(clients)
      .values({
        name: input.name.trim(),
        email: input.email.trim(),
        phone: input.phone.trim(),
        kraPin: input.kraPin.trim().toUpperCase(),
        city: input.city.trim() || "Nairobi",
      })
      .returning({ id: clients.id });
    clientId = created.id;
  } else {
    await db
      .update(clients)
      .set({ name: input.name.trim(), phone: input.phone.trim(), kraPin: input.kraPin.trim().toUpperCase(), city: input.city.trim() })
      .where(eq(clients.id, clientId));
  }

  const ref = randomRef();
  const passcode = String(Math.floor(100000 + Math.random() * 900000));
  const vessel = VESSELS[Math.floor(Math.random() * VESSELS.length)];
  const eta = new Date(Date.now() + (vehicle.transitDays + 22) * 86_400_000);
  const portOfLoading =
    vehicle.origin === "UK" ? "Southampton, UK" : vehicle.origin === "UAE" ? "Jebel Ali, UAE" : "Yokohama, Japan";

  const [order] = await db
    .insert(orders)
    .values({
      ref,
      passcode,
      vehicleId: vehicle.id,
      clientId,
      clientName: input.name.trim(),
      stage: 0,
      paymentPlan: input.paymentPlan,
      deliveryMode: input.deliveryMode,
      destinationCity: input.destinationCity.trim() || input.city.trim() || "Nairobi",
      totalKes: total,
      paidKes: paid,
      depositKes: deposit,
      vessel: vessel.name,
      voyage: vessel.voyage,
      portOfLoading,
      eta,
      orderDate: new Date(),
      notes: input.notes ?? "",
      sharedPublicly: true,
    })
    .returning({ id: orders.id });

  await db.insert(shipmentEvents).values({
    orderId: order.id,
    stage: 0,
    kind: "milestone",
    title: STAGES[0].label,
    detail: `${STAGES[0].detail} Deposit of KES ${paid.toLocaleString("en-KE")} received (${input.paymentPlan}).`,
    location: STAGES[0].place,
    occurredAt: new Date(),
  });

  await db.insert(engagements).values({
    orderId: order.id,
    authorName: "Bandari Cargo Desk",
    authorHandle: "bandari.desk",
    authorRole: "agent",
    body: `Karibu, ${input.name.split(" ")[0]}! Order ${ref} is open. We have soft-reserved the ${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} (${vehicle.stockRef}) in your name and our Yokohama desk starts the paperwork today. You will get an update here at every one of the ${STAGES.length} stages — ask us anything in this thread.`,
    reactions: {},
    pinned: true,
  });

  await db.update(vehicles).set({ status: "reserved" }).where(eq(vehicles.id, vehicle.id));

  return { ref, passcode, orderId: order.id, totalKes: total, paidKes: paid, eta: iso(eta) };
}

export async function advanceOrder(orderId: number) {
  await ensureReady();
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!rows.length) throw new Error("Order not found");
  const order = rows[0];
  const next = Math.min(order.stage + 1, STAGES.length - 1);
  const stage = STAGES[next];

  const patch: Partial<typeof orders.$inferInsert> = { stage: next, updatedAt: new Date() };
  if (stage.key === "transit") {
    patch.departedAt = new Date();
    patch.blNumber = order.blNumber || `HLCUYOK${Math.floor(1000000 + Math.random() * 8999999)}`;
    patch.containerNo = order.containerNo || `MSKU ${Math.floor(100000 + Math.random() * 899999)}-${Math.floor(Math.random() * 9)} (40ft HC)`;
  }
  if (stage.key === "arrival") patch.arrivedAt = new Date();
  if (stage.key === "clearing") patch.entryNumber = order.entryNumber || `C-${Math.floor(4000 + Math.random() * 999)}-${new Date().getFullYear()}`;
  if (stage.key === "delivery") {
    patch.deliveredAt = new Date();
    await db.update(vehicles).set({ status: "sold" }).where(eq(vehicles.id, order.vehicleId));
  }

  await db.update(orders).set(patch).where(eq(orders.id, orderId));

  await db.insert(shipmentEvents).values({
    orderId,
    stage: next,
    kind: "milestone",
    title: stage.label,
    detail: stage.detail,
    location: stage.place,
    occurredAt: new Date(),
  });

  await db.insert(engagements).values({
    orderId,
    authorName: "Bandari Cargo Desk",
    authorHandle: "bandari.desk",
    authorRole: "system",
    body: `Stage update — ${stage.short}. ${stage.detail}`,
    reactions: {},
  });

  return getOrderById(orderId);
}

export async function recordPayment(orderId: number, amountKes: number, method: string) {
  await ensureReady();
  const rows = await db.select().from(orders).where(eq(orders.id, orderId)).limit(1);
  if (!rows.length) throw new Error("Order not found");
  const amount = Math.max(0, Math.min(Math.round(amountKes), rows[0].totalKes - rows[0].paidKes));
  if (amount === 0) return getOrderById(orderId);

  await db
    .update(orders)
    .set({ paidKes: rows[0].paidKes + amount, updatedAt: new Date() })
    .where(eq(orders.id, orderId));

  await db.insert(shipmentEvents).values({
    orderId,
    stage: rows[0].stage,
    kind: "document",
    title: `Payment received — KES ${amount.toLocaleString("en-KE")}`,
    detail: `Method: ${method}. Receipt issued and filed against order ${rows[0].ref}.`,
    location: "Nairobi, KE",
    occurredAt: new Date(),
  });

  await db.insert(engagements).values({
    orderId,
    authorName: "Bandari Accounts",
    authorHandle: "bandari.accounts",
    authorRole: "agent",
    body: `Payment of KES ${amount.toLocaleString("en-KE")} received via ${method}. Your balance is now KES ${Math.max(0, rows[0].totalKes - rows[0].paidKes - amount).toLocaleString("en-KE")}. Receipt attached to the order file.`,
    reactions: {},
  });

  return getOrderById(orderId);
}

export type NewEngagement = {
  orderId?: number | null;
  parentId?: number | null;
  authorName: string;
  authorHandle?: string;
  authorRole?: string;
  body: string;
  imageUrl?: string | null;
};

export async function createEngagement(input: NewEngagement) {
  await ensureReady();
  const handle =
    input.authorHandle?.trim() ||
    input.authorName
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/^\.|\.$/g, "") ||
    "guest";

  const [row] = await db
    .insert(engagements)
    .values({
      orderId: input.orderId ?? null,
      parentId: input.parentId ?? null,
      authorName: input.authorName.trim().slice(0, 60),
      authorHandle: handle.slice(0, 40),
      authorRole: input.authorRole ?? "client",
      body: input.body.trim().slice(0, 2000),
      imageUrl: input.imageUrl?.trim() || null,
      reactions: {},
    })
    .returning();

  const orderRef = row.orderId
    ? ((await db.select({ ref: orders.ref }).from(orders).where(eq(orders.id, row.orderId)).limit(1))[0]?.ref ?? null)
    : null;

  return buildEngagementTree([{ ...row, orderRef }])[0];
}

const REACTION_TYPES = ["like", "heart", "fire"] as const;

export async function toggleReaction(engagementId: number, handle: string, type: string) {
  await ensureReady();
  const kind = (REACTION_TYPES as readonly string[]).includes(type) ? type : "like";
  const rows = await db.select().from(engagements).where(eq(engagements.id, engagementId)).limit(1);
  if (!rows.length) throw new Error("Post not found");
  const post = rows[0];
  const reactions = { ...((post.reactions ?? {}) as Record<string, number>) };
  const reactedBy = [...((post.reactedBy ?? []) as string[])];
  const token = `${handle}|${kind}`;
  const has = reactedBy.includes(token);

  if (has) {
    reactedBy.splice(reactedBy.indexOf(token), 1);
    reactions[kind] = Math.max(0, (reactions[kind] ?? 0) - 1);
    if (reactions[kind] === 0) delete reactions[kind];
  } else {
    reactedBy.push(token);
    reactions[kind] = (reactions[kind] ?? 0) + 1;
  }

  await db.update(engagements).set({ reactions, reactedBy }).where(eq(engagements.id, engagementId));
  return { reactions, active: !has };
}

export async function createInquiry(input: { name: string; contact: string; message: string; topic: string }) {
  await ensureReady();
  const { inquiries } = await import("@/db/schema");
  const [row] = await db
    .insert(inquiries)
    .values({
      name: input.name.trim().slice(0, 80),
      contact: input.contact.trim().slice(0, 120),
      message: input.message.trim().slice(0, 2000),
      topic: input.topic || "general",
    })
    .returning({ id: inquiries.id });
  return row.id;
}

export async function getPopularSearches() {
  await ensureReady();
  const rows = await db
    .select({ make: vehicles.make, n: count() })
    .from(vehicles)
    .groupBy(vehicles.make)
    .orderBy(desc(sql`count(*)`))
    .limit(5);
  return rows.map((r) => r.make);
}

/** Matches an order by tracking reference or 6-digit passcode. */
export async function findOrderRef(query: string) {
  await ensureReady();
  const key = query.trim();
  if (!key) return null;
  const rows = await db
    .select({ ref: orders.ref })
    .from(orders)
    .where(or(eq(orders.passcode, key), eq(sql`upper(${orders.ref})`, key.toUpperCase())))
    .limit(1);
  if (rows.length) return rows[0].ref;
  const partial = await db
    .select({ ref: orders.ref })
    .from(orders)
    .where(ilike(orders.ref, `%${key.toUpperCase()}%`))
    .limit(1);
  return partial[0]?.ref ?? null;
}

export async function getAllRefs() {
  await ensureReady();
  const rows = await db.select({ ref: orders.ref }).from(orders);
  return rows.map((r) => r.ref);
}
