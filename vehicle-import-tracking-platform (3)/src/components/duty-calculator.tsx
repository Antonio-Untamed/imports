"use client";

import { useMemo, useState } from "react";
import {
  CRSP_DEPRECIATION,
  DELIVERY_MODES,
  IMPORT_DUTY_RATE,
  IMPORT_DUTY_RATE_ALT,
  USD_TO_KES,
} from "@/lib/constants";
import { calculateDuty, formatKesFull } from "@/lib/duty";
import type { VehicleDTO } from "@/lib/data";
import { IconGauge, IconShield, IconYen } from "./icons";

export function DutyCalculator({ vehicles }: { vehicles: VehicleDTO[] }) {
  const [vehicleId, setVehicleId] = useState<string>(vehicles[0]?.slug ?? "custom");
  const selected = vehicles.find((v) => v.slug === vehicleId);

  const [custom, setCustom] = useState({
    fobUsd: 12000,
    freightUsd: 1450,
    insuranceUsd: 150,
    engineCc: 1800,
    fuel: "petrol",
    crspKes: 4500000,
    year: new Date().getFullYear() - 5,
  });
  const [deliveryMode, setDeliveryMode] = useState<string>("nairobi_inland");
  const [fx, setFx] = useState(USD_TO_KES);
  const [dutyRate, setDutyRate] = useState(IMPORT_DUTY_RATE);
  const [showAll, setShowAll] = useState(false);

  const goCustom = () => setVehicleId("custom");

  const input = selected
    ? {
        fobUsd: selected.fobUsd,
        freightUsd: selected.freightUsd,
        insuranceUsd: selected.insuranceUsd,
        engineCc: selected.engineCc,
        fuel: selected.fuel,
        crspKes: selected.crspKes,
        year: selected.year,
      }
    : custom;

  const result = useMemo(
    () =>
      calculateDuty({
        ...input,
        fx,
        importDutyRate: dutyRate,
        deliveryFeeKes: DELIVERY_MODES.find((m) => m.id === deliveryMode)?.feeKes ?? 0,
      }),
    [input, fx, dutyRate, deliveryMode]
  );

  const taxPct = result.customsValueKes > 0 ? Math.round((result.totalTaxKes / result.customsValueKes) * 100) : 0;
  const shown = showAll ? result.breakdown : result.breakdown.slice(0, 6);

  return (
    <div className="grid gap-0 overflow-hidden rounded-sm border border-ink/12 bg-white lg:grid-cols-[minmax(0,380px)_1fr]">
      {/* controls */}
      <div className="border-b border-ink/10 bg-paper-2/60 p-5 lg:border-b-0 lg:border-r">
        <p className="label-mono flex items-center gap-2 text-ocean">
          <IconGauge width={15} height={15} /> Step 1 · your numbers
        </p>

        <label className="mt-4 block">
          <span className="label-mono text-ink/50">Pick a unit from stock</span>
          <select
            value={vehicleId}
            onChange={(e) => setVehicleId(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/20 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-ocean"
          >
            <option value="custom">Custom — enter my own figures</option>
            {vehicles.map((v) => (
              <option key={v.slug} value={v.slug}>
                {v.year} {v.make} {v.model} {v.trim} · {v.engineCc}cc
              </option>
            ))}
          </select>
        </label>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <NumberField
            label="FOB / auction price (USD)"
            value={input.fobUsd}
            onChange={(v) => {
              goCustom();
              setCustom((c) => ({ ...c, fobUsd: v }));
            }}
            step={100}
          />
          <NumberField
            label="Ocean freight (USD)"
            value={input.freightUsd}
            onChange={(v) => {
              goCustom();
              setCustom((c) => ({ ...c, freightUsd: v }));
            }}
            step={50}
          />
          <NumberField
            label="Marine insurance (USD)"
            value={input.insuranceUsd}
            onChange={(v) => {
              goCustom();
              setCustom((c) => ({ ...c, insuranceUsd: v }));
            }}
            step={10}
          />
          <NumberField
            label="Engine capacity (cc)"
            value={input.engineCc}
            onChange={(v) => {
              goCustom();
              setCustom((c) => ({ ...c, engineCc: v }));
            }}
            step={50}
          />
          <NumberField
            label="KRA CRSP value (KES)"
            value={input.crspKes}
            onChange={(v) => {
              goCustom();
              setCustom((c) => ({ ...c, crspKes: v }));
            }}
            step={50000}
          />
          <NumberField
            label="First registration year"
            value={input.year}
            onChange={(v) => {
              goCustom();
              setCustom((c) => ({ ...c, year: v }));
            }}
            step={1}
          />
        </div>

        <label className="mt-3 block">
          <span className="label-mono text-ink/50">Fuel type</span>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {["petrol", "diesel", "hybrid", "electric"].map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => {
                  goCustom();
                  setCustom((c) => ({ ...c, fuel: f }));
                }}
                className={`rounded-sm border px-3 py-1.5 text-[12px] font-semibold capitalize transition-colors ${
                  input.fuel === f
                    ? "border-ink bg-ink text-paper"
                    : "border-ink/20 bg-white text-ink/65 hover:border-ink/50"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </label>

        <label className="mt-3 block">
          <span className="label-mono text-ink/50">Import duty rate (EAC CET)</span>
          <div className="mt-1.5 flex gap-1.5">
            {[IMPORT_DUTY_RATE, IMPORT_DUTY_RATE_ALT].map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setDutyRate(r)}
                className={`rounded-sm border px-3 py-1.5 font-mono text-[12px] font-semibold transition-colors ${
                  dutyRate === r
                    ? "border-ocean bg-ocean text-white"
                    : "border-ink/20 bg-white text-ink/65 hover:border-ink/50"
                }`}
              >
                {Math.round(r * 100)}%
              </button>
            ))}
            <span className="ml-auto self-center font-mono text-[10.5px] text-ink/40">
              35% applies to bands raised in FY2026/27
            </span>
          </div>
        </label>

        <label className="mt-4 block">
          <span className="label-mono text-ink/50">Delivery mode</span>
          <select
            value={deliveryMode}
            onChange={(e) => setDeliveryMode(e.target.value)}
            className="mt-1.5 w-full rounded-sm border border-ink/20 bg-white px-3 py-2.5 text-sm font-semibold outline-none focus:border-ocean"
          >
            {DELIVERY_MODES.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} {m.feeKes ? `(+ KES ${m.feeKes.toLocaleString()})` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="mt-3 block">
          <span className="label-mono text-ink/50">
            Exchange rate · USD/KES <span className="font-mono text-ink/70">{fx.toFixed(2)}</span>
          </span>
          <input
            type="range"
            min={110}
            max={150}
            step={0.5}
            value={fx}
            onChange={(e) => setFx(Number(e.target.value))}
            className="mt-2 w-full accent-ocean"
          />
        </label>
      </div>

      {/* output */}
      <div className="p-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-ink/45">Step 2 · estimated landed cost</p>
            <p className="mt-1 font-display text-4xl leading-none text-ink">
              {formatKesFull(result.totalLandedKes)}
            </p>
            <p className="mt-2 font-mono text-[12px] text-ink/50">
              Customs value {formatKesFull(result.customsValueKes)} ({result.basis}) · tax &amp; levies{" "}
              {formatKesFull(result.totalTaxKes)} ({taxPct}%)
            </p>
          </div>
          <div className="flex gap-3">
            <div className="rounded-sm border border-signal/40 bg-signal/10 px-4 py-3 text-center">
              <p className="label-mono text-signal-deep">Excise band</p>
              <p className="font-display text-2xl leading-none text-ink">
                {Math.round(result.exciseRate * 100)}%
              </p>
              <p className="font-mono text-[10.5px] text-ink/50">
                {input.engineCc}cc {input.fuel}
              </p>
            </div>
            <div
              className={`rounded-sm border px-4 py-3 text-center ${
                result.basis === "CRSP" ? "border-clay/40 bg-clay/8" : "border-ocean/35 bg-ocean/8"
              }`}
            >
              <p className="label-mono text-ink/55">KRA values on</p>
              <p className="font-display text-2xl leading-none text-ink">{result.basis}</p>
              <p className="font-mono text-[10.5px] text-ink/50">
                {result.basis === "CRSP" ? `+${formatKesFull(result.valuationUpliftKes)}` : "no uplift"}
              </p>
            </div>
          </div>
        </div>

        {/* CRSP valuation panel */}
        <div className="mt-5 rounded-sm border border-ink/12 bg-paper-2/40 p-4">
          <p className="label-mono flex items-center gap-2 text-ocean">
            <IconShield width={14} height={14} /> KRA valuation · CRSP revised schedule
          </p>
          <dl className="mt-3 grid gap-x-6 gap-y-2 text-[13px] sm:grid-cols-2">
            {result.valuation.map((v) => (
              <div key={v.label} className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/12 pb-1.5">
                <dt className="text-ink/60">
                  {v.label}
                  <span className="block font-mono text-[10.5px] text-ink/40">{v.hint}</span>
                </dt>
                <dd className={`font-mono font-semibold ${v.amountKes < 0 ? "text-clay" : "text-ink"}`}>
                  {v.amountKes < 0 ? "−" : ""}
                  {Math.abs(v.amountKes).toLocaleString()}
                </dd>
              </div>
            ))}
          </dl>
          <p className="mt-3 text-[12px] leading-relaxed text-ink/60">
            {result.crspKes === 0
              ? "No CRSP value entered — KRA would substitute its own from the revised schedule, so this estimate is a floor, not a ceiling."
              : result.basis === "CRSP"
                ? `KRA takes the higher of your invoice and the depreciated CRSP. Here the CRSP wins by ${formatKesFull(
                    result.valuationUpliftKes
                  )}, so duty, excise, IDF, RDL and VAT are all charged on that larger base — this is the number to budget for.`
                : "Your declared CIF is above the depreciated CRSP, so CIF governs and there is no valuation uplift to budget for."}
          </p>
        </div>

        <div className="mt-5 overflow-hidden rounded-sm border border-ink/12">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-ink text-paper">
              <tr>
                <th className="label-mono px-3 py-2 font-medium">Component</th>
                <th className="label-mono px-3 py-2 text-right font-medium">Amount</th>
              </tr>
            </thead>
            <tbody>
              {shown.map((line) => (
                <tr key={line.label} className="border-t border-ink/8 odd:bg-white even:bg-paper-2/40">
                  <td className="px-3 py-2">
                    <p className="font-semibold text-ink">{line.label}</p>
                    <p className="text-[11.5px] text-ink/45">{line.hint}</p>
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-ink">{line.amountKes.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t-2 border-ink bg-ink text-paper">
                <td className="px-3 py-2.5 font-bold uppercase tracking-wide text-[12px]">
                  Total to drive away
                </td>
                <td className="px-3 py-2.5 text-right font-mono font-bold">
                  {result.totalLandedKes.toLocaleString()}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="mt-3 text-[12.5px] font-bold uppercase tracking-wider text-ocean hover:underline"
        >
          {showAll ? "Show tax lines only" : `Show all ${result.breakdown.length} cost lines`}
        </button>

        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          <p className="flex gap-2 rounded-sm bg-paper-2/70 p-3 text-[11.5px] leading-relaxed text-ink/60">
            <IconYen width={15} height={15} className="mt-0.5 shrink-0 text-ocean" />
            Excise bands (revised): petrol ≤1,500cc 20% · ≤2,000cc 25% · ≤3,000cc 30% · above 35%. Diesel
            ≤2,500cc 25%, above 35%. Hybrids and EVs 0%.
          </p>
          <p className="flex gap-2 rounded-sm bg-paper-2/70 p-3 text-[11.5px] leading-relaxed text-ink/60">
            <IconShield width={15} height={15} className="mt-0.5 shrink-0 text-ocean" />
            IDF 3.5% (KES 5,000 floor, KES 5,000,000 cap) · RDL 2% (KES 500 floor) · VAT 16% across the whole
            stack. Final value is set by KRA iCMS on the day of entry.
          </p>
        </div>

        <div className="mt-4">
          <p className="label-mono text-ink/45">CRSP age depreciation applied</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CRSP_DEPRECIATION.map((d) => (
              <span
                key={d.age}
                className={`rounded-sm border px-2 py-1 font-mono text-[11px] ${
                  d.age === result.ageYears && result.crspKes > 0
                    ? "border-signal bg-signal/20 font-bold text-signal-deep"
                    : "border-ink/12 text-ink/45"
                }`}
              >
                {d.age === 8 ? "8+" : d.age}y · {Math.round(d.rate * 100)}%
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="label-mono text-ink/50">{label}</span>
      <input
        type="number"
        value={value}
        step={step}
        min={0}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full rounded-sm border border-ink/20 bg-white px-3 py-2 font-mono text-sm outline-none focus:border-ocean"
      />
    </label>
  );
}
