import Image from "next/image";
import Link from "next/link";
import { getFeed, getStats, listOrders, listVehicles } from "@/lib/data";
import { BRAND, STAGES } from "@/lib/constants";
import { formatKes } from "@/lib/duty";
import { etaPhrase, fmtDate } from "@/lib/format";
import { VehicleCard } from "@/components/vehicle-card";
import { DutyCalculator } from "@/components/duty-calculator";
import {
  IconAnchor,
  IconArrow,
  IconChat,
  IconDoc,
  IconRoute,
  IconShield,
  IconShip,
  IconTruck,
  IconGlobe,
  IconUsers,
} from "@/components/icons";

export const dynamic = "force-dynamic";

const HERO_IMAGE =
  "https://images.pexels.com/photos/12841119/pexels-photo-12841119.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200";

const PHASES = [
  {
    icon: IconGlobe,
    n: "01 — 03",
    title: "Source",
    body: "You set a ceiling and a spec. Our Yokohama, Dubai and UK desks bid at USS, TAA, CAA and Manheim, then hand you the auction sheet before a single shilling moves.",
    stages: STAGES.slice(0, 3),
  },
  {
    icon: IconShip,
    n: "04 — 06",
    title: "Ship",
    body: "RoRo or 40ft container, insured for the full CIF value. Bill of lading, container number and vessel AIS all land on your tracking page automatically.",
    stages: STAGES.slice(3, 6),
  },
  {
    icon: IconTruck,
    n: "07 — 10",
    title: "Clear & deliver",
    body: "Our licensed agent lodges the iCMS entry, pays duty, releases the car and either hands it over at Kilindini or drives it to your gate with plates fitted.",
    stages: STAGES.slice(6),
  },
];

const FAQS = [
  {
    q: "What is the 8-year rule and does it kill my choice?",
    a: "Kenya only clears a used vehicle whose first registration is not more than 8 years before the year of import. A 2026 import therefore cannot be older than 2018 first registration. Our inventory is filtered automatically, and units older than that are rejected at listing — you will never spend a deposit on a car that cannot land.",
  },
  {
    q: "How much does it really cost, all in?",
    a: "KRA first fixes the customs value: the higher of your CIF (vehicle + freight + insurance) and the age-depreciated CRSP from the revised July 2025 schedule. On that value it charges 25% import duty, excise duty (0–35% by engine size and fuel), IDF at 3.5%, RDL at 2%, then 16% VAT on the whole stack. Clearing, port charges, inspection and NTSA registration sit on top. Every listing on this site already shows the CRSP-based figure — expect tax to land between 70% and 105% of the customs value.",
  },
  {
    q: "Can I pay in instalments?",
    a: "Yes. Three plans: 30% deposit with the balance due when KRA releases the car, milestone instalments (30 / 30 / 40), or pay in full for a 1.5% discount on the landed cost. Every payment is recorded against your order and posted to your thread with a receipt note.",
  },
  {
    q: "What happens if KRA disputes my declared value?",
    a: "It happens — usually on premium units, and usually because KRA is applying its CRSP rather than your invoice. We price every listing on the CRSP basis up front so the assessed value rarely moves. If it does, your clearing agent files a counter-valuation using the auction sheet, the Japanese export certificate and the export declaration required under Section 23B. That costs two to three days and we tell you the exact extra exposure before asking you for a shilling. Order BM-2603-RV4 on the live board is a real example.",
  },
  {
    q: "How do I follow the shipment?",
    a: "Every order gets a tracking reference like BM-2604-HLX and a 6-digit passcode. Either one works on the tracking page. You get all ten stages, the underlying documents, and a conversation thread where the desk posts photos and you can ask questions.",
  },
  {
    q: "Is the car insured on the water?",
    a: "Marine insurance is quoted into every listing at roughly 1% of CIF and covers institute cargo clauses for the ocean leg. It is included in the CIF that KRA taxes, so it is never an optional extra we hide.",
  },
];

export default async function HomePage() {
  const [featured, orders, stats, feed] = await Promise.all([
    listVehicles({ sort: "popular", limit: 6 }),
    listOrders(),
    getStats(),
    getFeed("all"),
  ]);

  const live = orders.filter((o) => o.stage > 0 && o.stage < STAGES.length - 1);
  const heroOrder = live[0] ?? orders[0];

  return (
    <div>
      {/* ───────────────────────────── hero ───────────────────────────── */}
      <section className="relative overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0">
          <Image
            src={HERO_IMAGE}
            alt="Container vessel loaded at the port"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/92 to-ink/45" />
          <div className="grid-lines absolute inset-0 opacity-60" />
        </div>

        <div className="relative mx-auto grid max-w-[1400px] gap-12 px-4 py-16 sm:px-6 lg:grid-cols-[1.15fr_minmax(0,420px)] lg:py-24">
          <div>
            <p className="label-mono flex flex-wrap items-center gap-x-3 gap-y-1 text-signal">
              <span className="flex items-center gap-1.5">
                <IconAnchor width={13} height={13} /> Yokohama
              </span>
              <span className="text-paper/30">→</span>
              <span>Dubai</span>
              <span className="text-paper/30">→</span>
              <span>Southampton</span>
              <span className="text-paper/30">→</span>
              <span className="text-paper">Kilindini, Mombasa</span>
            </p>

            <h1 className="display-hero mt-5 text-[clamp(2.6rem,7.2vw,5.4rem)] text-paper">
              Import the car.
              <br />
              <span className="text-signal">Watch it cross</span>
              <br />
              the ocean.
            </h1>

            <p className="mt-6 max-w-xl text-[15px] leading-relaxed text-paper/70">
              Bandari Motors buys at Japanese, Gulf and British auctions on your behalf, ships to Mombasa,
              clears with KRA and hands you a plated, logged car. Every one of the ten stages — auction bid,
              QISJ inspection, bill of lading, iCMS entry, release, inland transit — is posted to your
              tracking page with the documents attached.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="group flex items-center gap-2 rounded-sm bg-signal px-6 py-3.5 text-[13px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
              >
                Browse {stats.vehicles} units in stock
                <IconArrow width={16} height={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                href="/track"
                className="flex items-center gap-2 rounded-sm border border-paper/25 px-6 py-3.5 text-[13px] font-bold uppercase tracking-wider text-paper transition-colors hover:border-signal hover:text-signal"
              >
                Track a shipment
              </Link>
            </div>

            <dl className="mt-10 grid max-w-2xl grid-cols-2 gap-x-6 gap-y-5 border-t border-white/10 pt-7 sm:grid-cols-4">
              {[
                { k: "Units cleared", v: `${1140 + stats.orders}`, s: "since 2019" },
                { k: "Median door-to-door", v: "58 days", s: "Japan → Nairobi" },
                { k: "Live consignments", v: String(stats.inTransit), s: "on the board now" },
                { k: "Value handled", v: formatKes(stats.valueHandledKes || 48_600_000), s: "client deposits" },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="label-mono text-[10px] text-paper/45">{s.k}</dt>
                  <dd className="mt-1 font-display text-2xl leading-none text-paper">{s.v}</dd>
                  <dd className="mt-1 font-mono text-[11px] text-paper/40">{s.s}</dd>
                </div>
              ))}
            </dl>
          </div>

          {/* live consignment card */}
          {heroOrder && (
            <aside className="animate-rise self-start rounded-sm border border-white/12 bg-ink-2/85 p-5 backdrop-blur-md">
              <div className="flex items-center justify-between">
                <p className="label-mono text-signal">Live consignment</p>
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-paper/50">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
                  </span>
                  updating
                </span>
              </div>

              <Link href={`/order/${heroOrder.ref}`} className="mt-4 block group">
                <p className="font-mono text-[12px] text-paper/45">{heroOrder.ref}</p>
                <p className="mt-1 font-display text-xl uppercase leading-tight text-paper">
                  {heroOrder.vehicle.year} {heroOrder.vehicle.make} {heroOrder.vehicle.model}
                </p>
                <p className="mt-1 text-[12.5px] text-paper/55">
                  {heroOrder.portOfLoading} → {heroOrder.destinationCity}
                  {heroOrder.vessel ? ` · ${heroOrder.vessel}` : ""}
                </p>
              </Link>

              <div className="mt-5">
                <div className="flex items-center justify-between text-[11.5px] text-paper/55">
                  <span className="font-semibold text-paper">{heroOrder.stageShort}</span>
                  <span className="font-mono">{heroOrder.progressPct}%</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-signal transition-all duration-700"
                    style={{ width: `${Math.max(6, heroOrder.progressPct)}%` }}
                  />
                </div>
                <div className="mt-2 flex justify-between font-mono text-[10.5px] text-paper/35">
                  <span>Ordered {fmtDate(heroOrder.orderDate)}</span>
                  <span className="text-signal">{etaPhrase(heroOrder.eta)}</span>
                </div>
              </div>

              <div className="mt-5 grid gap-2 border-t border-white/10 pt-4">
                <p className="label-mono text-paper/40">Latest from the desk</p>
                <p className="text-[13px] leading-relaxed text-paper/80">
                  {heroOrder.events[heroOrder.events.length - 1]?.title ?? heroOrder.stageLabel}
                </p>
                <Link
                  href={`/order/${heroOrder.ref}`}
                  className="mt-1 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wider text-signal hover:underline"
                >
                  Open full tracking page <IconArrow width={14} height={14} />
                </Link>
              </div>
            </aside>
          )}
        </div>
      </section>

      {/* ───────────────────────── live departure board ───────────────── */}
      <section className="border-b border-ink/10 bg-paper-2">
        <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono text-ocean">Departure board · Kilindini inbound</p>
              <h2 className="mt-2 font-display text-3xl uppercase sm:text-4xl">
                What is on the water right now
              </h2>
            </div>
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-ink/70 hover:text-ocean"
            >
              All orders <IconArrow width={15} height={15} />
            </Link>
          </div>

          <div className="mt-6 overflow-x-auto rounded-sm border border-ink/12 bg-white slim-scroll">
            <table className="w-full min-w-[820px] text-left">
              <thead className="bg-ink text-paper">
                <tr>
                  {["Reference", "Unit", "Route", "Vessel", "Stage", "ETA", ""].map((h) => (
                    <th key={h} className="label-mono px-4 py-3 font-medium">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 6).map((o) => (
                  <tr key={o.id} className="border-t border-ink/8 transition-colors hover:bg-paper-2/50">
                    <td className="px-4 py-3 font-mono text-[12.5px] font-semibold text-ink">{o.ref}</td>
                    <td className="px-4 py-3">
                      <p className="text-[13.5px] font-semibold text-ink">
                        {o.vehicle.year} {o.vehicle.make} {o.vehicle.model}
                      </p>
                      <p className="font-mono text-[11px] text-ink/45">{o.vehicle.stockRef}</p>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-ink/70">
                      {o.portOfLoading} → {o.destinationCity}
                    </td>
                    <td className="px-4 py-3 font-mono text-[12px] text-ink/60">{o.vessel || "TBC"}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-16 overflow-hidden rounded-full bg-ink/10">
                          <span
                            className="block h-full rounded-full bg-ocean"
                            style={{ width: `${Math.max(8, o.progressPct)}%` }}
                          />
                        </span>
                        <span className="text-[12px] font-semibold text-ink/75">{o.stageShort}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[12.5px] text-ink/70">{etaPhrase(o.eta)}</td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/order/${o.ref}`}
                        className="rounded-sm border border-ink/20 px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-ink/70 transition-colors hover:border-ocean hover:bg-ocean hover:text-white"
                      >
                        Track
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-3 font-mono text-[11.5px] text-ink/45">
            Demo consignments are seeded with realistic KRA and vessel data. Try reference{" "}
            <Link href="/order/BM-2604-HLX" className="font-semibold text-ocean hover:underline">
              BM-2604-HLX
            </Link>{" "}
            or passcode <span className="font-semibold">773154</span> on the tracking page.
          </p>
        </div>
      </section>

      {/* ─────────────────────────── how it works ─────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,340px)_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="label-mono text-ocean">The pipeline</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              Ten stages.
              <br />
              Zero guessing.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink/65">
              Most importers give you a phone number and a promise. We give you a pipeline: each stage has a
              place, a typical window and the document that proves it happened. When a stage completes, your
              thread gets the update automatically.
            </p>
            <Link
              href="/how-it-works"
              className="mt-6 inline-flex items-center gap-2 rounded-sm bg-ink px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-paper transition-colors hover:bg-ocean"
            >
              Full process &amp; costs <IconArrow width={15} height={15} />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {PHASES.map((p) => (
              <article
                key={p.title}
                className="flex flex-col rounded-sm border border-ink/12 bg-white p-5 transition-all hover:-translate-y-1 hover:border-ocean/50 hover:shadow-[0_24px_44px_-30px_rgba(10,15,13,0.5)]"
              >
                <div className="flex items-center justify-between">
                  <span className="grid h-10 w-10 place-items-center rounded-sm bg-ocean/10 text-ocean">
                    <p.icon width={20} height={20} />
                  </span>
                  <span className="font-mono text-[11px] text-ink/35">{p.n}</span>
                </div>
                <h3 className="mt-4 font-display text-2xl uppercase">{p.title}</h3>
                <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink/65">{p.body}</p>
                <ul className="mt-4 grid gap-2 border-t border-dashed border-ink/15 pt-4">
                  {p.stages.map((s) => (
                    <li key={s.key} className="flex gap-2 text-[12.5px] text-ink/70">
                      <IconRoute width={14} height={14} className="mt-0.5 shrink-0 text-signal-deep" />
                      <span>
                        <span className="font-semibold text-ink">{s.short}</span>
                        <span className="block font-mono text-[11px] text-ink/40">{s.place}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ─────────────────────────── inventory ────────────────────────── */}
      <section className="border-y border-ink/10 bg-paper-2/50 py-20">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-mono text-ocean">Cleared-ready stock</p>
              <h2 className="mt-2 font-display text-4xl uppercase sm:text-5xl">This week at auction</h2>
            </div>
            <p className="max-w-md text-[13.5px] leading-relaxed text-ink/60">
              Prices below are already the full landed figure — CIF, duty, excise, IDF, RDL, VAT, clearing and
              registration. No surprise invoice in Mombasa.
            </p>
          </div>

          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} priority={i < 3} />
            ))}
          </div>

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-sm border border-ink/12 bg-white p-5">
            <p className="max-w-lg text-[13.5px] leading-relaxed text-ink/70">
              <span className="font-bold text-ink">Cannot see your car?</span> Send us the spec and a ceiling
              price. Our sourcing desk bids on your behalf at the next auction — usually within 7 days.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/marketplace"
                className="rounded-sm bg-ink px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-paper hover:bg-ocean"
              >
                Search all inventory
              </Link>
              <a
                href={`https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent("I want to source a specific vehicle — here is my spec:")}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-sm border border-ink/20 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink hover:border-leaf hover:text-leaf"
              >
                Request a sourcing bid
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ─────────────────────── duty calculator ──────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
          <div>
            <p className="label-mono text-ocean">Do the sums first</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              Kenyan duty,
              <br />
              itemised.
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink/65">
              The tax stack is the part that surprises people. Import duty is 25% of CIF, excise duty depends
              on engine size and fuel, then IDF and RDL, then 16% VAT on the whole thing. Move the sliders and
              watch the landed cost change.
            </p>
            <ul className="mt-6 grid gap-3">
              {[
                { icon: IconShield, t: "Hybrids & EVs pay 0% excise", d: "The single biggest saving available on a modern import." },
                { icon: IconDoc, t: "IDF floor and cap applied", d: "3.5% of CIF, minimum KES 5,000, maximum KES 5,000,000." },
                { icon: IconAnchor, t: "Diesel band changes at 2,500cc", d: "Below it you pay 25%, above it 35%. Worth knowing before you bid." },
              ].map((f) => (
                <li key={f.t} className="flex gap-3 rounded-sm border border-ink/10 bg-white p-3.5">
                  <f.icon width={18} height={18} className="mt-0.5 shrink-0 text-ocean" />
                  <span>
                    <span className="block text-[13.5px] font-bold text-ink">{f.t}</span>
                    <span className="block text-[12.5px] text-ink/60">{f.d}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
          <DutyCalculator vehicles={featured.concat(await listVehicles({ limit: 14 })).slice(0, 14)} />
        </div>
      </section>

      {/* ─────────────────────── engagement feed ──────────────────────── */}
      <section className="bg-ink py-20 text-paper">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <div className="flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="label-mono text-signal">Shared engagements</p>
              <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] text-paper sm:text-5xl">
                Every import has an audience
              </h2>
              <p className="mt-4 max-w-2xl text-[14.5px] leading-relaxed text-paper/65">
                Your order comes with a thread. The desk posts photos at discharge, the agent explains a KRA
                query in plain language, and your family watches the progress bar climb. React, reply, share it
                to WhatsApp — {stats.engagements} posts so far.
              </p>
            </div>
            <Link
              href="/community"
              className="flex items-center gap-2 rounded-sm border border-paper/25 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-paper hover:border-signal hover:text-signal"
            >
              <IconChat width={16} height={16} /> Open the community feed
            </Link>
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-3">
            {feed.slice(0, 3).map((post) => (
              <article
                key={post.id}
                className="flex flex-col rounded-sm border border-white/12 bg-ink-2/70 p-5 transition-colors hover:border-signal/40"
              >
                <div className="flex items-center gap-3">
                  <span className="grid h-9 w-9 place-items-center rounded-full bg-ocean font-mono text-[12px] font-bold text-white">
                    {post.authorName
                      .split(" ")
                      .slice(0, 2)
                      .map((p) => p[0])
                      .join("")}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-[13px] font-bold text-paper">{post.authorName}</p>
                    <p className="font-mono text-[11px] text-paper/40">
                      {post.authorRole === "client" ? "Client" : "Bandari desk"}
                      {post.orderRef ? ` · ${post.orderRef}` : " · Community"}
                    </p>
                  </div>
                </div>
                {post.imageUrl && (
                  <div className="relative mt-4 aspect-[16/9] overflow-hidden rounded-sm">
                    <Image
                      src={post.imageUrl}
                      alt="Post attachment"
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <p className="mt-4 line-clamp-5 flex-1 text-[13.5px] leading-relaxed text-paper/75">{post.body}</p>
                <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3 font-mono text-[11.5px] text-paper/45">
                  <span className="flex items-center gap-1.5">
                    <IconUsers width={13} height={13} />
                    {Object.values(post.reactions).reduce((a, b) => a + b, 0)} reactions
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconChat width={13} height={13} />
                    {post.children.length} replies
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── faq ────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 py-20 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr]">
          <div>
            <p className="label-mono text-ocean">Before you commit</p>
            <h2 className="mt-2 font-display text-4xl uppercase leading-[0.95] sm:text-5xl">
              The awkward questions
            </h2>
            <p className="mt-4 text-[14.5px] leading-relaxed text-ink/65">
              Answered by the people who actually lodge the entries. If yours is not here, the desk replies on
              WhatsApp within the hour during business days.
            </p>
          </div>
          <div className="grid gap-3">
            {FAQS.map((f) => (
              <details
                key={f.q}
                className="group rounded-sm border border-ink/12 bg-white p-5 open:border-ocean/40 open:bg-white"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[15px] font-bold text-ink">
                  {f.q}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-sm border border-ink/15 text-ink/50 transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 border-t border-dashed border-ink/12 pt-3 text-[13.5px] leading-relaxed text-ink/70">
                  {f.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ───────────────────────────── cta ────────────────────────────── */}
      <section className="mx-auto max-w-[1400px] px-4 pb-8 sm:px-6">
        <div className="relative overflow-hidden rounded-sm bg-ocean-dark px-6 py-14 text-paper sm:px-12">
          <div className="grid-lines absolute inset-0 opacity-50" />
          <div className="relative grid gap-8 lg:grid-cols-[1.3fr_1fr] lg:items-center">
            <div>
              <h2 className="display-hero text-[clamp(2rem,5vw,3.6rem)] text-paper">
                Your car is at auction this Tuesday
              </h2>
              <p className="mt-4 max-w-xl text-[14.5px] leading-relaxed text-paper/75">
                Pick a unit, pay a 30% deposit and get a tracking reference in under two minutes. The next
                Japan sailing leaves Yokohama in {STAGES[4].window.replace("Day ", "")}–45 days from order.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <Link
                href="/marketplace"
                className="rounded-sm bg-signal px-6 py-4 text-center text-[13px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
              >
                Choose a vehicle
              </Link>
              <Link
                href="/track"
                className="rounded-sm border border-paper/30 px-6 py-4 text-center text-[13px] font-bold uppercase tracking-wider text-paper transition-colors hover:border-signal hover:text-signal"
              >
                Track an existing order
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
