import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVehicleBySlug } from "@/lib/data";
import { calculateDuty, formatKes, formatKesFull, formatUsd } from "@/lib/duty";
import { CRSP_SOURCE, DELIVERY_MODES, STAGES } from "@/lib/constants";
import { etaPhrase } from "@/lib/format";
import { VehicleGallery } from "@/components/vehicle-gallery";
import { VehicleCard } from "@/components/vehicle-card";
import { ShareRow } from "@/components/engagement-board";
import {
  IconArrow,
  IconCalendar,
  IconCheck,
  IconFuel,
  IconGauge,
  IconGear,
  IconPin,
  IconRoute,
  IconShield,
  IconStar,
  IconUsers,
} from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const v = await getVehicleBySlug(slug);
  if (!v) return { title: "Vehicle not found — Bandari Motors" };
  return {
    title: `${v.year} ${v.make} ${v.model} ${v.trim} — ${formatKes(v.totalLandedKes)} landed in Kenya`,
    description: `${v.summary} ${v.grade}. Source: ${v.sourceNote}.`,
  };
}

export default async function VehiclePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const vehicle = await getVehicleBySlug(slug);
  if (!vehicle) notFound();

  const duty = calculateDuty({
    fobUsd: vehicle.fobUsd,
    freightUsd: vehicle.freightUsd,
    insuranceUsd: vehicle.insuranceUsd,
    engineCc: vehicle.engineCc,
    fuel: vehicle.fuel,
    crspKes: vehicle.crspKes,
    year: vehicle.year,
    deliveryFeeKes: DELIVERY_MODES[1].feeKes,
  });

  const deposit = Math.round(duty.totalLandedKes * 0.3);
  const eta = new Date(Date.now() + (vehicle.transitDays + 22) * 86_400_000);
  const orderable = vehicle.status === "available";

  const specs: Array<{ icon: React.ReactNode; label: string; value: string }> = [
    { icon: <IconCalendar width={16} height={16} />, label: "First registration", value: String(vehicle.year) },
    { icon: <IconGauge width={16} height={16} />, label: "Odometer", value: `${vehicle.mileageKm.toLocaleString()} km` },
    { icon: <IconFuel width={16} height={16} />, label: "Engine & fuel", value: `${vehicle.engineCc}cc · ${vehicle.fuel}` },
    { icon: <IconGear width={16} height={16} />, label: "Transmission", value: vehicle.transmission },
    { icon: <IconRoute width={16} height={16} />, label: "Drivetrain", value: vehicle.drivetrain },
    { icon: <IconUsers width={16} height={16} />, label: "Seats · doors", value: `${vehicle.seats} seats` },
    { icon: <IconStar width={16} height={16} />, label: "Auction grade", value: vehicle.grade },
    { icon: <IconPin width={16} height={16} />, label: "Source", value: vehicle.sourceNote },
  ];

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      <nav className="label-mono flex flex-wrap items-center gap-2 text-ink/45">
        <Link href="/" className="hover:text-ocean">Home</Link>
        <span>/</span>
        <Link href="/marketplace" className="hover:text-ocean">Inventory</Link>
        <span>/</span>
        <span className="text-ink/70">
          {vehicle.make} {vehicle.model}
        </span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-start">
        <div>
          <VehicleGallery
            images={vehicle.gallery}
            alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
          />

          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="label-mono flex items-center gap-2 text-ocean">
                <span className="rounded-sm bg-ink px-2 py-0.5 text-paper">{vehicle.stockRef}</span>
                {vehicle.origin} import · {vehicle.transitDays} days at sea
              </p>
              <h1 className="mt-2 font-display text-[clamp(1.9rem,4.4vw,3rem)] uppercase leading-[0.95]">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </h1>
              <p className="mt-1.5 text-[15px] text-ink/65">
                {vehicle.trim} · {vehicle.color} · {vehicle.bodyType}
              </p>
            </div>
            <ShareRow
              url={`https://bandarimotors.co.ke/vehicles/${vehicle.slug}`}
              text={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim} — ${formatKes(vehicle.totalLandedKes)} landed in Kenya`}
            />
          </div>

          <p className="mt-5 max-w-3xl text-[15px] leading-relaxed text-ink/75">{vehicle.summary}</p>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {specs.map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-3 rounded-sm border border-ink/10 bg-white px-4 py-3"
              >
                <span className="grid h-8 w-8 shrink-0 place-items-center rounded-sm bg-paper-2 text-ocean">
                  {s.icon}
                </span>
                <span className="min-w-0">
                  <span className="label-mono block text-[10px] text-ink/45">{s.label}</span>
                  <span className="block truncate text-[13.5px] font-semibold capitalize text-ink">{s.value}</span>
                </span>
              </div>
            ))}
          </div>

          <section className="mt-8 rounded-sm border border-ink/12 bg-white p-5">
            <h2 className="font-display text-xl uppercase">Equipment on this unit</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {vehicle.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-[13.5px] text-ink/75">
                  <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-leaf" />
                  {f}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-sm border border-ink/12 bg-paper-2/60 p-5">
              <p className="label-mono text-ocean">Import compliance</p>
              <ul className="mt-3 grid gap-2.5 text-[13px] leading-relaxed text-ink/70">
                <li className="flex gap-2.5">
                  <IconShield width={16} height={16} className="mt-0.5 shrink-0 text-ocean" />
                  Within the KEBS 8-year age limit — first registration {vehicle.year}.
                </li>
                <li className="flex gap-2.5">
                  <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-ocean" />
                  QISJ/JEVIC roadworthiness inspection booked before loading.
                </li>
                <li className="flex gap-2.5">
                  <IconCheck width={16} height={16} className="mt-0.5 shrink-0 text-ocean" />
                  Right-hand drive, matching Kenyan road rules.
                </li>
              </ul>
            </div>
            <div className="rounded-sm border border-ink/12 bg-ink p-5 text-paper">
              <p className="label-mono text-signal">Shipping window</p>
              <p className="mt-3 text-[13.5px] leading-relaxed text-paper/75">
                Order today and the unit sails on the next {vehicle.origin} departure. Typical timeline:{" "}
                {STAGES[1].window} to auction, {STAGES[4].window} at sea, cleared and plated by{" "}
                {STAGES[9].window}.
              </p>
              <p className="mt-4 font-mono text-[13px] text-signal">{etaPhrase(eta)}</p>
            </div>
          </section>
        </div>

        {/* sticky purchase panel */}
        <aside className="lg:sticky lg:top-28">
          <div className="overflow-hidden rounded-sm border border-ink/15 bg-white">
            <div className="border-b border-ink/10 bg-ink px-5 py-4 text-paper">
              <p className="label-mono text-signal">Landed in Kenya, all-in</p>
              <p className="mt-1 font-display text-3xl leading-none">{formatKes(duty.totalLandedKes)}</p>
              <p className="mt-2 font-mono text-[12px] text-paper/60">
                FOB {formatUsd(vehicle.fobUsd)} · CIF {formatKesFull(duty.cifKes)}
              </p>
            </div>

            <div className="px-5 py-4">
              <table className="w-full text-[13px]">
                <tbody>
                  {duty.breakdown.slice(0, 8).map((line) => (
                    <tr key={line.label} className="border-b border-dashed border-ink/10 last:border-0">
                      <td className="py-2 text-ink/65">{line.label}</td>
                      <td className="py-2 text-right font-mono text-ink">
                        {line.amountKes.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-2 text-ink/65">Inland delivery (Nairobi)</td>
                    <td className="py-2 text-right font-mono text-ink">
                      {DELIVERY_MODES[1].feeKes.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="mt-4 rounded-sm border border-ink/12 bg-paper-2/50 p-3.5">
                <p className="label-mono flex items-center gap-1.5 text-ocean">
                  <IconShield width={13} height={13} /> KRA CRSP valuation check
                </p>
                <dl className="mt-2 grid gap-1.5 text-[12.5px]">
                  {duty.valuation.map((v) => (
                    <div key={v.label} className="flex items-baseline justify-between gap-2">
                      <dt className="text-ink/55">{v.label}</dt>
                      <dd className={`font-mono font-semibold ${v.amountKes < 0 ? "text-clay" : "text-ink"}`}>
                        {v.amountKes < 0 ? "−" : ""}
                        {Math.abs(v.amountKes).toLocaleString()}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="mt-2 border-t border-dashed border-ink/15 pt-2 text-[11.5px] leading-relaxed text-ink/55">
                  {duty.basis === "CRSP"
                    ? `KRA will assess duty on the depreciated CRSP, ${formatKes(duty.valuationUpliftKes)} above the invoice. That uplift is already built into the price above — no surprise in Mombasa.`
                    : "The declared CIF is higher than the depreciated CRSP, so your invoice value governs. No valuation uplift applies."}
                </p>
              </div>

              <div className="mt-4 rounded-sm bg-paper-2/70 p-3.5">
                <div className="flex items-baseline justify-between">
                  <span className="label-mono text-ink/55">30% deposit to start</span>
                  <span className="font-display text-xl text-ink">{formatKes(deposit)}</span>
                </div>
                <p className="mt-1.5 text-[12px] leading-relaxed text-ink/55">
                  Balance due when KRA releases the car in Mombasa. Milestone plans and a 1.5% full-payment
                  discount are available at checkout.
                </p>
              </div>

              {orderable ? (
                <Link
                  href={`/checkout/${vehicle.id}`}
                  className="group mt-4 flex w-full items-center justify-center gap-2 rounded-sm bg-signal px-5 py-3.5 text-[13px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
                >
                  Order this vehicle
                  <IconArrow width={16} height={16} className="transition-transform group-hover:translate-x-1" />
                </Link>
              ) : (
                <div className="mt-4 rounded-sm border border-clay/30 bg-clay/8 p-4 text-center">
                  <p className="text-[13.5px] font-bold uppercase tracking-wide text-clay">
                    {vehicle.status === "reserved" ? "Reserved by another client" : "Already delivered"}
                  </p>
                  <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/60">
                    We can source the same spec at the next auction. Ask the desk for a matching bid.
                  </p>
                  <Link
                    href="/marketplace"
                    className="mt-3 inline-block rounded-sm bg-ink px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider text-paper hover:bg-ocean"
                  >
                    See similar units
                  </Link>
                </div>
              )}

              <Link
                href="/track"
                className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-sm border border-ink/20 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink/75 hover:border-ocean hover:text-ocean"
              >
                Track a shipment instead
              </Link>

              <p className="mt-4 border-t border-dashed border-ink/15 pt-3 font-mono text-[11px] leading-relaxed text-ink/45">
                Duty assessed on the higher of your CIF and the depreciated KRA CRSP ({CRSP_SOURCE}). Estimates use USD/KES 129.50 and current bands. Final duty follows the iCMS valuation on
                the day of entry.
              </p>
            </div>
          </div>
        </aside>
      </div>

      {vehicle.related.length > 0 && (
        <section className="mt-16 border-t border-ink/10 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <h2 className="font-display text-3xl uppercase">
              Similar {vehicle.bodyType.toLowerCase()}s in stock
            </h2>
            <Link
              href="/marketplace"
              className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-ink/65 hover:text-ocean"
            >
              Full inventory <IconArrow width={15} height={15} />
            </Link>
          </div>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {vehicle.related.map((r) => (
              <VehicleCard key={r.id} vehicle={r} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
