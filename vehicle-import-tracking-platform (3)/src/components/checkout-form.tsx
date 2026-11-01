"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import type { VehicleDTO } from "@/lib/data";
import { DELIVERY_MODES, PAYMENT_PLANS, STAGES } from "@/lib/constants";
import { calculateDuty, formatKes, formatKesFull } from "@/lib/duty";
import { etaPhrase } from "@/lib/format";
import { IconAlert, IconArrow, IconCheck, IconShield } from "./icons";

type Form = {
  name: string;
  email: string;
  phone: string;
  kraPin: string;
  city: string;
  paymentPlan: string;
  deliveryMode: string;
  destinationCity: string;
  notes: string;
  agree: boolean;
};

const STEP_LABELS = ["Your details", "Shipment & payment", "Review & confirm"];

export function CheckoutForm({ vehicle }: { vehicle: VehicleDTO }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Form>({
    name: "",
    email: "",
    phone: "",
    kraPin: "",
    city: "Nairobi",
    paymentPlan: "deposit",
    deliveryMode: "nairobi_inland",
    destinationCity: "Nairobi",
    notes: "",
    agree: false,
  });

  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const duty = useMemo(
    () =>
      calculateDuty({
        fobUsd: vehicle.fobUsd,
        freightUsd: vehicle.freightUsd,
        insuranceUsd: vehicle.insuranceUsd,
        engineCc: vehicle.engineCc,
        fuel: vehicle.fuel,
        crspKes: vehicle.crspKes,
        year: vehicle.year,
        deliveryFeeKes: DELIVERY_MODES.find((m) => m.id === form.deliveryMode)?.feeKes ?? 0,
      }),
    [vehicle, form.deliveryMode]
  );

  const total = form.paymentPlan === "full" ? Math.round(duty.totalLandedKes * 0.985) : duty.totalLandedKes;
  const dueNow =
    form.paymentPlan === "full" ? total : form.paymentPlan === "installments" ? Math.round(total * 0.3) : Math.round(total * 0.3);
  const eta = new Date(Date.now() + (vehicle.transitDays + 22) * 86_400_000);

  const stepValid = (s: number) => {
    if (s === 0) {
      return (
        form.name.trim().length > 2 &&
        /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email.trim()) &&
        form.phone.trim().length >= 9 &&
        form.city.trim().length > 1
      );
    }
    if (s === 1) return form.destinationCity.trim().length > 1;
    return form.agree;
  };

  async function submit() {
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vehicleId: vehicle.id }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not place the order");

      try {
        const raw = localStorage.getItem("bandari.orders");
        const list = raw ? (JSON.parse(raw) as Array<{ ref: string; passcode: string }>) : [];
        list.unshift({ ref: json.ref, passcode: json.passcode });
        localStorage.setItem("bandari.orders", JSON.stringify(list.slice(0, 12)));
      } catch {
        /* storage unavailable */
      }

      router.push(`/order/${json.ref}?confirmed=1`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setBusy(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_minmax(0,380px)] lg:items-start">
      <div className="rounded-sm border border-ink/12 bg-white">
        {/* stepper */}
        <div className="flex flex-wrap gap-1 border-b border-ink/10 bg-paper-2/50 p-3">
          {STEP_LABELS.map((label, i) => {
            const state = i < step ? "done" : i === step ? "active" : "todo";
            return (
              <button
                key={label}
                type="button"
                onClick={() => i < step && setStep(i)}
                disabled={i > step}
                className={`flex flex-1 items-center gap-2.5 rounded-sm px-3 py-2.5 text-left transition-colors ${
                  state === "active"
                    ? "bg-ink text-paper"
                    : state === "done"
                      ? "bg-white text-ink/70 hover:bg-white"
                      : "text-ink/35"
                }`}
              >
                <span
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full font-mono text-[11px] font-bold ${
                    state === "active"
                      ? "bg-signal text-ink"
                      : state === "done"
                        ? "bg-leaf text-white"
                        : "bg-ink/10 text-ink/40"
                  }`}
                >
                  {state === "done" ? <IconCheck width={13} height={13} strokeWidth={3} /> : i + 1}
                </span>
                <span className="text-[12.5px] font-bold uppercase tracking-wide">{label}</span>
              </button>
            );
          })}
        </div>

        <div className="p-5 sm:p-6">
          {step === 0 && (
            <div className="animate-rise grid gap-4 sm:grid-cols-2">
              <Field label="Full name (as on your ID)" span>
                <input
                  className={inputCls}
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="Amina Wanjiru"
                  autoComplete="name"
                />
              </Field>
              <Field label="Email — order updates land here">
                <input
                  className={inputCls}
                  type="email"
                  value={form.email}
                  onChange={(e) => set("email", e.target.value)}
                  placeholder="you@example.co.ke"
                  autoComplete="email"
                />
              </Field>
              <Field label="Mobile (M-Pesa for deposits)">
                <input
                  className={inputCls}
                  value={form.phone}
                  onChange={(e) => set("phone", e.target.value)}
                  placeholder="+254 7xx xxx xxx"
                  autoComplete="tel"
                />
              </Field>
              <Field label="KRA PIN — required for the import entry">
                <input
                  className={inputCls}
                  value={form.kraPin}
                  onChange={(e) => set("kraPin", e.target.value.toUpperCase())}
                  placeholder="A012345678Q"
                />
              </Field>
              <Field label="Town / county">
                <input
                  className={inputCls}
                  value={form.city}
                  onChange={(e) => {
                    set("city", e.target.value);
                    if (!form.destinationCity || form.destinationCity === "Nairobi") set("destinationCity", e.target.value);
                  }}
                  placeholder="Nairobi"
                />
              </Field>
              <p className="sm:col-span-2 flex gap-2 rounded-sm bg-paper-2/70 p-3 text-[12.5px] leading-relaxed text-ink/60">
                <IconShield width={16} height={16} className="mt-0.5 shrink-0 text-ocean" />
                Your KRA PIN is used only to lodge the import entry in iCMS as consignee. We never file a return
                on your behalf.
              </p>
            </div>
          )}

          {step === 1 && (
            <div className="animate-rise grid gap-5">
              <div>
                <p className="label-mono text-ink/50">Where should the car end up?</p>
                <div className="mt-2.5 grid gap-2.5">
                  {DELIVERY_MODES.map((m) => (
                    <RadioCard
                      key={m.id}
                      active={form.deliveryMode === m.id}
                      onClick={() => set("deliveryMode", m.id)}
                      title={m.label}
                      note={m.note}
                      right={m.feeKes ? `+ ${formatKes(m.feeKes)}` : "Included"}
                    />
                  ))}
                </div>
              </div>

              <div>
                <p className="label-mono text-ink/50">How do you want to pay?</p>
                <div className="mt-2.5 grid gap-2.5">
                  {PAYMENT_PLANS.map((p) => (
                    <RadioCard
                      key={p.id}
                      active={form.paymentPlan === p.id}
                      onClick={() => set("paymentPlan", p.id)}
                      title={p.label}
                      note={p.note}
                      right={
                        p.id === "full"
                          ? `${formatKes(total)} now`
                          : `${formatKes(Math.round(total * 0.3))} now`
                      }
                    />
                  ))}
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Delivery town">
                  <input
                    className={inputCls}
                    value={form.destinationCity}
                    onChange={(e) => set("destinationCity", e.target.value)}
                    placeholder="Nairobi"
                  />
                </Field>
                <Field label="Anything the desk should know?">
                  <input
                    className={inputCls}
                    value={form.notes}
                    onChange={(e) => set("notes", e.target.value)}
                    placeholder="Spare tyre, roof rack, preferred colour plates…"
                  />
                </Field>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-rise grid gap-5">
              <div className="rounded-sm border border-ink/12 bg-paper-2/40 p-4">
                <p className="label-mono text-ink/50">Client</p>
                <div className="mt-2 grid gap-x-6 gap-y-1.5 text-[13.5px] sm:grid-cols-2">
                  <Row k="Name" v={form.name || "—"} />
                  <Row k="Email" v={form.email || "—"} />
                  <Row k="Phone" v={form.phone || "—"} />
                  <Row k="KRA PIN" v={form.kraPin || "Not supplied"} />
                  <Row k="Town" v={form.city || "—"} />
                  <Row k="Delivery" v={DELIVERY_MODES.find((m) => m.id === form.deliveryMode)?.label ?? "—"} />
                </div>
              </div>

              <div>
                <p className="label-mono text-ink/50">Full cost breakdown</p>
                <div className="mt-2.5 overflow-hidden rounded-sm border border-ink/12">
                  <table className="w-full text-[13px]">
                    <tbody>
                      {duty.breakdown.map((line) => (
                        <tr key={line.label} className="border-b border-ink/8 odd:bg-white even:bg-paper-2/40">
                          <td className="px-3 py-2">
                            <span className="font-semibold text-ink">{line.label}</span>
                            <span className="block text-[11.5px] text-ink/45">{line.hint}</span>
                          </td>
                          <td className="px-3 py-2 text-right font-mono">{line.amountKes.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="bg-ink text-paper">
                        <td className="px-3 py-2.5 text-[12px] font-bold uppercase tracking-wide">
                          Total landed cost
                        </td>
                        <td className="px-3 py-2.5 text-right font-mono font-bold">{total.toLocaleString()}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-sm border border-ink/12 bg-white p-4">
                <input
                  type="checkbox"
                  checked={form.agree}
                  onChange={(e) => set("agree", e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-ocean"
                />
                <span className="text-[13px] leading-relaxed text-ink/70">
                  I understand this is an import-to-order agreement, that the final duty is set by the KRA iCMS
                  valuation on the day the entry is lodged, that the vehicle must clear the 8-year age rule,
                  and that my {formatKes(dueNow)} deposit secures the bid and is applied to the landed cost.
                </span>
              </label>

              {error && (
                <p className="flex items-center gap-2 rounded-sm border border-clay/30 bg-clay/8 px-4 py-3 text-[13px] font-semibold text-clay">
                  <IconAlert width={16} height={16} />
                  {error}
                </p>
              )}
            </div>
          )}

          {/* nav */}
          <div className="mt-6 flex items-center justify-between gap-3 border-t border-dashed border-ink/15 pt-5">
            <button
              type="button"
              onClick={() => setStep((s) => Math.max(0, s - 1))}
              disabled={step === 0}
              className="rounded-sm border border-ink/20 px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-ink/70 transition-colors enabled:hover:border-ink disabled:opacity-30"
            >
              Back
            </button>

            {step < 2 ? (
              <button
                type="button"
                onClick={() => stepValid(step) && setStep((s) => s + 1)}
                disabled={!stepValid(step)}
                className="flex items-center gap-2 rounded-sm bg-ink px-5 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-paper transition-colors enabled:hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-35"
              >
                Continue <IconArrow width={15} height={15} />
              </button>
            ) : (
              <button
                type="button"
                onClick={submit}
                disabled={!stepValid(2) || busy}
                className="flex items-center gap-2 rounded-sm bg-signal px-6 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {busy ? "Placing order…" : `Confirm & pay ${formatKes(dueNow)}`}
                {!busy && <IconArrow width={15} height={15} />}
              </button>
            )}
          </div>
          {step < 2 && !stepValid(step) && (
            <p className="mt-2 text-right text-[11.5px] text-ink/45">
              {step === 0 ? "Complete your name, a valid email, phone and town to continue." : "Add a delivery town."}
            </p>
          )}
        </div>
      </div>

      {/* summary */}
      <aside className="lg:sticky lg:top-28">
        <div className="overflow-hidden rounded-sm border border-ink/12 bg-white">
          <div className="relative aspect-[16/10] bg-ink">
            <Image
              src={vehicle.heroImage}
              alt={`${vehicle.make} ${vehicle.model}`}
              fill
              sizes="380px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-ink/85 to-transparent" />
            <div className="absolute inset-x-4 bottom-3">
              <p className="font-mono text-[11px] text-signal">{vehicle.stockRef} · {vehicle.grade}</p>
              <p className="font-display text-lg uppercase leading-tight text-paper">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>
          <div className="grid gap-2.5 p-4 text-[13px]">
            <Row k="FOB (auction)" v={formatKes(Math.round(vehicle.fobUsd * 129.5))} />
            <Row k="Freight + insurance" v={formatKes(Math.round((vehicle.freightUsd + vehicle.insuranceUsd) * 129.5))} />
            <Row k={`Tax on ${duty.basis} value`} v={formatKes(duty.totalTaxKes)} />
            {duty.basis === "CRSP" && (
              <p className="rounded-sm bg-signal/12 px-2.5 py-2 text-[11.5px] leading-relaxed text-signal-deep">
                KRA values this unit on the revised CRSP — {formatKes(duty.crspAdjusted)} after{" "}
                {Math.round(duty.depreciationPct * 100)}% age depreciation, {formatKes(duty.valuationUpliftKes)}{" "}
                above the invoice. Every figure here already uses that basis.
              </p>
            )}
            <Row
              k="Clearing, port, NTSA"
              v={formatKes(duty.totalLandedKes - duty.cifKes - duty.totalTaxKes)}
            />
            <div className="my-1 border-t border-dashed border-ink/15" />
            <div className="flex items-baseline justify-between">
              <span className="font-bold text-ink">Total landed</span>
              <span className="font-display text-xl text-ink">{formatKes(total)}</span>
            </div>
            <div className="flex items-baseline justify-between text-ink/65">
              <span>Due to start</span>
              <span className="font-mono font-semibold text-ocean">{formatKesFull(dueNow)}</span>
            </div>
            <div className="flex items-baseline justify-between text-ink/65">
              <span>Balance on release</span>
              <span className="font-mono">{formatKes(total - dueNow)}</span>
            </div>
          </div>
          <div className="border-t border-ink/10 bg-paper-2/50 p-4">
            <p className="label-mono text-ocean">{etaPhrase(eta)}</p>
            <ol className="mt-2.5 grid gap-1.5">
              {STAGES.slice(0, 5).map((s, i) => (
                <li key={s.key} className="flex items-center gap-2 text-[12.5px] text-ink/65">
                  <span className="font-mono text-[10.5px] text-ink/35">{String(i + 1).padStart(2, "0")}</span>
                  {s.short}
                </li>
              ))}
              <li className="flex items-center gap-2 text-[12.5px] text-ink/40">
                <span className="font-mono text-[10.5px]">+5</span> clearing to handover stages
              </li>
            </ol>
          </div>
        </div>
      </aside>
    </div>
  );
}

const inputCls =
  "w-full rounded-sm border border-ink/18 bg-white px-3 py-2.5 text-[14px] outline-none transition-colors focus:border-ocean focus:ring-2 focus:ring-ocean/15";

function Field({
  label,
  children,
  span = false,
}: {
  label: string;
  children: React.ReactNode;
  span?: boolean;
}) {
  return (
    <label className={`block ${span ? "sm:col-span-2" : ""}`}>
      <span className="label-mono block text-ink/50">{label}</span>
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-ink/55">{k}</span>
      <span className="font-mono text-ink">{v}</span>
    </div>
  );
}

function RadioCard({
  active,
  onClick,
  title,
  note,
  right,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  note: string;
  right: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-start gap-3 rounded-sm border p-3.5 text-left transition-colors ${
        active ? "border-ocean bg-ocean/6" : "border-ink/15 bg-white hover:border-ink/40"
      }`}
    >
      <span
        className={`mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border-2 ${
          active ? "border-ocean bg-ocean" : "border-ink/25"
        }`}
      >
        {active && <span className="h-1.5 w-1.5 rounded-full bg-white" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[13.5px] font-bold text-ink">{title}</span>
        <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink/60">{note}</span>
      </span>
      <span className="shrink-0 font-mono text-[12px] font-semibold text-ink/70">{right}</span>
    </button>
  );
}
