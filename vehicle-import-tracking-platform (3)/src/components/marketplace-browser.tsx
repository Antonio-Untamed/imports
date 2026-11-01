"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import type { VehicleDTO } from "@/lib/data";
import { BODY_TYPES, MAKES } from "@/lib/constants";
import { formatKes } from "@/lib/duty";
import { VehicleCard } from "./vehicle-card";
import { IconClose, IconSearch } from "./icons";

const SORTS = [
  { id: "popular", label: "Most wanted" },
  { id: "price-asc", label: "Landed price ↑" },
  { id: "price-desc", label: "Landed price ↓" },
  { id: "year-desc", label: "Newest year" },
  { id: "mileage-asc", label: "Lowest mileage" },
];

export function MarketplaceBrowser({ all }: { all: VehicleDTO[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [maxLanded, setMaxLanded] = useState<number>(() => Number(params.get("maxLanded") ?? 0));

  const get = useCallback((k: string) => params.get(k) ?? "all", [params]);

  const update = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (!value || value === "all") next.delete(key);
    else next.set(key, value);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const filtered = useMemo(() => {
    const q = (params.get("q") ?? "").toLowerCase().trim();
    const make = params.get("make") ?? "all";
    const body = params.get("body") ?? "all";
    const fuel = params.get("fuel") ?? "all";
    const origin = params.get("origin") ?? "all";
    const sort = params.get("sort") ?? "popular";
    const cap = maxLanded || Number(params.get("maxLanded") ?? 0);

    let out = all.filter((v) => {
      if (make !== "all" && v.make !== make) return false;
      if (body !== "all" && v.bodyType !== body) return false;
      if (fuel !== "all" && v.fuel !== fuel) return false;
      if (origin !== "all" && v.origin !== origin) return false;
      if (cap && v.totalLandedKes > cap) return false;
      if (q) {
        const hay = `${v.make} ${v.model} ${v.trim} ${v.bodyType} ${v.stockRef} ${v.year} ${v.color}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    out = [...out].sort((a, b) => {
      switch (sort) {
        case "price-asc":
          return a.totalLandedKes - b.totalLandedKes;
        case "price-desc":
          return b.totalLandedKes - a.totalLandedKes;
        case "year-desc":
          return b.year - a.year || b.popularity - a.popularity;
        case "mileage-asc":
          return a.mileageKm - b.mileageKm;
        default:
          return b.popularity - a.popularity;
      }
    });
    return out;
  }, [all, params, maxLanded]);

  const activeChips = [
    params.get("q") ? { k: "q", label: `“${params.get("q")}”` } : null,
    params.get("make") ? { k: "make", label: params.get("make")! } : null,
    params.get("body") ? { k: "body", label: params.get("body")! } : null,
    params.get("fuel") ? { k: "fuel", label: params.get("fuel")! } : null,
    params.get("origin") ? { k: "origin", label: params.get("origin")! } : null,
    maxLanded ? { k: "maxLanded", label: `under ${formatKes(maxLanded)}` } : null,
  ].filter(Boolean) as Array<{ k: string; label: string }>;

  const ceiling = 12_000_000;

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,268px)_1fr]">
      {/* filters */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="rounded-sm border border-ink/12 bg-white p-4">
          <label className="relative flex items-center">
            <IconSearch width={16} height={16} className="absolute left-3 text-ink/35" />
            <input
              defaultValue={params.get("q") ?? ""}
              key={params.get("q") ?? "q"}
              onBlur={(e) => update("q", e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") update("q", (e.target as HTMLInputElement).value);
              }}
              placeholder="Search RAV4, Hilux, BM-JP-4412…"
              className="w-full rounded-sm border border-ink/15 bg-paper-2/40 py-2.5 pl-9 pr-3 text-[13px] outline-none focus:border-ocean focus:bg-white"
            />
          </label>

          <FilterGroup label="Make" value={get("make")} onChange={(v) => update("make", v)}>
            {MAKES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </FilterGroup>

          <FilterGroup label="Body" value={get("body")} onChange={(v) => update("body", v)}>
            {BODY_TYPES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </FilterGroup>

          <FilterGroup label="Fuel" value={get("fuel")} onChange={(v) => update("fuel", v)}>
            {["petrol", "diesel", "hybrid"].map((f) => (
              <option key={f} value={f} className="capitalize">
                {f}
              </option>
            ))}
          </FilterGroup>

          <FilterGroup label="Ships from" value={get("origin")} onChange={(v) => update("origin", v)}>
            {["Japan", "UK", "UAE"].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </FilterGroup>

          <div className="mt-4 border-t border-dashed border-ink/15 pt-4">
            <div className="flex items-baseline justify-between">
              <span className="label-mono text-ink/50">Max landed cost</span>
              <span className="font-mono text-[12px] font-semibold text-ink">
                {maxLanded ? formatKes(maxLanded) : "Any"}
              </span>
            </div>
            <input
              type="range"
              min={3_000_000}
              max={ceiling}
              step={250_000}
              value={maxLanded || ceiling}
              onChange={(e) => setMaxLanded(Number(e.target.value))}
              className="mt-2.5 w-full accent-ocean"
            />
            {maxLanded > 0 && (
              <button
                type="button"
                onClick={() => setMaxLanded(0)}
                className="mt-1 text-[11.5px] font-semibold text-clay hover:underline"
              >
                Clear price ceiling
              </button>
            )}
          </div>

          <div className="mt-4 border-t border-dashed border-ink/15 pt-4">
            <span className="label-mono text-ink/50">Sort by</span>
            <div className="mt-2 grid gap-1">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => update("sort", s.id)}
                  className={`rounded-sm px-2.5 py-1.5 text-left text-[12.5px] font-semibold transition-colors ${
                    (params.get("sort") ?? "popular") === s.id
                      ? "bg-ink text-paper"
                      : "text-ink/65 hover:bg-paper-2"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-4 rounded-sm border border-ink/12 bg-ink p-4 text-paper">
          <p className="label-mono text-signal">Sourcing desk</p>
          <p className="mt-2 text-[13px] leading-relaxed text-paper/70">
            Nothing here fits? Give us a budget and a spec — we bid at USS Tokyo on Tuesdays and Fridays.
          </p>
          <a
            href="/how-it-works#request"
            className="mt-3 inline-block rounded-sm bg-signal px-3.5 py-2 text-[11.5px] font-bold uppercase tracking-wider text-ink"
          >
            Request a bid
          </a>
        </div>
      </aside>

      {/* results */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-[13.5px] text-ink/65">
            <span className="font-display text-xl text-ink">{filtered.length}</span>{" "}
            {filtered.length === 1 ? "unit" : "units"} · landed price includes duty, VAT and clearing
          </p>
          {activeChips.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              {activeChips.map((c) => (
                <button
                  key={c.k}
                  type="button"
                  onClick={() => {
                    if (c.k === "maxLanded") setMaxLanded(0);
                    else update(c.k, "all");
                  }}
                  className="flex items-center gap-1.5 rounded-sm border border-ink/20 bg-white px-2.5 py-1 text-[11.5px] font-semibold text-ink/70 hover:border-clay hover:text-clay"
                >
                  {c.label}
                  <IconClose width={12} height={12} />
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMaxLanded(0);
                  router.replace(pathname, { scroll: false });
                }}
                className="rounded-sm px-2.5 py-1 text-[11.5px] font-bold uppercase tracking-wider text-clay hover:underline"
              >
                Reset all
              </button>
            </div>
          )}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-sm border border-dashed border-ink/25 bg-white/60 p-12 text-center">
            <p className="font-display text-2xl uppercase text-ink/70">No units match that filter</p>
            <p className="mx-auto mt-3 max-w-md text-[13.5px] leading-relaxed text-ink/55">
              Loosen the price ceiling or clear a filter — or ask the sourcing desk to find it at the next
              Japanese auction.
            </p>
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filtered.map((v, i) => (
              <VehicleCard key={v.id} vehicle={v} priority={i < 2} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterGroup({
  label,
  value,
  onChange,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  children: React.ReactNode;
}) {
  return (
    <label className="mt-4 block">
      <span className="label-mono text-ink/50">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1.5 w-full rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-[13px] font-semibold outline-none focus:border-ocean"
      >
        <option value="all">All</option>
        {children}
      </select>
    </label>
  );
}
