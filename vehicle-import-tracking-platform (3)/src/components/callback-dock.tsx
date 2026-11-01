"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { BRAND, waLink } from "@/lib/constants";
import { IconClose, IconPhone, IconWhatsApp } from "./icons";

/**
 * Floating callback dock. Every action deep-links straight into the office
 * WhatsApp chat (+254 799 007 101) with the page the client was on pre-filled.
 */
export function CallbackDock() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(false);
    setOpen(false);
  }, [pathname]);

  if (hidden || pathname === "/admin") return null;

  const context = pathname === "/" ? "the homepage" : pathname.replace(/^\//, "").replace(/\//g, " ");
  const message = `Hello Bandari Motors — please call me back.\n\nI was looking at ${context} (bandarimotors.co.ke${pathname}).`;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2 sm:bottom-6 sm:right-6">
      {open && (
        <div className="animate-rise w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-sm border border-ink/15 bg-white shadow-[0_28px_60px_-24px_rgba(10,15,13,0.6)]">
          <div className="flex items-start justify-between gap-3 bg-ink px-4 py-3 text-paper">
            <div>
              <p className="label-mono text-signal">Request a callback</p>
              <p className="mt-1 font-display text-base uppercase leading-tight">Talk to the import desk</p>
            </div>
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="text-paper/60 hover:text-paper"
            >
              <IconClose width={16} height={16} />
            </button>
          </div>
          <div className="grid gap-2 p-4">
            <a
              href={waLink(message)}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-sm bg-leaf px-4 py-3 text-white transition-transform hover:-translate-y-0.5"
            >
              <IconWhatsApp width={19} height={19} />
              <span>
                <span className="block text-[13px] font-bold uppercase tracking-wide">WhatsApp us now</span>
                <span className="block font-mono text-[11px] text-white/80">
                  Opens a chat to {BRAND.phone} with this page pre-filled
                </span>
              </span>
            </a>
            <a
              href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
              className="flex items-center gap-3 rounded-sm border border-ink/20 px-4 py-3 text-ink transition-colors hover:border-ocean hover:text-ocean"
            >
              <IconPhone width={18} height={18} />
              <span>
                <span className="block text-[13px] font-bold uppercase tracking-wide">Call the desk</span>
                <span className="block font-mono text-[11px] text-ink/50">{BRAND.phone}</span>
              </span>
            </a>
            <p className="font-mono text-[10.5px] leading-relaxed text-ink/40">
              Mon–Sat 08:00–18:00 EAT · replies within the hour on business days
            </p>
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2.5 rounded-full bg-leaf px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-wider text-white shadow-[0_18px_36px_-16px_rgba(47,125,79,0.9)] transition-transform hover:-translate-y-0.5"
      >
        <IconWhatsApp width={18} height={18} />
        {open ? "Close" : "Request a callback"}
      </button>
    </div>
  );
}
