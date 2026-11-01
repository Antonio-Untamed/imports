import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  numeric,
  boolean,
  index,
  uniqueIndex,
} from "drizzle-orm/pg-core";

/**
 * Bandari Motors — import vehicle ordering, shipment tracking to Kenya
 * and client engagement feed.
 */

export const vehicles = pgTable(
  "vehicles",
  {
    id: serial("id").primaryKey(),
    slug: text("slug").notNull(),
    stockRef: text("stock_ref").notNull(),
    make: text("make").notNull(),
    model: text("model").notNull(),
    trim: text("trim").notNull().default(""),
    year: integer("year").notNull(),
    mileageKm: integer("mileage_km").notNull().default(0),
    engineCc: integer("engine_cc").notNull().default(1500),
    fuel: text("fuel").notNull().default("petrol"),
    transmission: text("transmission").notNull().default("Automatic"),
    drivetrain: text("drivetrain").notNull().default("2WD"),
    bodyType: text("body_type").notNull().default("SUV"),
    color: text("color").notNull().default("White"),
    seats: integer("seats").notNull().default(5),
    origin: text("origin").notNull().default("Japan"),
    sourceNote: text("source_note").notNull().default(""),
    grade: text("grade").notNull().default(""),
    heroImage: text("hero_image").notNull(),
    gallery: jsonb("gallery").$type<string[]>().notNull().default([]),
    features: jsonb("features").$type<string[]>().notNull().default([]),
    summary: text("summary").notNull().default(""),
    fobUsd: numeric("fob_usd", { mode: "number" }).notNull().default(0),
    freightUsd: numeric("freight_usd", { mode: "number" }).notNull().default(0),
    insuranceUsd: numeric("insurance_usd", { mode: "number" }).notNull().default(0),
    crspKes: integer("crsp_kes").notNull().default(0),
    transitDays: integer("transit_days").notNull().default(38),
    status: text("status").notNull().default("available"),
    popularity: integer("popularity").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("vehicles_slug_idx").on(t.slug), index("vehicles_status_idx").on(t.status)]
);

export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull().default(""),
  kraPin: text("kra_pin").notNull().default(""),
  city: text("city").notNull().default("Nairobi"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const orders = pgTable(
  "orders",
  {
    id: serial("id").primaryKey(),
    ref: text("ref").notNull(),
    passcode: text("passcode").notNull(),
    vehicleId: integer("vehicle_id")
      .notNull()
      .references(() => vehicles.id),
    clientId: integer("client_id")
      .notNull()
      .references(() => clients.id),
    clientName: text("client_name").notNull(),
    stage: integer("stage").notNull().default(0),
    paymentPlan: text("payment_plan").notNull().default("deposit"),
    deliveryMode: text("delivery_mode").notNull().default("nairobi_inland"),
    destinationCity: text("destination_city").notNull().default("Nairobi"),
    totalKes: integer("total_kes").notNull().default(0),
    paidKes: integer("paid_kes").notNull().default(0),
    depositKes: integer("deposit_kes").notNull().default(0),
    vessel: text("vessel").notNull().default(""),
    voyage: text("voyage").notNull().default(""),
    blNumber: text("bl_number").notNull().default(""),
    containerNo: text("container_no").notNull().default(""),
    portOfLoading: text("port_of_loading").notNull().default("Yokohama, Japan"),
    portOfDischarge: text("port_of_discharge").notNull().default("Mombasa, Kenya"),
    entryNumber: text("entry_number").notNull().default(""),
    eta: timestamp("eta", { withTimezone: true }),
    orderDate: timestamp("order_date", { withTimezone: true }).notNull().defaultNow(),
    departedAt: timestamp("departed_at", { withTimezone: true }),
    arrivedAt: timestamp("arrived_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    notes: text("notes").notNull().default(""),
    sharedPublicly: boolean("shared_publicly").notNull().default(true),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("orders_ref_idx").on(t.ref), index("orders_stage_idx").on(t.stage)]
);

export const shipmentEvents = pgTable(
  "shipment_events",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    stage: integer("stage").notNull().default(0),
    kind: text("kind").notNull().default("milestone"),
    title: text("title").notNull(),
    detail: text("detail").notNull().default(""),
    location: text("location").notNull().default(""),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("events_order_idx").on(t.orderId)]
);

export const engagements = pgTable(
  "engagements",
  {
    id: serial("id").primaryKey(),
    orderId: integer("order_id").references(() => orders.id, { onDelete: "cascade" }),
    parentId: integer("parent_id"),
    authorName: text("author_name").notNull(),
    authorHandle: text("author_handle").notNull(),
    authorRole: text("author_role").notNull().default("client"),
    body: text("body").notNull(),
    imageUrl: text("image_url"),
    reactions: jsonb("reactions").$type<Record<string, number>>().notNull().default({}),
    reactedBy: jsonb("reacted_by").$type<string[]>().notNull().default([]),
    pinned: boolean("pinned").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("engagements_order_idx").on(t.orderId)]
);

/**
 * Admin-uploaded photos live in Postgres rather than on disk so they survive
 * serverless / container deployments where the filesystem is ephemeral.
 */
export const media = pgTable(
  "media",
  {
    id: serial("id").primaryKey(),
    name: text("name").notNull(),
    mime: text("mime").notNull(),
    size: integer("size").notNull().default(0),
    dataBase64: text("data_base64").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("media_name_idx").on(t.name)]
);

export const inquiries = pgTable("inquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  contact: text("contact").notNull(),
  message: text("message").notNull().default(""),
  topic: text("topic").notNull().default("general"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
