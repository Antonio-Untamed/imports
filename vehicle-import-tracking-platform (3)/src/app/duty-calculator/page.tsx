import Link from "next/link";
import type { Metadata } from "next";
import { listVehicles } from "@/lib/data";
import { CRSP_DEPRECIATION, CRSP_SOURCE, USD_TO_KES } from "@/lib/constants";
import { DutyCalculator } from "@/components/duty-calculator";
import { IconArrow, IconShield } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kenya import duty calculator — Bandari Motors",
  description:
    "Calculate the full landed cost of importing a vehicle into Kenya: CIF, 25% import duty, excise duty by engine size and fuel, IDF, RDL, 16% VAT, clearing, port charges and NTSA registration.",
};

const BANDS = [
  { cc: "Up to 1,500cc", petrol: "20%", diesel: "25%", note: "Note, Fit, Probox, small sedans" },
  { cc: "1,501 – 2,000cc", petrol: "25%", diesel: "25%", note: "RAV4, Harrier, Forester, CX-5 petrol" },
  { cc: "2,001 – 2,500cc", petrol: "30%", diesel: "25%", note: "Vanguard, diesel crossovers" },
  { cc: "2,501 – 3,000cc", petrol: "30%", diesel: "35%", note: "Triton, Hilux 2.8, D-Max" },
  { cc: "Above 3,000cc", petrol: "35%", diesel: "35%", note: "Large petrol and diesel units" },
  { cc: "Hybrid & electric", petrol: "0%", diesel: "0%", note: "Excise waived — the biggest single saving" },
];

export default async function DutyCalculatorPage() {
  const vehicles = await listVehicles({ limit: 14 });

  return (
    <div>
      <section className="border-b border-ink/10 bg-ink text-paper">
        <div className="grid-lines">
          <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
            <p className="label-mono text-signal">Landed cost calculator · KRA bands</p>
            <h1 className="display-hero mt-3 max-w-3xl text-[clamp(2.1rem,6vw,4.4rem)] text-paper">
              Know the tax bill before you fall in love with a car
            </h1>
            <p className="mt-5 max-w-2xl text-[15px] leading-relaxed text-paper/70">
              KRA values your car on the{" "}
              <span className="font-semibold text-signal">Current Retail Selling Price</span> schedule,
              depreciated by age, and taxes whichever is higher — that figure or your declared CIF. Then comes
              import duty, excise banded by engine size and fuel, IDF at 3.5%, RDL at 2% and 16% VAT across the
              lot, plus clearing, port charges, inspection and registration. Indicative rate USD/KES{" "}
              <span className="font-mono text-signal">{USD_TO_KES.toFixed(2)}</span>.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <DutyCalculator vehicles={vehicles} />


        {/* CRSP method */}
        <div className="mt-14 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-start">
          <div>
            <p className="label-mono text-ocean">{CRSP_SOURCE}</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              What CRSP actually does to your bill
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink/70">
              KRA does not simply accept the price on your invoice. It keeps a Current Retail Selling Price for
              every make and model — over 5,200 of them in the schedule revised in July 2025 — depreciates that
              figure by the age of the car, and then taxes{" "}
              <span className="font-bold text-ink">whichever is higher</span>: your declared CIF or the
              depreciated CRSP. On most 2019–2020 units the CRSP wins, which is why a &ldquo;cheap&rdquo; auction
              car can still carry a heavy duty bill.
            </p>
            <ol className="mt-6 grid gap-3">
              {[
                ["Look up the CRSP", "The list price for that exact model in the KRA schedule."],
                ["Apply age depreciation", "Years from first registration, capped at 65% for an 8-year-old car."],
                ["Compare with your CIF", "Invoice + freight + insurance to Mombasa."],
                ["Take the higher figure", "That becomes the customs value everything else is charged on."],
                ["Stack the taxes", "Import duty, excise, IDF, RDL, then VAT across the whole lot."],
              ].map(([t, d], i) => (
                <li key={t} className="flex gap-3.5 rounded-sm border border-ink/12 bg-white p-4">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-ocean font-mono text-[12px] font-bold text-white">
                    {i + 1}
                  </span>
                  <span>
                    <span className="block text-[13.5px] font-bold text-ink">{t}</span>
                    <span className="mt-0.5 block text-[12.5px] leading-relaxed text-ink/60">{d}</span>
                  </span>
                </li>
              ))}
            </ol>
            <p className="mt-5 rounded-sm border-l-2 border-signal bg-signal/8 p-4 text-[12.5px] leading-relaxed text-ink/70">
              The 2025 revision was challenged in court by the Car Importers Association of Kenya, so treat
              every figure here as indicative. Your clearing agent confirms the assessed value on iCMS before
              we ask you for the balance — and if KRA moves the goalposts, we tell you the exact exposure
              first.
            </p>
          </div>

          <div className="grid gap-4">
            <div className="overflow-hidden rounded-sm border border-ink/12 bg-white">
              <div className="border-b border-ink/10 bg-paper-2/60 px-5 py-4">
                <p className="label-mono text-ocean">Age depreciation on CRSP</p>
                <h3 className="mt-1.5 font-display text-xl uppercase">Direct used imports</h3>
              </div>
              <table className="w-full text-left text-[13px]">
                <thead className="bg-ink text-paper">
                  <tr>
                    <th className="label-mono px-4 py-2.5 font-medium">Age from first registration</th>
                    <th className="label-mono px-4 py-2.5 text-right font-medium">Depreciation</th>
                    <th className="label-mono px-4 py-2.5 text-right font-medium">CRSP used</th>
                  </tr>
                </thead>
                <tbody>
                  {CRSP_DEPRECIATION.map((d) => (
                    <tr key={d.age} className="border-t border-ink/8 odd:bg-white even:bg-paper-2/30">
                      <td className="px-4 py-2.5 text-ink/70">{d.label}</td>
                      <td className="px-4 py-2.5 text-right font-mono text-clay">
                        {Math.round(d.rate * 100)}%
                      </td>
                      <td className="px-4 py-2.5 text-right font-mono font-semibold text-ocean">
                        {Math.round((1 - d.rate) * 100)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rounded-sm border border-ink/12 bg-ink p-5 text-paper">
              <p className="label-mono text-signal">Worked example</p>
              <p className="mt-2.5 text-[13.5px] leading-relaxed text-paper/75">
                A 2020 RAV4 with a CRSP of KES 6,850,000 sits 6 years from first registration, so KRA allows
                55% depreciation: the customs value becomes KES 3,082,500. A declared CIF of KES 2,740,867 is
                lower, so the CRSP governs and every tax line is calculated on the bigger number — roughly
                KES 342,000 more value in the tax base before duty is even applied.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-start">
          <div className="overflow-hidden rounded-sm border border-ink/12 bg-white">
            <div className="border-b border-ink/10 bg-paper-2/60 px-5 py-4">
              <p className="label-mono text-ocean">Excise duty bands</p>
              <h2 className="mt-1.5 font-display text-2xl uppercase">Engine size decides everything</h2>
            </div>
            <table className="w-full text-left text-[13px]">
              <thead className="bg-ink text-paper">
                <tr>
                  {["Capacity", "Petrol", "Diesel", "Typical units"].map((h) => (
                    <th key={h} className="label-mono px-4 py-2.5 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {BANDS.map((b) => (
                  <tr key={b.cc} className="border-t border-ink/8 odd:bg-white even:bg-paper-2/30">
                    <td className="px-4 py-3 font-mono text-[12.5px] text-ink">{b.cc}</td>
                    <td className="px-4 py-3 font-display text-base text-ocean">{b.petrol}</td>
                    <td className="px-4 py-3 font-display text-base text-ocean">{b.diesel}</td>
                    <td className="px-4 py-3 text-[12.5px] text-ink/60">{b.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid gap-4">
            <div className="rounded-sm border border-ink/12 bg-paper-2/60 p-5">
              <p className="label-mono flex items-center gap-2 text-ocean">
                <IconShield width={14} height={14} /> Reading the result
              </p>
              <ul className="mt-3 grid gap-2.5 text-[13px] leading-relaxed text-ink/70">
                <li>· KRA taxes the higher of your CIF and the age-depreciated CRSP.</li>
                <li>· Excise duty compounds: it is charged on CIF <em>plus</em> import duty.</li>
                <li>· VAT is charged last, on everything including IDF and RDL.</li>
                <li>· KRA may substitute its own current-year book value if it disagrees with your invoice.</li>
                <li>· Demurrage starts after the free days at Kilindini — we clear inside the window.</li>
              </ul>
            </div>

            <div className="rounded-sm border border-ink/12 bg-white p-5">
              <p className="label-mono text-ink/50">Three ways to cut the bill legally</p>
              <ol className="mt-3 grid gap-3">
                {[
                  { t: "Go hybrid", d: "0% excise duty, and hybrids carry low CRSP entries. On a 2.0L unit that is roughly KES 400–700K saved." },
                  { t: "Stay under the diesel 2,500cc line", d: "25% instead of 35% — a Hilux 2.8 costs materially more than a 2.4 Triton." },
                  { t: "Buy at auction, not from a dealer", d: "A lower FOB lowers CIF, and every downstream percentage shrinks with it." },
                ].map((s, i) => (
                  <li key={s.t} className="flex gap-3">
                    <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-signal font-mono text-[11px] font-bold text-ink">
                      {i + 1}
                    </span>
                    <span>
                      <span className="block text-[13.5px] font-bold text-ink">{s.t}</span>
                      <span className="block text-[12.5px] leading-relaxed text-ink/60">{s.d}</span>
                    </span>
                  </li>
                ))}
              </ol>
              <Link
                href="/marketplace"
                className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-ink px-4 py-3 text-[12px] font-bold uppercase tracking-wider text-paper hover:bg-ocean"
              >
                Apply this to real stock <IconArrow width={14} height={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
