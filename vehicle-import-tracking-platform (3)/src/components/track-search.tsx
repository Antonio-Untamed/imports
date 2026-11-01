"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { IconAlert, IconArrow, IconClock, IconSearch } from "./icons";

export function TrackSearch({ suggestions }: { suggestions: string[] }) {
  const router = useRouter();
  const [q, setQ] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const sp = new URLSearchParams(window.location.search);
    const preset = sp.get("q");
    if (preset) setQ(preset);
    try {
      const raw = localStorage.getItem("bandari.orders");
      if (raw) {
        const list = JSON.parse(raw) as Array<{ ref: string }>;
        setRecent(list.map((l) => l.ref).slice(0, 5));
      }
    } catch {
      /* ignore */
    }
  }, []);

  async function lookup(value?: string) {
    const term = (value ?? q).trim();
    if (!term) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/track?ref=${encodeURIComponent(term)}`);
      const json = await res.json();
      if (!res.ok || !json.found) {
        setError(json.error ?? `No shipment matches “${term}”`);
        return;
      }
      router.push(`/order/${json.order.ref}`);
    } catch {
      setError("Could not reach the tracking service. Check the reference and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="rounded-sm border border-white/12 bg-ink-2/80 p-5 backdrop-blur-md sm:p-6">
      <label className="label-mono block text-signal" htmlFor="track-input">
        Tracking reference or 6-digit passcode
      </label>
      <div className="mt-2.5 flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <IconSearch width={18} height={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-paper/35" />
          <input
            id="track-input"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && lookup()}
            placeholder="BM-2604-HLX"
            autoComplete="off"
            className="w-full rounded-sm border border-white/20 bg-ink px-11 py-3.5 font-mono text-[14px] uppercase tracking-wide text-paper placeholder:text-paper/25 outline-none focus:border-signal"
          />
        </div>
        <button
          type="button"
          onClick={() => lookup()}
          disabled={busy || q.trim().length < 3}
          className="flex items-center justify-center gap-2 rounded-sm bg-signal px-6 py-3.5 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-35"
        >
          {busy ? "Searching…" : "Track shipment"}
          {!busy && <IconArrow width={16} height={16} />}
        </button>
      </div>

      {error && (
        <p className="animate-rise mt-3 flex items-center gap-2 rounded-sm border border-clay/40 bg-clay/15 px-3.5 py-2.5 text-[13px] font-semibold text-paper">
          <IconAlert width={16} height={16} className="shrink-0 text-clay" />
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-white/10 pt-4">
        <span className="label-mono flex items-center gap-1.5 text-paper/40">
          {recent.length ? <IconClock width={13} height={13} /> : null}
          {recent.length ? "Your orders" : "Try a demo reference"}
        </span>
        {(recent.length ? recent : suggestions).slice(0, 5).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => {
              setQ(s);
              lookup(s);
            }}
            className="rounded-sm border border-white/20 px-2.5 py-1.5 font-mono text-[11.5px] text-paper/75 transition-colors hover:border-signal hover:text-signal"
          >
            {s}
          </button>
        ))}
      </div>
    </div>
  );
}
