import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { DELIVERY_MODES, PAYMENT_PLANS, STAGES, USD_TO_KES } from "@/lib/constants";
import { FIXED_COSTS } from "@/lib/constants";
import { formatKes } from "@/lib/duty";
import { InquiryForm } from "@/components/inquiry-form";
import { IconArrow, IconCheck, IconDoc, IconShield, IconStar } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How importing works — Bandari Motors",
  description:
    "The complete Kenya vehicle import process: auction sourcing, QISJ inspection, RoRo or container shipping, KRA clearing at Mombasa, inland delivery and NTSA registration — with real cost anatomy.",
};

const PORT_IMAGE =
  "https://images.pexels.com/photos/38393808/pexels-photo-38393808.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";
const NAIROBI_IMAGE =
  "https://images.pexels.com/photos/15496542/pexels-photo-15496542.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

const TESTIMONIALS = [
  {
    quote:
      "I had imported twice before through a guy with a WhatsApp group. The difference here is the timeline — I could see the QISJ certificate the day it was issued and the customs entry number before I was asked for the balance.",
    name: "Fatuma Ali",
    detail: "Corolla Fielder Hybrid · Mombasa · 3rd import",
  },
  {
    quote:
      "KRA queried my RAV4 valuation and I panicked. The agent posted the counter-valuation in the thread with the auction sheet attached and told me the exact worst-case figure. It cleared two days later at my declared value.",
    name: "Brian Otieno",
    detail: "RAV4 X 4WD · Kisumu",
  },
  {
    quote:
      "The excise duty point on hybrids is what sold me. A Note e-POWER at 0% excise landed cheaper than a smaller petrol car I had shortlisted. The calculator showed that before I committed a shilling.",
    name: "Grace Akinyi",
    detail: "Note e-POWER · Eldoret",
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {/* hero */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0">
          <Image src={PORT_IMAGE} alt="Container terminal at dusk" fill priority sizes="100vw" className="object-cover opacity-25" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/85 to-ink/60" />
        </div>
        <div className="relative mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-20">
          <p className="label-mono text-signal">Process, compliance and the real numbers</p>
          <h1 className="display-hero mt-4 max-w-4xl text-[clamp(2.2rem,6.4vw,4.8rem)] text-paper">
            How a car gets from a Japanese auction floor to a Kenyan number plate
          </h1>
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-paper/70">
            Ten stages, roughly 58 days, and a tax stack that can double the auction price. Here is exactly what
            we do at each step, what it costs, and what document proves it happened.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/duty-calculator"
              className="flex items-center gap-2 rounded-sm bg-signal px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
            >
              Open the duty calculator <IconArrow width={15} height={15} />
            </Link>
            <Link
              href="#request"
              className="rounded-sm border border-paper/25 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-paper hover:border-signal hover:text-signal"
            >
              Send a sourcing brief
            </Link>
          </div>
        </div>
      </section>

      {/* stage table */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="label-mono text-ocean">The pipeline in full</p>
            <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Ten stages</h2>
          </div>
          <p className="max-w-md text-[13.5px] leading-relaxed text-ink/60">
            Your tracking page shows all ten. Completed stages carry the timestamp and document that closed
            them; future stages show the typical window so you can plan cash and time.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto rounded-sm border border-ink/12 bg-white slim-scroll">
          <table className="w-full min-w-[760px] text-left text-[13.5px]">
            <thead className="bg-ink text-paper">
              <tr>
                {["#", "Stage", "Where", "Typical window", "What proves it"].map((h) => (
                  <th key={h} className="label-mono px-4 py-3 font-medium">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {STAGES.map((s, i) => (
                <tr key={s.key} className="border-t border-ink/8 align-top odd:bg-white even:bg-paper-2/30">
                  <td className="px-4 py-3.5 font-mono text-[12px] text-ink/40">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="px-4 py-3.5">
                    <p className="font-bold text-ink">{s.label}</p>
                    <p className="mt-1 max-w-md text-[12.5px] leading-relaxed text-ink/60">{s.detail}</p>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-ocean">{s.place}</td>
                  <td className="px-4 py-3.5 font-mono text-[12px] text-ink/60">{s.window}</td>
                  <td className="px-4 py-3.5">
                    <span className="flex items-center gap-1.5 text-[12.5px] text-ink/70">
                      <IconDoc width={14} height={14} className="text-ink/35" />
                      {[
                        "Signed sales agreement + deposit receipt",
                        "Auction sheet & bid confirmation",
                        "QISJ/JEVIC Certificate of Inspection",
                        "Container photos / RoRo loading tally",
                        "Bill of lading + marine insurance policy",
                        "Discharge tally & terminal receipt",
                        "iCMS entry number + valuation sheet",
                        "KRA release order & paid receipts",
                        "Carrier consignment note",
                        "Logbook, plates & handover checklist",
                      ][i]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* cost anatomy */}
      <section className="border-y border-ink/10 bg-paper-2/50 py-16">
        <div className="mx-auto grid max-w-[1400px] gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:items-start">
          <div>
            <p className="label-mono text-ocean">Cost anatomy</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              Why a USD 12,000 car costs KES 4.2M
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink/70">
              KRA does not tax your invoice — it taxes the <strong>higher</strong> of your CIF value and the
              depreciated CRSP from its revised July 2025 schedule. Excise duty then compounds on top of
              import duty, and VAT applies to the whole stack including the levies. On a mid-size petrol unit
              the tax alone typically lands between 70% and 100% of the customs value.
            </p>

            <div className="mt-7 grid gap-3">
              {[
                ["Customs value", "max()", "The higher of your CIF (invoice + freight + insurance) and the age-depreciated KRA CRSP. Everything below is charged on this."],
                ["Import duty", "25%", "EAC Common External Tariff on the customs value. Some bands moved to 35% in FY2026/27 — our calculator lets you switch."],
                ["Excise duty", "0 – 35%", "Revised bands by engine size and fuel: petrol 20% to 35%, diesel 25% or 35% either side of 2,500cc, hybrids and EVs 0%."],
                ["IDF", "3.5%", "Import Declaration Fee — KES 5,000 minimum, KES 5,000,000 cap."],
                ["RDL", "2%", "Railway Development Levy — KES 500 minimum."],
                ["VAT", "16%", "Charged on the customs value plus every duty and levy above it."],
              ].map(([k, rate, d]) => (
                <div key={k} className="flex gap-4 rounded-sm border border-ink/12 bg-white p-4">
                  <span className="w-20 shrink-0 font-display text-xl leading-none text-ocean">{rate}</span>
                  <span>
                    <span className="block text-[13.5px] font-bold uppercase tracking-wide text-ink">{k}</span>
                    <span className="mt-1 block text-[12.5px] leading-relaxed text-ink/60">{d}</span>
                  </span>
                </div>
              ))}
            </div>

            <p className="mt-6 font-mono text-[12px] leading-relaxed text-ink/50">
              Depreciation on CRSP: 0% at under a year, then 10 / 20 / 30 / 40 / 50%, then 55 / 60 / 65% for
              years six to eight. Indicative rate used across this site: USD/KES {USD_TO_KES.toFixed(2)}. Clearing{" "}
              {formatKes(FIXED_COSTS.clearingAgentKes)} · port charges {formatKes(FIXED_COSTS.portChargesKes)} ·
              NTSA registration {formatKes(FIXED_COSTS.registrationKes)}.
            </p>
          </div>

          <div className="grid gap-5">
            <div className="relative aspect-[16/10] overflow-hidden rounded-sm border border-ink/12">
              <Image
                src={NAIROBI_IMAGE}
                alt="Nairobi expressway from above"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/25 to-transparent" />
              <div className="absolute inset-x-5 bottom-4">
                <p className="label-mono text-signal">Inland leg</p>
                <p className="mt-1 font-display text-xl uppercase leading-tight text-paper">
                  Mombasa to Nairobi in 6 hours
                </p>
              </div>
            </div>

            <div className="rounded-sm border border-ink/12 bg-white p-5">
              <p className="label-mono flex items-center gap-2 text-ocean">
                <IconShield width={14} height={14} /> Compliance gates we will not skip
              </p>
              <ul className="mt-3 grid gap-2.5">
                {[
                  "8-year age limit measured from first registration, not model year.",
                  "QISJ or JEVIC roadworthiness inspection before loading — KEBS will not waive it.",
                  "Right-hand drive only. Left-hand-drive vehicles cannot be registered in Kenya.",
                  "Import entry lodged by a licensed clearing agent against your own KRA PIN.",
                  "Marine insurance for the ocean leg at roughly 1% of CIF, quoted into every listing.",
                ].map((t) => (
                  <li key={t} className="flex gap-2.5 text-[13px] leading-relaxed text-ink/70">
                    <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-leaf" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* payment + delivery */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <p className="label-mono text-ocean">Paying for it</p>
            <h2 className="mt-2 font-display text-3xl uppercase">Three plans, no hidden fee</h2>
            <div className="mt-5 grid gap-3">
              {PAYMENT_PLANS.map((p) => (
                <div key={p.id} className="rounded-sm border border-ink/12 bg-white p-4">
                  <p className="text-[14px] font-bold text-ink">{p.label}</p>
                  <p className="mt-1.5 text-[13px] leading-relaxed text-ink/60">{p.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-[12.5px] leading-relaxed text-ink/50">
              Deposits are taken by M-Pesa paybill or bank transfer and are applied to the landed cost — they
              are not a separate fee. Every payment is recorded against your order and posted to your thread.
            </p>
          </div>

          <div>
            <p className="label-mono text-ocean">Getting it home</p>
            <h2 className="mt-2 font-display text-3xl uppercase">Three delivery modes</h2>
            <div className="mt-5 grid gap-3">
              {DELIVERY_MODES.map((m) => (
                <div key={m.id} className="flex items-start justify-between gap-4 rounded-sm border border-ink/12 bg-white p-4">
                  <div>
                    <p className="text-[14px] font-bold text-ink">{m.label}</p>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-ink/60">{m.note}</p>
                  </div>
                  <span className="shrink-0 font-mono text-[13px] font-semibold text-ocean">
                    {m.feeKes ? formatKes(m.feeKes) : "Free"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* testimonials */}
      <section className="border-y border-ink/10 bg-ink py-16 text-paper">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <p className="label-mono text-signal">From the people waiting at the gate</p>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {TESTIMONIALS.map((t) => (
              <figure key={t.name} className="flex flex-col rounded-sm border border-white/12 bg-ink-2/70 p-5">
                <span className="flex gap-0.5 text-signal">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <IconStar key={i} width={15} height={15} fill="currentColor" strokeWidth={0} />
                  ))}
                </span>
                <blockquote className="mt-4 flex-1 text-[13.5px] leading-relaxed text-paper/80">
                  “{t.quote}”
                </blockquote>
                <figcaption className="mt-4 border-t border-white/10 pt-3">
                  <p className="text-[13px] font-bold text-paper">{t.name}</p>
                  <p className="font-mono text-[11.5px] text-paper/45">{t.detail}</p>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* request */}
      <section id="request" className="mx-auto max-w-[1400px] scroll-mt-28 px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,380px)_1fr] lg:items-start">
          <div>
            <p className="label-mono text-ocean">Not in stock?</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              We bid on your behalf
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink/65">
              Give us the spec, a ceiling price in landed Kenyan shillings and a deadline. Our desk prices it
              back within a day — FOB, freight, tax stack and total — and if you approve, we bid at the next
              USS Tokyo, TAA or Manheim session.
            </p>
            <ul className="mt-6 grid gap-2.5">
              {[
                "Auction sheet sent to you before the bid is confirmed",
                "Ceiling price respected — we stop bidding at your number",
                "Deposit only requested once a unit is won",
                "Same 10-stage tracking and thread as stock units",
              ].map((t) => (
                <li key={t} className="flex gap-2.5 text-[13px] text-ink/70">
                  <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-leaf" />
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <InquiryForm />
        </div>
      </section>
    </div>
  );
}
