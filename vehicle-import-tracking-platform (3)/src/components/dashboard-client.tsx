"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { OrderDTO } from "@/lib/data";
import { STAGES } from "@/lib/constants";
import { formatKes } from "@/lib/duty";
import { etaPhrase, fmtDate } from "@/lib/format";
import { IconArrow, IconChat, IconClock, IconPin, IconShip } from "./icons";

export function DashboardClient({ orders }: { orders: OrderDTO[] }) {
  const [mine, setMine] = useState<string[] | null>(null);
  const [scope, setScope] = useState<"mine" | "all">("mine");

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bandari.orders");
      const list = raw ? (JSON.parse(raw) as Array<{ ref: string }>) : [];
      const refs = list.map((l) => l.ref).filter((r) => orders.some((o) => o.ref === r));
      setMine(refs);
      if (refs.length === 0) setScope("all");
    } catch {
      setMine([]);
      setScope("all");
    }
  }, [orders]);

  const shown = useMemo(() => {
    if (scope === "all" || !mine?.length) return orders;
    return orders.filter((o) => mine.includes(o.ref));
  }, [orders, mine, scope]);

  const totals = shown.reduce(
    (acc, o) => ({
      committed: acc.committed + o.totalKes,
      paid: acc.paid + o.paidKes,
      balance: acc.balance + o.balanceKes,
      progress: acc.progress + o.progressPct,
    }),
    { committed: 0, paid: 0, balance: 0, progress: 0 }
  );
  const avgProgress = shown.length ? Math.round(totals.progress / shown.length) : 0;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setScope("mine")}
            disabled={!mine?.length}
            className={`rounded-sm px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider transition-colors disabled:opacity-35 ${
              scope === "mine" ? "bg-ink text-paper" : "border border-ink/20 text-ink/65 hover:border-ink/50"
            }`}
          >
            My orders {mine?.length ? `(${mine.length})` : ""}
          </button>
          <button
            type="button"
            onClick={() => setScope("all")}
            className={`rounded-sm px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider transition-colors ${
              scope === "all" ? "bg-ink text-paper" : "border border-ink/20 text-ink/65 hover:border-ink/50"
            }`}
          >
            All demo consignments ({orders.length})
          </button>
        </div>
        <p className="font-mono text-[11.5px] text-ink/45">
          Orders you place in this browser are remembered locally — no account needed.
        </p>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { k: "Committed value", v: formatKes(totals.committed), s: `${shown.length} consignment${shown.length === 1 ? "" : "s"}` },
          { k: "Paid to date", v: formatKes(totals.paid), s: "across all your orders" },
          { k: "Outstanding", v: formatKes(totals.balance), s: "due on release or handover" },
          { k: "Average progress", v: `${avgProgress}%`, s: `of the ${STAGES.length}-stage pipeline` },
        ].map((s) => (
          <div key={s.k} className="rounded-sm border border-ink/12 bg-white p-4">
            <dt className="label-mono text-ink/45">{s.k}</dt>
            <dd className="mt-1.5 font-display text-2xl leading-none text-ink">{s.v}</dd>
            <dd className="mt-1.5 font-mono text-[11px] text-ink/45">{s.s}</dd>
          </div>
        ))}
      </dl>

      {shown.length === 0 ? (
        <div className="mt-8 rounded-sm border border-dashed border-ink/25 bg-white/60 p-12 text-center">
          <p className="font-display text-2xl uppercase text-ink/70">No orders yet</p>
          <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink/55">
            Pick a unit from the stock list, pay a 30% deposit and your consignment appears here with a
            tracking reference.
          </p>
          <Link
            href="/marketplace"
            className="mt-5 inline-flex items-center gap-2 rounded-sm bg-signal px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink"
          >
            Browse inventory <IconArrow width={15} height={15} />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4">
          {shown.map((o) => (
            <article
              key={o.id}
              className="grid gap-0 overflow-hidden rounded-sm border border-ink/12 bg-white transition-shadow hover:shadow-[0_24px_46px_-32px_rgba(10,15,13,0.55)] md:grid-cols-[minmax(0,220px)_1fr_minmax(0,240px)]"
            >
              <Link href={`/order/${o.ref}`} className="group relative block aspect-[16/10] bg-ink md:aspect-auto">
                <Image
                  src={o.vehicle.heroImage}
                  alt={`${o.vehicle.make} ${o.vehicle.model}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 220px"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <span className="label-mono absolute left-2.5 top-2.5 rounded-sm bg-ink/80 px-2 py-1 text-paper backdrop-blur">
                  {o.ref}
                </span>
              </Link>

              <div className="p-4 sm:p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/order/${o.ref}`}
                    className="font-display text-lg uppercase leading-tight text-ink hover:text-ocean"
                  >
                    {o.vehicle.year} {o.vehicle.make} {o.vehicle.model} {o.vehicle.trim}
                  </Link>
                  <span
                    className={`label-mono ml-auto rounded-sm px-2 py-1 ${
                      o.stage >= STAGES.length - 1 ? "bg-leaf text-white" : o.stage >= 5 ? "bg-ocean text-white" : "bg-signal text-ink"
                    }`}
                  >
                    {o.stageShort}
                  </span>
                </div>

                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink/10">
                  <div
                    className="h-full rounded-full bg-ocean transition-all duration-700"
                    style={{ width: `${Math.max(4, o.progressPct)}%` }}
                  />
                </div>

                <div className="mt-3 grid gap-x-5 gap-y-1.5 text-[12.5px] text-ink/65 sm:grid-cols-2">
                  <span className="flex items-center gap-1.5">
                    <IconShip width={14} height={14} className="text-ink/35" />
                    {o.vessel || "Vessel to be confirmed"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconPin width={14} height={14} className="text-ink/35" />
                    {o.portOfLoading} → {o.destinationCity}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconClock width={14} height={14} className="text-ink/35" />
                    {etaPhrase(o.eta)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <IconChat width={14} height={14} className="text-ink/35" />
                    {o.engagements.length} thread post{o.engagements.length === 1 ? "" : "s"}
                  </span>
                </div>

                <p className="mt-3 border-t border-dashed border-ink/12 pt-3 text-[12.5px] leading-relaxed text-ink/55">
                  <span className="font-semibold text-ink/75">Latest:</span>{" "}
                  {o.events[o.events.length - 1]?.title ?? o.stageLabel}
                </p>
              </div>

              <div className="flex flex-col justify-between gap-3 border-t border-ink/10 bg-paper-2/40 p-4 md:border-l md:border-t-0">
                <dl className="grid gap-2 text-[12.5px]">
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink/50">Landed cost</dt>
                    <dd className="font-mono font-semibold text-ink">{formatKes(o.totalKes)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink/50">Paid</dt>
                    <dd className="font-mono text-leaf">{formatKes(o.paidKes)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink/50">Balance</dt>
                    <dd className="font-mono text-clay">{formatKes(o.balanceKes)}</dd>
                  </div>
                  <div className="flex items-baseline justify-between gap-2">
                    <dt className="text-ink/50">Ordered</dt>
                    <dd className="font-mono text-ink/70">{fmtDate(o.orderDate)}</dd>
                  </div>
                </dl>
                <Link
                  href={`/order/${o.ref}`}
                  className="flex items-center justify-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-paper transition-colors hover:bg-ocean"
                >
                  Open tracking <IconArrow width={14} height={14} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
