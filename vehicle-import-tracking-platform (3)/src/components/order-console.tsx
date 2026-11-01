"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { OrderDTO } from "@/lib/data";
import { STAGES } from "@/lib/constants";
import { formatKes, formatKesFull } from "@/lib/duty";
import { IconArrow, IconCheck, IconDoc, IconRoute } from "./icons";

export function OrderConsole({ order }: { order: OrderDTO }) {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [amount, setAmount] = useState<number>(Math.min(order.balanceKes, 250000));
  const [method, setMethod] = useState("M-Pesa");
  const [message, setMessage] = useState<string | null>(null);

  const nextStage = STAGES[Math.min(order.stage + 1, STAGES.length - 1)];
  const complete = order.stage >= STAGES.length - 1;

  async function advance() {
    setBusy("advance");
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/advance`, { method: "POST" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setMessage(`Stage ${order.stage + 2} of ${STAGES.length} — ${nextStage.short}`);
      router.refresh();
    } catch {
      setMessage("Could not advance the shipment just now.");
    } finally {
      setBusy(null);
    }
  }

  async function pay() {
    setBusy("pay");
    setMessage(null);
    try {
      const res = await fetch(`/api/orders/${order.id}/payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountKes: amount, method }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Failed");
      setMessage(`Recorded ${formatKes(amount)} via ${method}.`);
      router.refresh();
    } catch {
      setMessage("Payment could not be recorded.");
    } finally {
      setBusy(null);
    }
  }

  const paidPct = order.totalKes > 0 ? Math.round((order.paidKes / order.totalKes) * 100) : 0;

  return (
    <div className="grid gap-4">
      {/* payment */}
      <div className="rounded-sm border border-ink/12 bg-white p-4">
        <div className="flex items-baseline justify-between">
          <p className="label-mono text-ink/50">Payment position</p>
          <p className="font-mono text-[12px] font-semibold text-ocean">{paidPct}% settled</p>
        </div>
        <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-ink/10">
          <div className="h-full rounded-full bg-leaf transition-all duration-700" style={{ width: `${paidPct}%` }} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 text-[13px]">
          <div>
            <p className="text-ink/50">Paid to date</p>
            <p className="font-mono font-semibold text-ink">{formatKesFull(order.paidKes)}</p>
          </div>
          <div>
            <p className="text-ink/50">Balance</p>
            <p className="font-mono font-semibold text-clay">{formatKesFull(order.balanceKes)}</p>
          </div>
        </div>

        {order.balanceKes > 0 && (
          <div className="mt-4 border-t border-dashed border-ink/15 pt-4">
            <p className="label-mono text-ink/50">Record a payment</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <input
                type="number"
                min={1000}
                step={1000}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-36 rounded-sm border border-ink/18 bg-white px-3 py-2 font-mono text-[13px] outline-none focus:border-ocean"
              />
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                className="rounded-sm border border-ink/18 bg-white px-3 py-2 text-[13px] font-semibold outline-none focus:border-ocean"
              >
                {["M-Pesa", "Bank transfer (KES)", "Bank transfer (USD)", "Cash at office"].map((m) => (
                  <option key={m}>{m}</option>
                ))}
              </select>
              <button
                type="button"
                onClick={pay}
                disabled={busy !== null || amount <= 0 || amount > order.balanceKes}
                className="rounded-sm bg-ink px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-paper transition-colors enabled:hover:bg-leaf disabled:opacity-35"
              >
                {busy === "pay" ? "Saving…" : "Record"}
              </button>
            </div>
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {[0.3, 0.5, 1].map((frac) => {
                const v = Math.round(order.balanceKes * frac);
                return (
                  <button
                    key={frac}
                    type="button"
                    onClick={() => setAmount(v)}
                    className="rounded-sm border border-ink/15 px-2.5 py-1 font-mono text-[11.5px] text-ink/60 hover:border-ocean hover:text-ocean"
                  >
                    {frac === 1 ? "Full balance" : `${Math.round(frac * 100)}%`} · {formatKes(v)}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {order.balanceKes === 0 && (
          <p className="mt-4 flex items-center gap-2 rounded-sm bg-leaf/10 px-3 py-2.5 text-[13px] font-semibold text-leaf">
            <IconCheck width={16} height={16} /> Fully settled — nothing outstanding on this order.
          </p>
        )}
      </div>

      {/* stage simulator */}
      <div className="rounded-sm border border-ink/12 bg-ink p-4 text-paper">
        <p className="label-mono text-signal">Operations console</p>
        <p className="mt-2 text-[13px] leading-relaxed text-paper/70">
          {complete
            ? "This consignment has been delivered and handed over."
            : `Next milestone: ${nextStage.label}.`}
        </p>
        <button
          type="button"
          onClick={advance}
          disabled={busy !== null || complete}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-signal px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-35"
        >
          {busy === "advance" ? "Updating…" : complete ? "Pipeline complete" : "Push to next stage"}
          {!complete && busy !== "advance" && <IconArrow width={15} height={15} />}
        </button>
        <p className="mt-2.5 flex gap-2 font-mono text-[11px] leading-relaxed text-paper/40">
          <IconRoute width={13} height={13} className="mt-0.5 shrink-0" />
          Demo control: writes the milestone, the timeline event and a desk post to the thread, exactly as the
          live ops feed would.
        </p>
      </div>

      {/* documents */}
      <div className="rounded-sm border border-ink/12 bg-white p-4">
        <p className="label-mono flex items-center gap-2 text-ink/50">
          <IconDoc width={14} height={14} /> Order file
        </p>
        <dl className="mt-3 grid gap-2.5 text-[13px]">
          {[
            ["Bill of lading", order.blNumber],
            ["Container / deck", order.containerNo],
            ["Customs entry", order.entryNumber],
            ["Vessel & voyage", [order.vessel, order.voyage].filter(Boolean).join(" · ")],
          ].map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/10 pb-2 last:border-0">
              <dt className="text-ink/50">{k}</dt>
              <dd className="font-mono text-[12.5px] text-ink">{v || "Pending"}</dd>
            </div>
          ))}
        </dl>
      </div>

      {message && (
        <p className="animate-rise rounded-sm border border-ocean/30 bg-ocean/8 px-3.5 py-2.5 text-[13px] font-semibold text-ocean-dark">
          {message}
        </p>
      )}
    </div>
  );
}
