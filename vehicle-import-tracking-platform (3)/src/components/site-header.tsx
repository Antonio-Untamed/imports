"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { BRAND, NAV_LINKS, USD_TO_KES } from "@/lib/constants";
import { IconClose, IconMenu, IconShip } from "./icons";

const TICKER = [
  `USD/KES ${USD_TO_KES.toFixed(2)}`,
  "MV Hoegh Target · discharged Mombasa 06:40 EAT",
  "Free days remaining on 2 consignments",
  "QISJ inspection slots open — Yokohama, this week",
  "UK sourcing window: 42 days door to door",
  "Japan auction previews every Tue & Fri 09:00 EAT",
  "8-year rule: nothing older than first registration year − 8",
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-50">
      <div className="overflow-hidden border-b border-white/10 bg-ink-2 text-paper">
        <div className="flex w-max animate-marquee gap-10 py-1.5 pl-4 whitespace-nowrap">
          {[...TICKER, ...TICKER].map((t, i) => (
            <span key={i} className="label-mono flex items-center gap-2 text-[11px] text-paper/55">
              <span className="h-1.5 w-1.5 rounded-full bg-signal" />
              {t}
            </span>
          ))}
        </div>
      </div>

      <div className="border-b border-ink/10 bg-ink text-paper shadow-[0_10px_30px_-18px_rgba(0,0,0,0.8)]">
        <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-4 px-4 sm:px-6">
          <Link href="/" className="group flex items-center gap-3">
            <span className="relative grid h-10 w-10 place-items-center rounded-sm bg-signal text-ink transition-transform group-hover:-rotate-6">
              <IconShip width={22} height={22} strokeWidth={1.8} />
            </span>
            <span className="leading-none">
              <span className="block font-display text-[17px] uppercase tracking-tight">Bandari</span>
              <span className="label-mono block text-[9px] text-paper/50">Motors · Import Desk</span>
            </span>
          </Link>

          <nav className="ml-6 hidden items-center gap-1 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`relative rounded-sm px-3 py-2 text-[13px] font-semibold tracking-wide transition-colors ${
                    active ? "text-signal" : "text-paper/70 hover:text-paper"
                  }`}
                >
                  {l.label}
                  {active && (
                    <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-signal" />
                  )}
                </Link>
              );
            })}
          </nav>

          <div className="ml-auto hidden items-center gap-2 md:flex">
            <a
              href={`https://wa.me/${BRAND.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-sm border border-paper/25 px-3 py-2 text-[12px] font-semibold text-paper/85 transition-colors hover:border-signal hover:text-signal"
            >
              WhatsApp the desk
            </a>
            <Link
              href="/marketplace"
              className="rounded-sm bg-signal px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
            >
              Browse inventory
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="ml-auto grid h-10 w-10 place-items-center rounded-sm border border-paper/20 text-paper lg:hidden"
          >
            {open ? <IconClose /> : <IconMenu />}
          </button>
        </div>

        {open && (
          <div className="border-t border-paper/10 bg-ink-2 px-4 pb-5 pt-3 lg:hidden">
            <div className="grid gap-1">
              {NAV_LINKS.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-sm px-3 py-3 text-sm font-semibold text-paper/85 hover:bg-white/5 hover:text-signal"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/marketplace"
                className="mt-2 rounded-sm bg-signal px-3 py-3 text-center text-sm font-bold uppercase tracking-wider text-ink"
              >
                Browse inventory
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
