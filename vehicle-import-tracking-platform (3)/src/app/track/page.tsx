import Link from "next/link";
import type { Metadata } from "next";
import { getAllRefs, getStats } from "@/lib/data";
import { STAGES } from "@/lib/constants";
import { TrackSearch } from "@/components/track-search";
import { IconArrow, IconChat, IconDoc, IconRoute, IconShield } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Track your shipment — Bandari Motors",
  description:
    "Enter your Bandari tracking reference or passcode to see the full 10-stage import pipeline: auction, QISJ inspection, ocean transit, Mombasa discharge, KRA clearing and inland delivery.",
};

const EXPLAINERS = [
  {
    icon: IconRoute,
    title: "Ten stages, always in the same order",
    body: "Order → auction bid → QISJ inspection → loading → ocean transit → Mombasa discharge → KRA clearing → release → inland transit → handover. Anything that is not one of those ten shows up as an update or an alert on the same rail.",
  },
  {
    icon: IconDoc,
    title: "Documents attach themselves",
    body: "The auction sheet, Certificate of Inspection, bill of lading, customs entry and release order are posted as document events against the stage they belong to — download them straight from the timeline.",
  },
  {
    icon: IconChat,
    title: "The thread travels with the car",
    body: "Every consignment has a conversation. The desk posts discharge photos, the clearing agent explains a valuation query, and you can react, reply and share the link with whoever is waiting for the keys.",
  },
  {
    icon: IconShield,
    title: "Passcode sharing",
    body: "Your 6-digit passcode opens the tracking page without an account. Hand it to your spouse, your financier or your mechanic — they see progress and documents, nothing about your payments beyond the balance.",
  },
];

export default async function TrackPage() {
  const [refs, stats] = await Promise.all([getAllRefs(), getStats()]);

  return (
    <div>
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="grid-lines absolute inset-0 opacity-60" />
        <div className="relative mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_minmax(0,520px)] lg:items-center lg:py-20">
          <div>
            <p className="label-mono text-signal">Shipment tracking</p>
            <h1 className="display-hero mt-4 text-[clamp(2.2rem,6vw,4.4rem)] text-paper">
              Where is my car?
            </h1>
            <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-paper/70">
              Type the reference from your order confirmation — it looks like{" "}
              <span className="font-mono text-signal">BM-2604-HLX</span> — or the 6-digit passcode we sent
              with it. You will get the full pipeline, every document, and the conversation thread for that
              consignment.
            </p>
            <dl className="mt-8 grid grid-cols-2 gap-6 border-t border-white/10 pt-6 sm:grid-cols-4">
              {[
                { k: "Consignments", v: String(stats.orders) },
                { k: "On the water", v: String(stats.inTransit) },
                { k: "Delivered", v: String(stats.delivered) },
                { k: "Thread posts", v: String(stats.engagements) },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="label-mono text-[10px] text-paper/45">{s.k}</dt>
                  <dd className="mt-1 font-display text-2xl leading-none">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <TrackSearch suggestions={refs} />
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <div className="grid gap-5 md:grid-cols-2">
          {EXPLAINERS.map((e) => (
            <article key={e.title} className="rounded-sm border border-ink/12 bg-white p-5">
              <span className="grid h-10 w-10 place-items-center rounded-sm bg-ocean/10 text-ocean">
                <e.icon width={20} height={20} />
              </span>
              <h2 className="mt-4 font-display text-xl uppercase">{e.title}</h2>
              <p className="mt-2 text-[13.5px] leading-relaxed text-ink/65">{e.body}</p>
            </article>
          ))}
        </div>

        <div className="mt-12 overflow-hidden rounded-sm border border-ink/12 bg-paper-2/50">
          <div className="border-b border-ink/10 bg-white px-5 py-4">
            <p className="label-mono text-ocean">Stage reference</p>
            <h2 className="mt-1.5 font-display text-2xl uppercase">What each stage means</h2>
          </div>
          <ol className="grid gap-px bg-ink/10 sm:grid-cols-2">
            {STAGES.map((s, i) => (
              <li key={s.key} className="flex gap-4 bg-white p-4">
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink font-mono text-[12px] font-bold text-paper">
                  {i + 1}
                </span>
                <div>
                  <p className="text-[13.5px] font-bold text-ink">{s.label}</p>
                  <p className="mt-1 text-[12.5px] leading-relaxed text-ink/60">{s.detail}</p>
                  <p className="label-mono mt-1.5 text-[10px] text-ocean">
                    {s.place} · {s.window}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 rounded-sm bg-ink px-6 py-6 text-paper">
          <p className="max-w-lg text-[14px] leading-relaxed text-paper/75">
            Waiting on a car you have not ordered yet? The stock list shows landed prices with duty already
            calculated.
          </p>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 rounded-sm bg-signal px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
          >
            Browse inventory <IconArrow width={15} height={15} />
          </Link>
        </div>
      </section>
    </div>
  );
}
