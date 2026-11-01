import Link from "next/link";
import type { Metadata } from "next";
import { getFeed, listOrders, getStats } from "@/lib/data";
import { STAGES } from "@/lib/constants";
import { formatKes } from "@/lib/duty";
import { etaPhrase } from "@/lib/format";
import { EngagementBoard } from "@/components/engagement-board";
import { IconArrow, IconChat, IconFire, IconUsers } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Community feed — Bandari Motors",
  description:
    "Import advice, auction results, clearing war stories and live shipment updates shared by Bandari Motors clients and the cargo desk.",
};

export default async function CommunityPage() {
  const [feed, orders, stats] = await Promise.all([getFeed("all"), listOrders(), getStats()]);

  const authors = new Map<string, { name: string; posts: number; reactions: number; role: string }>();
  const countReactions = (nodes: typeof feed): number =>
    nodes.reduce(
      (s, n) => s + Object.values(n.reactions).reduce((a, b) => a + b, 0) + countReactions(n.children),
      0
    );
  const walk = (nodes: typeof feed) => {
    for (const n of nodes) {
      const entry = authors.get(n.authorHandle) ?? {
        name: n.authorName,
        posts: 0,
        reactions: 0,
        role: n.authorRole,
      };
      entry.posts += 1;
      entry.reactions += Object.values(n.reactions).reduce((a, b) => a + b, 0);
      authors.set(n.authorHandle, entry);
      walk(n.children);
    }
  };
  walk(feed);
  const leaderboard = [...authors.values()].sort((a, b) => b.reactions - a.reactions).slice(0, 6);

  return (
    <div>
      <section className="border-b border-ink/10 bg-ink text-paper">
        <div className="grid-lines">
          <div className="mx-auto flex max-w-[1400px] flex-wrap items-end justify-between gap-6 px-4 py-14 sm:px-6">
            <div>
              <p className="label-mono text-signal">Shared engagements</p>
              <h1 className="display-hero mt-3 text-[clamp(2.2rem,6vw,4.4rem)] text-paper">
                The import floor
              </h1>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-paper/70">
                Auction wins, valuation queries, discharge photos, resale advice and the occasional celebration
                when a logbook lands. {stats.engagements} posts, {countReactions(feed)} reactions — every
                consignment thread is public unless the client hides it.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-x-8 gap-y-4">
              {[
                { k: "Posts", v: String(stats.engagements) },
                { k: "Consignments", v: String(stats.orders) },
                { k: "On the water", v: String(stats.inTransit) },
                { k: "Handed over", v: String(stats.delivered) },
              ].map((s) => (
                <div key={s.k}>
                  <dt className="label-mono text-[10px] text-paper/45">{s.k}</dt>
                  <dd className="mt-1 font-display text-2xl leading-none text-paper">{s.v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1fr_minmax(0,340px)] lg:items-start">
        <EngagementBoard
          initial={feed}
          title="Everything the community is saying"
          subtitle="Filter to desk-only updates when you just want the operational facts, or to client chatter for the unvarnished experience."
          shareUrl="https://bandarimotors.co.ke/community"
        />

        <aside className="grid gap-4 lg:sticky lg:top-28">
          <div className="rounded-sm border border-ink/12 bg-white p-5">
            <p className="label-mono flex items-center gap-2 text-ocean">
              <IconFire width={14} height={14} /> Most reacted voices
            </p>
            <ol className="mt-3 grid gap-2.5">
              {leaderboard.map((a, i) => (
                <li key={a.name} className="flex items-center gap-3">
                  <span className="font-mono text-[11px] text-ink/30">{String(i + 1).padStart(2, "0")}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[13px] font-bold text-ink">{a.name}</span>
                    <span className="block font-mono text-[11px] text-ink/45">
                      {a.posts} post{a.posts === 1 ? "" : "s"} ·{" "}
                      {a.role === "client" ? "client" : "Bandari desk"}
                    </span>
                  </span>
                  <span className="rounded-sm bg-signal/15 px-2 py-1 font-mono text-[11px] font-semibold text-signal-deep">
                    {a.reactions}
                  </span>
                </li>
              ))}
            </ol>
          </div>

          <div className="rounded-sm border border-ink/12 bg-white p-5">
            <p className="label-mono flex items-center gap-2 text-ocean">
              <IconChat width={14} height={14} /> Threads on the water
            </p>
            <ul className="mt-3 grid gap-2.5">
              {orders
                .filter((o) => o.stage > 0 && o.stage < STAGES.length - 1)
                .map((o) => (
                  <li key={o.id}>
                    <Link
                      href={`/order/${o.ref}`}
                      className="group block rounded-sm border border-ink/10 p-3 transition-colors hover:border-ocean/45 hover:bg-paper-2/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-mono text-[11.5px] font-semibold text-ink">{o.ref}</span>
                        <span className="label-mono text-ocean">{o.stageShort}</span>
                      </div>
                      <p className="mt-1 truncate text-[13px] font-semibold text-ink group-hover:text-ocean">
                        {o.vehicle.year} {o.vehicle.make} {o.vehicle.model}
                      </p>
                      <p className="mt-1 font-mono text-[11px] text-ink/45">
                        {etaPhrase(o.eta)} · {formatKes(o.totalKes)}
                      </p>
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div className="rounded-sm border border-ink/12 bg-paper-2/60 p-5">
            <p className="label-mono flex items-center gap-2 text-ink/55">
              <IconUsers width={14} height={14} /> House rules
            </p>
            <ul className="mt-3 grid gap-2 text-[12.5px] leading-relaxed text-ink/65">
              <li>· Post auction sheets and discharge photos — they help everyone price reality.</li>
              <li>· No client KRA PINs, logbook numbers or phone numbers in public threads.</li>
              <li>· The desk answers valuation queries with figures, not reassurance.</li>
              <li>· Sold units stay visible as reference for what we can source again.</li>
            </ul>
            <Link
              href="/marketplace"
              className="mt-4 flex items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-paper hover:bg-ocean"
            >
              Start your own order <IconArrow width={14} height={14} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
