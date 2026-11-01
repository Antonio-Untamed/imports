import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { inquiries, media, orders, vehicles } from "@/db/schema";
import { ADMIN_PIN } from "./constants";

/** Gate every admin mutation behind the office PIN. */
export function requireAdmin(req: Request): boolean {
  const supplied = (req.headers.get("x-admin-pin") ?? "").trim();
  return supplied.length > 0 && supplied === ADMIN_PIN;
}

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

export type VehiclePayload = {
  make: string;
  model: string;
  trim?: string;
  year: number;
  mileageKm: number;
  engineCc: number;
  fuel: string;
  transmission?: string;
  drivetrain?: string;
  bodyType?: string;
  color?: string;
  seats?: number;
  origin?: string;
  sourceNote?: string;
  grade?: string;
  heroImage: string;
  gallery?: string[];
  features?: string[];
  summary?: string;
  fobUsd: number;
  freightUsd: number;
  insuranceUsd: number;
  crspKes: number;
  transitDays?: number;
  status?: string;
  popularity?: number;
};

function coerce(p: VehiclePayload) {
  return {
    make: p.make.trim(),
    model: p.model.trim(),
    trim: (p.trim ?? "").trim(),
    year: Number(p.year),
    mileageKm: Number(p.mileageKm) || 0,
    engineCc: Number(p.engineCc) || 1500,
    fuel: (p.fuel || "petrol").toLowerCase(),
    transmission: p.transmission?.trim() || "Automatic",
    drivetrain: p.drivetrain?.trim() || "2WD",
    bodyType: p.bodyType?.trim() || "SUV",
    color: p.color?.trim() || "White",
    seats: Number(p.seats) || 5,
    origin: p.origin?.trim() || "Japan",
    sourceNote: p.sourceNote?.trim() || "",
    grade: p.grade?.trim() || "",
    heroImage: p.heroImage.trim(),
    gallery: (p.gallery ?? []).filter(Boolean),
    features: (p.features ?? []).filter(Boolean),
    summary: p.summary?.trim() || "",
    fobUsd: Number(p.fobUsd) || 0,
    freightUsd: Number(p.freightUsd) || 0,
    insuranceUsd: Number(p.insuranceUsd) || 0,
    crspKes: Number(p.crspKes) || 0,
    transitDays: Number(p.transitDays) || 38,
    status: p.status || "available",
    popularity: Number(p.popularity) || 50,
  };
}

export function validateVehicle(p: VehiclePayload): string | null {
  if (!p.make?.trim() || !p.model?.trim()) return "Make and model are required";
  const year = Number(p.year);
  const currentYear = new Date().getFullYear();
  if (!year || year < 1990 || year > currentYear + 1) return `Enter a valid first-registration year (1990–${currentYear + 1})`;
  if (currentYear - year > 8)
    return `${year} is outside the KEBS 8-year age limit — it cannot clear Kenyan customs`;
  if (!(Number(p.fobUsd) > 0)) return "Enter the FOB / auction price in USD";
  if (!p.heroImage?.trim()) return "Add a main photo URL or upload an image";
  return null;
}

export async function uniqueSlug(base: string, ignoreId?: number) {
  let slug = slugify(base) || `unit-${Date.now()}`;
  let candidate = slug;
  let n = 2;
  for (;;) {
    const rows = await db.select({ id: vehicles.id }).from(vehicles).where(eq(vehicles.slug, candidate)).limit(1);
    if (!rows.length || (ignoreId !== undefined && rows[0].id === ignoreId)) return candidate;
    candidate = `${slug}-${n++}`;
    if (n > 60) return `${slug}-${Date.now()}`;
  }
}

export async function createVehicle(p: VehiclePayload) {
  const data = coerce(p);
  const stockRef =
    data.sourceNote.match(/BM-[A-Z]{2}-\d{3,5}/)?.[0] ??
    `BM-${data.origin === "UK" ? "UK" : data.origin === "UAE" ? "AE" : "JP"}-${Math.floor(1000 + Math.random() * 8999)}`;
  const slug = await uniqueSlug(
    `${data.make}-${data.model}-${data.trim}-${data.year}`.replace(/\s+/g, "-")
  );
  const gallery = data.gallery.length ? data.gallery : [data.heroImage];
  const [row] = await db
    .insert(vehicles)
    .values({ ...data, slug, stockRef, gallery })
    .returning({ id: vehicles.id, slug: vehicles.slug, stockRef: vehicles.stockRef });
  return row;
}

export async function updateVehicle(id: number, p: VehiclePayload) {
  const data = coerce(p);
  const slug = await uniqueSlug(
    `${data.make}-${data.model}-${data.trim}-${data.year}`.replace(/\s+/g, "-"),
    id
  );
  const gallery = data.gallery.length ? data.gallery : [data.heroImage];
  const [row] = await db
    .update(vehicles)
    .set({ ...data, slug, gallery })
    .where(eq(vehicles.id, id))
    .returning({ id: vehicles.id, slug: vehicles.slug });
  return row ?? null;
}

export async function deleteVehicle(id: number) {
  const linked = await db.select({ ref: orders.ref }).from(orders).where(eq(orders.vehicleId, id)).limit(1);
  if (linked.length) {
    throw new Error(
      `This unit is attached to order ${linked[0].ref}. Mark it as sold or in transit instead of deleting it.`
    );
  }
  const [row] = await db.delete(vehicles).where(eq(vehicles.id, id)).returning({ id: vehicles.id });
  return row ?? null;
}

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]);
const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;

/**
 * Stores the image in Postgres and returns a stable URL served by
 * /api/media/[name]. No filesystem involved, so it works on Vercel, Railway,
 * Render, Fly, Cloudflare Workers — anywhere with a DATABASE_URL.
 */
export async function saveUploadedImage(file: File): Promise<string> {
  if (!ALLOWED.has(file.type)) throw new Error("Only JPEG, PNG, WebP or AVIF images are allowed");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("Images must be under 8 MB");

  const ext = file.type.split("/")[1]?.replace("jpeg", "jpg") ?? "jpg";
  const name = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  await db.insert(media).values({
    name,
    mime: file.type,
    size: bytes.length,
    dataBase64: bytes.toString("base64"),
  });

  return `/api/media/${name}`;
}

export async function readStoredImage(name: string) {
  const rows = await db.select().from(media).where(eq(media.name, name)).limit(1);
  if (!rows.length) return null;
  return { mime: rows[0].mime, bytes: Buffer.from(rows[0].dataBase64, "base64") };
}

export async function listInquiries(limit = 40) {
  const rows = await db.select().from(inquiries).orderBy(desc(inquiries.createdAt)).limit(limit);
  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    contact: r.contact,
    message: r.message,
    topic: r.topic,
    createdAt: r.createdAt.toISOString(),
  }));
}

export async function countInquiries() {
  const rows = await db.select({ id: inquiries.id }).from(inquiries);
  return rows.length;
}
