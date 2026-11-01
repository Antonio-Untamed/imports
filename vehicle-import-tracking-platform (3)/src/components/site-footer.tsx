import Link from "next/link";
import { BRAND, NAV_LINKS, STAGES } from "@/lib/constants";
import { IconAnchor, IconMail, IconPhone, IconWhatsApp } from "./icons";

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="grid-lines border-b border-white/10">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6">
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
            <div>
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-sm bg-signal text-ink">
                  <IconAnchor width={24} height={24} />
                </span>
                <div>
                  <p className="font-display text-xl uppercase">Bandari Motors</p>
                  <p className="label-mono text-[10px] text-paper/50">Licensed import &amp; clearing desk</p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-paper/65">
                We buy at Japanese, British and Gulf auctions on your behalf, ship to Kilindini Harbour,
                clear with KRA and hand you the keys with a logbook in your name. Every stage is visible on
                your tracking page — no chasing WhatsApp groups for updates.
              </p>
              <p className="mt-5 text-xs text-paper/40">
                {BRAND.tagline}
              </p>
            </div>

            <div>
              <p className="label-mono text-signal">Navigate</p>
              <ul className="mt-4 grid gap-2.5 text-sm text-paper/70">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="transition-colors hover:text-signal">
                      {l.label}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/duty-calculator" className="transition-colors hover:text-signal">
                    KRA duty calculator
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="transition-colors hover:text-signal">
                    Admin console
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <p className="label-mono text-signal">The pipeline</p>
              <ol className="mt-4 grid gap-2 text-sm text-paper/70">
                {STAGES.map((s, i) => (
                  <li key={s.key} className="flex gap-2.5">
                    <span className="font-mono text-[11px] text-paper/35">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.short}
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="label-mono text-signal">Talk to the desk</p>
              <ul className="mt-4 grid gap-3 text-sm text-paper/75">
                <li className="flex items-start gap-3">
                  <IconPhone width={17} height={17} className="mt-0.5 shrink-0 text-paper/40" />
                  <a href={`tel:${BRAND.phone.replace(/\s/g, "")}`} className="hover:text-signal">
                    {BRAND.phone}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <IconWhatsApp width={17} height={17} className="mt-0.5 shrink-0 text-paper/40" />
                  <a
                    href={`https://wa.me/${BRAND.whatsapp}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-signal"
                  >
                    WhatsApp order desk
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <IconMail width={17} height={17} className="mt-0.5 shrink-0 text-paper/40" />
                  <a href={`mailto:${BRAND.email}`} className="hover:text-signal">
                    {BRAND.email}
                  </a>
                </li>
              </ul>
              <div className="mt-5 grid gap-1 text-sm text-paper/60">
                <p>{BRAND.office}</p>
                <p>{BRAND.port}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-6 text-xs text-paper/45 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>
          © {new Date().getFullYear()} Bandari Motors Ltd. Demo environment — duty figures are estimates and
          must be confirmed against the KRA iCMS valuation of the day.
        </p>
        <p className="font-mono">KEBS · QISJ · KRA iCMS · NTSA TIMS</p>
      </div>
    </footer>
  );
}
