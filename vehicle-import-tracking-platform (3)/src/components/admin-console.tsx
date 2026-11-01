"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BRAND, CRSP_DEPRECIATION, MAKES, waLink } from "@/lib/constants";
import { calculateDuty, formatKes, formatKesFull } from "@/lib/duty";
import { fmtDateTime } from "@/lib/format";
import {
  IconAlert,
  IconArrow,
  IconCar,
  IconChat,
  IconCheck,
  IconClose,
  IconDoc,
  IconPlus,
  IconShield,
  IconWhatsApp,
  IconYen,
} from "./icons";

type AdminVehicle = {
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
  transitDays: number;
  status: string;
  popularity: number;
  orderCount: number;
};

type Inquiry = {
  id: number;
  name: string;
  contact: string;
  message: string;
  topic: string;
  createdAt: string;
  waLink: string;
};

const EMPTY_FORM = {
  make: "Toyota",
  model: "",
  trim: "",
  year: String(new Date().getFullYear() - 5),
  mileageKm: "45000",
  engineCc: "1500",
  fuel: "petrol",
  transmission: "CVT",
  drivetrain: "2WD",
  bodyType: "SUV",
  color: "White",
  seats: "5",
  origin: "Japan",
  sourceNote: "",
  grade: "Grade 4.5 · Interior B",
  heroImage: "",
  gallery: "",
  features: "",
  summary: "",
  fobUsd: "",
  freightUsd: "1450",
  insuranceUsd: "160",
  crspKes: "",
  transitDays: "38",
  status: "available",
  popularity: "60",
};

type FormState = typeof EMPTY_FORM;

export function AdminConsole() {
  const [pin, setPin] = useState("");
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [gateError, setGateError] = useState<string | null>(null);

  const [vehicles, setVehicles] = useState<AdminVehicle[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [tab, setTab] = useState<"units" | "editor" | "callbacks">("units");
  const [editing, setEditing] = useState<AdminVehicle | null>(null);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ kind: "ok" | "err"; text: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  const headers = useCallback(
    () => ({ "Content-Type": "application/json", "x-admin-pin": pin }),
    [pin]
  );

  const load = useCallback(
    async (activePin: string) => {
      const h = { "Content-Type": "application/json", "x-admin-pin": activePin };
      const [v, i] = await Promise.all([
        fetch("/api/admin/vehicles", { headers: h }),
        fetch("/api/admin/inquiries", { headers: h }),
      ]);
      if (!v.ok) throw new Error((await v.json().catch(() => ({}))).error ?? "PIN rejected");
      const vj = await v.json();
      const ij = await i.json();
      setVehicles(vj.vehicles ?? []);
      setInquiries(ij.inquiries ?? []);
      return true;
    },
    []
  );

  useEffect(() => {
    const stored = sessionStorage.getItem("bandari.admin.pin");
    if (stored) {
      setPin(stored);
      load(stored)
        .then(() => setAuthed(true))
        .catch(() => sessionStorage.removeItem("bandari.admin.pin"))
        .finally(() => setChecking(false));
    } else {
      setChecking(false);
    }
  }, [load]);

  async function unlock(e: React.FormEvent) {
    e.preventDefault();
    setGateError(null);
    try {
      await load(pin);
      sessionStorage.setItem("bandari.admin.pin", pin);
      setAuthed(true);
    } catch (err) {
      setGateError(err instanceof Error ? err.message : "Could not unlock the console");
    }
  }

  function logout() {
    sessionStorage.removeItem("bandari.admin.pin");
    setAuthed(false);
    setPin("");
    setVehicles([]);
    setInquiries([]);
  }

  const openNew = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setTab("editor");
  };

  const openEdit = (v: AdminVehicle) => {
    setEditing(v);
    setForm({
      ...EMPTY_FORM,
      make: v.make,
      model: v.model,
      trim: v.trim,
      year: String(v.year),
      mileageKm: String(v.mileageKm),
      engineCc: String(v.engineCc),
      fuel: v.fuel,
      transmission: v.transmission,
      drivetrain: v.drivetrain,
      bodyType: v.bodyType,
      color: v.color,
      seats: String(v.seats),
      origin: v.origin,
      sourceNote: v.sourceNote,
      grade: v.grade,
      heroImage: v.heroImage,
      gallery: v.gallery.join(", "),
      features: v.features.join(", "),
      summary: v.summary,
      fobUsd: String(v.fobUsd),
      freightUsd: String(v.freightUsd),
      insuranceUsd: String(v.insuranceUsd),
      crspKes: String(v.crspKes || ""),
      transitDays: String(v.transitDays),
      status: v.status,
      popularity: String(v.popularity),
    });
    setMessage(null);
    setTab("editor");
  };

  const preview = useMemo(
    () =>
      calculateDuty({
        fobUsd: Number(form.fobUsd) || 0,
        freightUsd: Number(form.freightUsd) || 0,
        insuranceUsd: Number(form.insuranceUsd) || 0,
        engineCc: Number(form.engineCc) || 1500,
        fuel: form.fuel,
        crspKes: Number(form.crspKes) || 0,
        year: Number(form.year) || undefined,
      }),
    [form]
  );

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setMessage(null);
    const urls: string[] = [];
    for (const file of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", file);
      try {
        const res = await fetch("/api/admin/upload", { method: "POST", headers: { "x-admin-pin": pin }, body: fd });
        const json = await res.json();
        if (res.ok && json.url) urls.push(json.url);
        else setMessage({ kind: "err", text: json.error ?? "Upload failed" });
      } catch {
        setMessage({ kind: "err", text: "Upload failed — check the file type and size" });
      }
    }
    if (urls.length) {
      setForm((f) => ({
        ...f,
        heroImage: f.heroImage || urls[0],
        gallery: [...(f.gallery ? f.gallery.split(",").map((s) => s.trim()).filter(Boolean) : []), ...urls].join(", "),
      }));
      setMessage({ kind: "ok", text: `${urls.length} image${urls.length === 1 ? "" : "s"} uploaded` });
    }
    setUploading(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMessage(null);
    const payload = {
      make: form.make,
      model: form.model,
      trim: form.trim,
      year: Number(form.year),
      mileageKm: Number(form.mileageKm) || 0,
      engineCc: Number(form.engineCc) || 0,
      fuel: form.fuel,
      transmission: form.transmission,
      drivetrain: form.drivetrain,
      bodyType: form.bodyType,
      color: form.color,
      seats: Number(form.seats) || 5,
      origin: form.origin,
      sourceNote: form.sourceNote,
      grade: form.grade,
      heroImage: form.heroImage,
      gallery: form.gallery.split(",").map((s) => s.trim()).filter(Boolean),
      features: form.features.split(",").map((s) => s.trim()).filter(Boolean),
      summary: form.summary,
      fobUsd: Number(form.fobUsd) || 0,
      freightUsd: Number(form.freightUsd) || 0,
      insuranceUsd: Number(form.insuranceUsd) || 0,
      crspKes: Number(form.crspKes) || 0,
      transitDays: Number(form.transitDays) || 38,
      status: form.status,
      popularity: Number(form.popularity) || 0,
    };
    try {
      const res = editing
        ? await fetch(`/api/admin/vehicles/${editing.id}`, { method: "PUT", headers: headers(), body: JSON.stringify(payload) })
        : await fetch("/api/admin/vehicles", { method: "POST", headers: headers(), body: JSON.stringify(payload) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not save");
      setMessage({ kind: "ok", text: editing ? "Unit updated" : "Unit published to the marketplace" });
      await load(pin);
      if (!editing) {
        setForm(EMPTY_FORM);
      }
      setTab("units");
    } catch (err) {
      setMessage({ kind: "err", text: err instanceof Error ? err.message : "Could not save" });
    } finally {
      setBusy(false);
    }
  }

  async function setStatus(v: AdminVehicle, status: string) {
    setVehicles((prev) => prev.map((p) => (p.id === v.id ? { ...p, status } : p)));
    const res = await fetch(`/api/admin/vehicles/${v.id}`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ ...v, status }),
    });
    if (!res.ok) {
      const json = await res.json().catch(() => ({}));
      setMessage({ kind: "err", text: json.error ?? "Status update failed" });
      await load(pin);
    }
  }

  async function remove(v: AdminVehicle) {
    if (!window.confirm(`Delete the ${v.year} ${v.make} ${v.model}? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/vehicles/${v.id}`, { method: "DELETE", headers: headers() });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) setMessage({ kind: "err", text: json.error ?? "Delete failed" });
    else {
      setMessage({ kind: "ok", text: "Unit deleted" });
      setVehicles((prev) => prev.filter((p) => p.id !== v.id));
    }
  }

  /* --------------------------------- gate --------------------------------- */
  if (checking) {
    return (
      <div className="grid min-h-[50vh] place-items-center">
        <p className="label-mono animate-pulse text-ink/50">Checking the office key…</p>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="mx-auto max-w-md px-4 py-20">
        <div className="rounded-sm border border-ink/15 bg-white p-7">
          <span className="grid h-11 w-11 place-items-center rounded-sm bg-ink text-signal">
            <IconShield width={22} height={22} />
          </span>
          <h1 className="mt-5 font-display text-3xl uppercase">Admin console</h1>
          <p className="mt-2 text-[13.5px] leading-relaxed text-ink/60">
            Restricted to the Bandari import desk. Enter the office PIN to publish units, edit stock and read
            callback requests.
          </p>
          <form onSubmit={unlock} className="mt-6">
            <label className="label-mono block text-ink/50">Office PIN</label>
            <input
              type="password"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              autoFocus
              placeholder="••••••••"
              className="mt-1.5 w-full rounded-sm border border-ink/20 px-3 py-3 font-mono text-[15px] tracking-widest outline-none focus:border-ocean"
            />
            {gateError && (
              <p className="mt-3 flex items-center gap-2 rounded-sm border border-clay/30 bg-clay/8 px-3 py-2.5 text-[13px] font-semibold text-clay">
                <IconAlert width={15} height={15} /> {gateError}
              </p>
            )}
            <button
              type="submit"
              disabled={pin.length < 4}
              className="mt-4 w-full rounded-sm bg-signal px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-40"
            >
              Unlock console
            </button>
          </form>
          <p className="mt-5 border-t border-dashed border-ink/15 pt-4 font-mono text-[11px] leading-relaxed text-ink/40">
            Demo PIN: <span className="font-semibold text-ink/70">bandari2026</span> — override with the
            ADMIN_PIN environment variable in production. Callbacks route to {BRAND.phone}.
          </p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-ocean hover:underline">
            <IconArrow width={14} height={14} className="rotate-180" /> Back to the site
          </Link>
        </div>
      </div>
    );
  }

  /* -------------------------------- console ------------------------------- */
  const available = vehicles.filter((v) => v.status === "available").length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink/10 pb-5">
        <div>
          <p className="label-mono text-ocean">Import desk · admin console</p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,4.6vw,3.2rem)] uppercase leading-[0.95]">
            Stock &amp; callbacks
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={openNew}
            className="flex items-center gap-2 rounded-sm bg-signal px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
          >
            <IconPlus width={15} height={15} /> Upload a unit
          </button>
          <button
            type="button"
            onClick={logout}
            className="rounded-sm border border-ink/20 px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-ink/65 hover:border-clay hover:text-clay"
          >
            Lock
          </button>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Units on the books", v: String(vehicles.length), s: `${available} available to order` },
          {
            k: "Reserved / in transit",
            v: String(vehicles.filter((v) => v.status === "reserved" || v.status === "in_transit").length),
            s: "attached to live orders",
          },
          { k: "Callback requests", v: String(inquiries.length), s: `routing to ${BRAND.phone}` },
          {
            k: "Stock value (landed)",
            v: formatKes(
              vehicles.reduce(
                (s, v) =>
                  s +
                  calculateDuty({
                    fobUsd: v.fobUsd,
                    freightUsd: v.freightUsd,
                    insuranceUsd: v.insuranceUsd,
                    engineCc: v.engineCc,
                    fuel: v.fuel,
                    crspKes: v.crspKes,
                    year: v.year,
                  }).totalLandedKes,
                0
              )
            ),
            s: "at the CRSP-revised basis",
          },
        ].map((s) => (
          <div key={s.k} className="rounded-sm border border-ink/12 bg-white p-4">
            <dt className="label-mono text-ink/45">{s.k}</dt>
            <dd className="mt-1.5 font-display text-2xl leading-none text-ink">{s.v}</dd>
            <dd className="mt-1.5 font-mono text-[11px] text-ink/45">{s.s}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 flex flex-wrap gap-2">
        {(
          [
            ["units", `Units on sale (${vehicles.length})`, IconCar],
            ["editor", editing ? `Edit ${editing.make} ${editing.model}` : "Upload a unit", IconPlus],
            ["callbacks", `Callback requests (${inquiries.length})`, IconChat],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 rounded-sm px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider transition-colors ${
              tab === id ? "bg-ink text-paper" : "border border-ink/20 text-ink/65 hover:border-ink/50"
            }`}
          >
            <Icon width={15} height={15} /> {label}
          </button>
        ))}
      </div>

      {message && (
        <p
          className={`animate-rise mt-4 flex items-center gap-2 rounded-sm border px-4 py-3 text-[13px] font-semibold ${
            message.kind === "ok"
              ? "border-leaf/35 bg-leaf/8 text-leaf"
              : "border-clay/35 bg-clay/8 text-clay"
          }`}
        >
          {message.kind === "ok" ? <IconCheck width={16} height={16} /> : <IconAlert width={16} height={16} />}
          {message.text}
          <button type="button" onClick={() => setMessage(null)} className="ml-auto opacity-60 hover:opacity-100">
            <IconClose width={14} height={14} />
          </button>
        </p>
      )}

      {/* ── units ── */}
      {tab === "units" && (
        <div className="mt-5 overflow-x-auto rounded-sm border border-ink/12 bg-white slim-scroll">
          <table className="w-full min-w-[940px] text-left text-[13px]">
            <thead className="bg-ink text-paper">
              <tr>
                {["Unit", "Year", "FOB", "CRSP", "Landed", "Basis", "Status", "Orders", ""].map((h) => (
                  <th key={h} className="label-mono px-3 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => {
                const d = calculateDuty({
                  fobUsd: v.fobUsd,
                  freightUsd: v.freightUsd,
                  insuranceUsd: v.insuranceUsd,
                  engineCc: v.engineCc,
                  fuel: v.fuel,
                  crspKes: v.crspKes,
                  year: v.year,
                });
                return (
                  <tr key={v.id} className="border-t border-ink/8 align-middle odd:bg-white even:bg-paper-2/30">
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-3">
                        <span className="relative h-11 w-16 shrink-0 overflow-hidden rounded-sm bg-ink/10">
                          {v.heroImage && (
                            <Image src={v.heroImage} alt="" fill sizes="64px" className="object-cover" />
                          )}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-bold text-ink">
                            {v.make} {v.model} {v.trim}
                          </span>
                          <span className="block font-mono text-[11px] text-ink/45">
                            {v.stockRef} · {v.engineCc}cc {v.fuel}
                          </span>
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">{v.year}</td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">${v.fobUsd.toLocaleString()}</td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">
                      {v.crspKes ? (v.crspKes / 1_000_000).toFixed(2) + "M" : <span className="text-clay">missing</span>}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px] font-semibold">{formatKes(d.totalLandedKes)}</td>
                    <td className="px-3 py-2.5">
                      <span
                        className={`label-mono rounded-sm px-1.5 py-1 ${
                          d.basis === "CRSP" ? "bg-signal/25 text-signal-deep" : "bg-ocean/12 text-ocean-dark"
                        }`}
                      >
                        {d.basis}
                      </span>
                    </td>
                    <td className="px-3 py-2.5">
                      <select
                        value={v.status}
                        onChange={(e) => setStatus(v, e.target.value)}
                        className="rounded-sm border border-ink/15 bg-white px-2 py-1.5 text-[12px] font-semibold outline-none focus:border-ocean"
                      >
                        {["available", "reserved", "in_transit", "sold"].map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12.5px]">{v.orderCount}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex justify-end gap-1.5">
                        <Link
                          href={`/vehicles/${v.slug}`}
                          className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/60 hover:border-ocean hover:text-ocean"
                        >
                          View
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEdit(v)}
                          className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-ink/60 hover:border-ink hover:text-ink"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => remove(v)}
                          className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wide text-clay hover:border-clay hover:bg-clay hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {vehicles.length === 0 && (
            <p className="p-8 text-center text-[13.5px] text-ink/50">
              No units yet. Upload your first vehicle to publish it to the marketplace.
            </p>
          )}
        </div>
      )}

      {/* ── editor ── */}
      {tab === "editor" && (
        <form onSubmit={save} className="mt-5 grid gap-6 lg:grid-cols-[1fr_minmax(0,360px)] lg:items-start">
          <div className="rounded-sm border border-ink/12 bg-white p-5">
            <h2 className="font-display text-2xl uppercase">
              {editing ? `Edit ${editing.make} ${editing.model}` : "Upload a unit on sale"}
            </h2>
            <p className="mt-1.5 text-[13px] text-ink/55">
              Everything here publishes straight to /marketplace. The KRA CRSP field drives the duty the client
              sees, so get it from the revised schedule.
            </p>

            {/* photos */}
            <div className="mt-5 rounded-sm border border-dashed border-ink/25 bg-paper-2/40 p-4">
              <p className="label-mono flex items-center gap-2 text-ink/55">
                <IconDoc width={14} height={14} /> Photos
              </p>
              <label className="mt-3 flex cursor-pointer flex-wrap items-center justify-center gap-2 rounded-sm border border-ink/20 bg-white px-4 py-6 text-center transition-colors hover:border-ocean">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  multiple
                  className="hidden"
                  onChange={(e) => uploadFiles(e.target.files)}
                />
                <IconPlus width={18} height={18} className="text-ocean" />
                <span className="text-[13px] font-semibold text-ink">
                  {uploading ? "Uploading…" : "Upload photos from your device"}
                </span>
                <span className="w-full font-mono text-[11px] text-ink/45">JPEG · PNG · WebP · up to 8 MB each</span>
              </label>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <Field label="Main photo URL" hint="Set automatically after an upload">
                  <input
                    className={inputCls}
                    value={form.heroImage}
                    onChange={(e) => set("heroImage", e.target.value)}
                    placeholder="/uploads/1699…jpg or https://…"
                  />
                </Field>
                <Field label="Gallery URLs" hint="Comma separated">
                  <input
                    className={inputCls}
                    value={form.gallery}
                    onChange={(e) => set("gallery", e.target.value)}
                    placeholder="/uploads/a.jpg, /uploads/b.jpg"
                  />
                </Field>
              </div>
              {form.heroImage && (
                <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-sm border border-ink/12">
                  <Image src={form.heroImage} alt="Preview" fill sizes="360px" className="object-cover" />
                </div>
              )}
            </div>

            {/* identity */}
            <p className="label-mono mt-6 text-ocean">Vehicle identity</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="Make">
                <input className={inputCls} list="makes" value={form.make} onChange={(e) => set("make", e.target.value)} />
                <datalist id="makes">
                  {MAKES.map((m) => (
                    <option key={m} value={m} />
                  ))}
                </datalist>
              </Field>
              <Field label="Model">
                <input className={inputCls} value={form.model} onChange={(e) => set("model", e.target.value)} placeholder="RAV4" />
              </Field>
              <Field label="Trim">
                <input className={inputCls} value={form.trim} onChange={(e) => set("trim", e.target.value)} placeholder="X 2.0 4WD" />
              </Field>
              <Field label="First registration year">
                <input type="number" className={inputCls} value={form.year} onChange={(e) => set("year", e.target.value)} />
              </Field>
              <Field label="Odometer (km)">
                <input type="number" className={inputCls} value={form.mileageKm} onChange={(e) => set("mileageKm", e.target.value)} />
              </Field>
              <Field label="Engine (cc)">
                <input type="number" className={inputCls} value={form.engineCc} onChange={(e) => set("engineCc", e.target.value)} />
              </Field>
              <Field label="Fuel">
                <select className={inputCls} value={form.fuel} onChange={(e) => set("fuel", e.target.value)}>
                  {["petrol", "diesel", "hybrid", "electric"].map((f) => (
                    <option key={f}>{f}</option>
                  ))}
                </select>
              </Field>
              <Field label="Body type">
                <input className={inputCls} value={form.bodyType} onChange={(e) => set("bodyType", e.target.value)} />
              </Field>
              <Field label="Transmission">
                <input className={inputCls} value={form.transmission} onChange={(e) => set("transmission", e.target.value)} />
              </Field>
              <Field label="Drivetrain">
                <input className={inputCls} value={form.drivetrain} onChange={(e) => set("drivetrain", e.target.value)} />
              </Field>
              <Field label="Colour">
                <input className={inputCls} value={form.color} onChange={(e) => set("color", e.target.value)} />
              </Field>
              <Field label="Seats">
                <input type="number" className={inputCls} value={form.seats} onChange={(e) => set("seats", e.target.value)} />
              </Field>
              <Field label="Ships from">
                <select className={inputCls} value={form.origin} onChange={(e) => set("origin", e.target.value)}>
                  {["Japan", "UK", "UAE", "Singapore", "South Africa"].map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              </Field>
              <Field label="Auction / source note">
                <input className={inputCls} value={form.sourceNote} onChange={(e) => set("sourceNote", e.target.value)} placeholder="USS Tokyo — Lot 4412" />
              </Field>
              <Field label="Grade">
                <input className={inputCls} value={form.grade} onChange={(e) => set("grade", e.target.value)} />
              </Field>
            </div>

            {/* money */}
            <p className="label-mono mt-6 flex items-center gap-2 text-ocean">
              <IconYen width={14} height={14} /> Pricing &amp; KRA valuation
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <Field label="FOB / auction price (USD)">
                <input type="number" className={inputCls} value={form.fobUsd} onChange={(e) => set("fobUsd", e.target.value)} />
              </Field>
              <Field label="Ocean freight (USD)">
                <input type="number" className={inputCls} value={form.freightUsd} onChange={(e) => set("freightUsd", e.target.value)} />
              </Field>
              <Field label="Marine insurance (USD)">
                <input type="number" className={inputCls} value={form.insuranceUsd} onChange={(e) => set("insuranceUsd", e.target.value)} />
              </Field>
              <Field label="KRA CRSP (KES)" hint="From the revised schedule">
                <input
                  type="number"
                  className={`${inputCls} font-semibold`}
                  value={form.crspKes}
                  onChange={(e) => set("crspKes", e.target.value)}
                  placeholder="6850000"
                />
              </Field>
              <Field label="Transit days">
                <input type="number" className={inputCls} value={form.transitDays} onChange={(e) => set("transitDays", e.target.value)} />
              </Field>
              <Field label="Status">
                <select className={inputCls} value={form.status} onChange={(e) => set("status", e.target.value)}>
                  {["available", "reserved", "in_transit", "sold"].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </Field>
            </div>

            <div className="mt-4 grid gap-3">
              <Field label="Equipment" hint="Comma separated">
                <input
                  className={inputCls}
                  value={form.features}
                  onChange={(e) => set("features", e.target.value)}
                  placeholder="Sunroof, Leather seats, 360° camera"
                />
              </Field>
              <Field label="Sales summary">
                <textarea
                  rows={3}
                  className={`${inputCls} resize-y`}
                  value={form.summary}
                  onChange={(e) => set("summary", e.target.value)}
                  placeholder="Why this unit, its history and what the client should know."
                />
              </Field>
            </div>

            <div className="mt-5 flex flex-wrap gap-2.5 border-t border-dashed border-ink/15 pt-5">
              <button
                type="submit"
                disabled={busy}
                className="flex items-center gap-2 rounded-sm bg-signal px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
              >
                {busy ? "Saving…" : editing ? "Save changes" : "Publish unit"}
                {!busy && <IconArrow width={15} height={15} />}
              </button>
              {editing && (
                <button
                  type="button"
                  onClick={openNew}
                  className="rounded-sm border border-ink/20 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink/65 hover:border-ink"
                >
                  Cancel edit
                </button>
              )}
            </div>
          </div>

          {/* live preview */}
          <aside className="grid gap-4 lg:sticky lg:top-28">
            <div className="rounded-sm border border-ink/12 bg-ink p-5 text-paper">
              <p className="label-mono text-signal">Live client preview</p>
              <p className="mt-2 font-display text-3xl leading-none">{formatKes(preview.totalLandedKes)}</p>
              <p className="mt-2 font-mono text-[11.5px] text-paper/55">
                landed cost the client will see on the listing
              </p>

              <dl className="mt-4 grid gap-2 border-t border-white/10 pt-4 text-[12.5px]">
                {[
                  ["Declared CIF", formatKesFull(preview.cifKes)],
                  ["CRSP (list)", preview.crspKes ? formatKesFull(preview.crspKes) : "not set"],
                  [`Age depreciation`, preview.crspKes ? `${Math.round(preview.depreciationPct * 100)}% · ${preview.ageYears} yr` : "—"],
                  ["Depreciated CRSP", preview.crspKes ? formatKesFull(preview.crspAdjusted) : "—"],
                  ["Customs value applied", formatKesFull(preview.customsValueKes)],
                ].map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-3">
                    <dt className="text-paper/55">{k}</dt>
                    <dd className="font-mono text-paper">{v}</dd>
                  </div>
                ))}
              </dl>

              <p className="mt-4 rounded-sm bg-white/8 p-3 text-[12px] leading-relaxed text-paper/80">
                {preview.crspKes === 0
                  ? "No CRSP entered — duty will be assessed on the declared CIF. Add the CRSP so the client sees the true KRA position."
                  : preview.basis === "CRSP"
                    ? `KRA will assess on the depreciated CRSP, ${formatKes(preview.valuationUpliftKes)} above your invoice. The client sees this uplift before ordering.`
                    : "Your declared CIF is higher than the depreciated CRSP, so CIF governs. Good — no valuation surprise."}
              </p>

              <dl className="mt-4 grid gap-1.5 border-t border-white/10 pt-4 font-mono text-[12px] text-paper/70">
                {[
                  [`Import duty ${Math.round(preview.importDutyRate * 100)}%`, preview.importDuty],
                  [`Excise ${Math.round(preview.exciseRate * 100)}%`, preview.exciseDuty],
                  ["IDF 3.5%", preview.idf],
                  ["RDL 2%", preview.rdl],
                  ["VAT 16%", preview.vat],
                ].map(([k, v]) => (
                  <div key={k as string} className="flex items-baseline justify-between gap-3">
                    <dt>{k}</dt>
                    <dd>{(v as number).toLocaleString()}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-sm border border-ink/12 bg-white p-4">
              <p className="label-mono text-ink/50">KRA depreciation schedule</p>
              <ul className="mt-2.5 grid grid-cols-3 gap-1.5">
                {CRSP_DEPRECIATION.map((d) => (
                  <li
                    key={d.age}
                    className={`rounded-sm border px-2 py-1.5 text-center font-mono text-[11px] ${
                      d.age === preview.ageYears && preview.crspKes > 0
                        ? "border-signal bg-signal/15 text-signal-deep"
                        : "border-ink/12 text-ink/55"
                    }`}
                  >
                    {d.age === 8 ? "8+" : d.age}y · {Math.round(d.rate * 100)}%
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </form>
      )}

      {/* ── callbacks ── */}
      {tab === "callbacks" && (
        <div className="mt-5 grid gap-4">
          <div className="flex flex-wrap items-center gap-3 rounded-sm border border-leaf/30 bg-leaf/8 p-4">
            <IconWhatsApp width={20} height={20} className="text-leaf" />
            <p className="text-[13px] leading-relaxed text-ink/75">
              Every callback request opens a pre-filled WhatsApp chat to{" "}
              <span className="font-mono font-bold">{BRAND.phone}</span> the moment the client hits send — the
              record below is your backup log.
            </p>
            <a
              href={waLink("Bandari Motors admin console — checking in.")}
              target="_blank"
              rel="noreferrer"
              className="ml-auto rounded-sm bg-leaf px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-white"
            >
              Open WhatsApp
            </a>
          </div>

          {inquiries.length === 0 ? (
            <p className="rounded-sm border border-dashed border-ink/25 bg-white/60 p-10 text-center text-[13.5px] text-ink/50">
              No callback requests yet. They appear here the moment a client submits the sourcing brief.
            </p>
          ) : (
            inquiries.map((i) => (
              <article key={i.id} className="rounded-sm border border-ink/12 bg-white p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[14px] font-bold text-ink">{i.name}</p>
                  <span className="label-mono rounded-sm bg-ink/8 px-2 py-0.5 text-ink/60">{i.topic}</span>
                  <span className="ml-auto font-mono text-[11.5px] text-ink/40">{fmtDateTime(i.createdAt)}</span>
                </div>
                <p className="mt-2 whitespace-pre-line text-[13.5px] leading-relaxed text-ink/75">{i.message}</p>
                <div className="mt-3 flex flex-wrap gap-2 border-t border-dashed border-ink/12 pt-3">
                  <a
                    href={i.waLink}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 rounded-sm bg-leaf px-3.5 py-2 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-leaf/90"
                  >
                    <IconWhatsApp width={14} height={14} /> Reply on WhatsApp
                  </a>
                  <a
                    href={`tel:${i.contact.replace(/[^\d+]/g, "")}`}
                    className="rounded-sm border border-ink/20 px-3.5 py-2 font-mono text-[12px] text-ink/70 hover:border-ocean hover:text-ocean"
                  >
                    {i.contact}
                  </a>
                </div>
              </article>
            ))
          )}
        </div>
      )}
    </div>
  );

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }
}

const inputCls =
  "w-full rounded-sm border border-ink/18 bg-white px-3 py-2.5 text-[13.5px] outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/15";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="label-mono block text-ink/50">{label}</span>
      <span className="mt-1.5 block">{children}</span>
      {hint && <span className="mt-1 block font-mono text-[10.5px] text-ink/35">{hint}</span>}
    </label>
  );
}
