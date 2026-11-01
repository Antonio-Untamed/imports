import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getOrderByRef } from "@/lib/data";
import { STAGES } from "@/lib/constants";
import { formatKes, formatKesFull } from "@/lib/duty";
import { etaPhrase, fmtDate, fmtDateTime } from "@/lib/format";
import { RouteMap } from "@/components/route-map";
import { StageTimeline } from "@/components/stage-timeline";
import { OrderConsole } from "@/components/order-console";
import { EngagementBoard, ShareRow } from "@/components/engagement-board";
import { IconArrow, IconCheck, IconClock, IconPin, IconShip, IconTruck } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ ref: string }>;
}): Promise<Metadata> {
  const { ref } = await params;
  const order = await getOrderByRef(ref);
  if (!order) return { title: "Shipment not found — Bandari Motors" };
  return {
    title: `${order.ref} — ${order.stageShort} · Bandari Motors tracking`,
    description: `Live tracking for ${order.ref}: ${order.vehicle.year} ${order.vehicle.make} ${order.vehicle.model} from ${order.portOfLoading} to ${order.destinationCity}.`,
  };
}

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ ref: string }>;
  searchParams: Promise<{ confirmed?: string }>;
}) {
  const [{ ref }, sp] = await Promise.all([params, searchParams]);
  const order = await getOrderByRef(ref);
  if (!order) notFound();

  const confirmed = sp.confirmed === "1";
  const shareUrl = `https://bandarimotors.co.ke/order/${order.ref}`;

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-8 sm:px-6">
      {confirmed && (
        <div className="animate-rise mb-6 flex flex-wrap items-center gap-4 rounded-sm border-l-4 border-leaf bg-leaf/8 px-5 py-4">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-leaf text-white">
            <IconCheck width={18} height={18} strokeWidth={2.6} />
          </span>
          <div className="min-w-0">
            <p className="font-display text-lg uppercase text-ink">Order confirmed</p>
            <p className="text-[13px] text-ink/70">
              Reference <span className="font-mono font-bold">{order.ref}</span> · passcode{" "}
              <span className="font-mono font-bold">{order.passcode}</span>. Save these — either one opens
              this tracking page. The sourcing desk has been notified and will post the auction result here.
            </p>
          </div>
          <Link
            href="/marketplace"
            className="ml-auto rounded-sm border border-ink/20 px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-ink/70 hover:border-ocean hover:text-ocean"
          >
            Keep browsing
          </Link>
        </div>
      )}

      {/* header */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="label-mono flex flex-wrap items-center gap-2 text-ocean">
            <span className="rounded-sm bg-ink px-2 py-0.5 text-paper">{order.ref}</span>
            Passcode {order.passcode}
            <span className="text-ink/30">·</span>
            Ordered {fmtDate(order.orderDate)}
          </p>
          <h1 className="mt-2.5 font-display text-[clamp(1.8rem,4.4vw,3rem)] uppercase leading-[0.95]">
            {order.vehicle.year} {order.vehicle.make} {order.vehicle.model}
          </h1>
          <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13.5px] text-ink/60">
            <span className="flex items-center gap-1.5">
              <IconShip width={15} height={15} className="text-ink/35" />
              {order.portOfLoading}
            </span>
            <IconArrow width={14} height={14} className="text-ink/25" />
            <span className="flex items-center gap-1.5">
              <IconPin width={15} height={15} className="text-ink/35" />
              {order.destinationCity}
            </span>
            <span className="text-ink/30">·</span>
            <span>Consignee {order.clientName}</span>
          </p>
        </div>

        <div className="flex flex-col items-start gap-3 sm:items-end">
          <span
            className={`label-mono rounded-sm px-3 py-1.5 ${
              order.stage >= STAGES.length - 1
                ? "bg-leaf text-white"
                : order.stage >= 5
                  ? "bg-ocean text-white"
                  : "bg-signal text-ink"
            }`}
          >
            Stage {order.stage + 1}/{STAGES.length} · {order.stageShort}
          </span>
          <p className="font-mono text-[12.5px] text-ink/55">{etaPhrase(order.eta)}</p>
          <ShareRow url={shareUrl} text={`Tracking my ${order.vehicle.make} ${order.vehicle.model} import — ${order.ref}`} />
        </div>
      </div>

      {/* progress + route */}
      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-start">
        <div>
          <RouteMap
            origin={order.portOfLoading}
            destination={order.destinationCity}
            progressPct={order.progressPct}
            vessel={order.vessel}
            eta={order.eta}
          />

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            {[
              { icon: IconClock, k: "Days elapsed", v: String(Math.max(0, Math.round((Date.now() - new Date(order.orderDate).getTime()) / 86_400_000))), s: "since order" },
              {
                icon: IconShip,
                k: "At sea / arrived",
                v: order.departedAt ? (order.arrivedAt ? fmtDate(order.arrivedAt) : "underway") : "not departed",
                s: order.vessel || "vessel TBC",
              },
              {
                icon: IconTruck,
                k: "Delivery",
                v: order.deliveryMode === "mombasa_port" ? "Port collection" : order.deliveryMode === "doorstep" ? "To your gate" : "Inland to town",
                s: order.destinationCity,
              },
            ].map((c) => (
              <div key={c.k} className="rounded-sm border border-ink/12 bg-white p-4">
                <p className="label-mono flex items-center gap-1.5 text-ink/45">
                  <c.icon width={13} height={13} /> {c.k}
                </p>
                <p className="mt-1.5 font-display text-lg uppercase leading-tight text-ink">{c.v}</p>
                <p className="mt-0.5 font-mono text-[11px] text-ink/45">{c.s}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          <div className="overflow-hidden rounded-sm border border-ink/12 bg-white">
            <Link href={`/vehicles/${order.vehicle.slug}`} className="group relative block aspect-[16/9] bg-ink">
              <Image
                src={order.vehicle.heroImage}
                alt={order.vehicle.model}
                fill
                sizes="400px"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
              <div className="absolute inset-x-4 bottom-3 flex items-end justify-between gap-2">
                <div>
                  <p className="font-mono text-[11px] text-signal">{order.vehicle.stockRef}</p>
                  <p className="font-display text-base uppercase leading-tight text-paper">
                    {order.vehicle.make} {order.vehicle.model} {order.vehicle.trim}
                  </p>
                </div>
                <span className="rounded-sm bg-paper/90 px-2 py-1 text-[10.5px] font-bold uppercase tracking-wider text-ink">
                  View file
                </span>
              </div>
            </Link>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 p-4 text-[12.5px]">
              {[
                ["Odometer", `${order.vehicle.mileageKm.toLocaleString()} km`],
                ["Engine", `${order.vehicle.engineCc}cc ${order.vehicle.fuel}`],
                ["Grade", order.vehicle.grade],
                ["Gearbox", order.vehicle.transmission],
              ].map(([k, v]) => (
                <div key={k}>
                  <dt className="text-ink/45">{k}</dt>
                  <dd className="font-mono font-semibold text-ink capitalize">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <OrderConsole order={order} />
        </div>
      </div>

      {/* timeline */}
      <section className="mt-10 grid gap-6 lg:grid-cols-[1fr_minmax(0,400px)] lg:items-start">
        <div className="rounded-sm border border-ink/12 bg-white p-5 sm:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="label-mono text-ocean">Shipment timeline</p>
              <h2 className="mt-1.5 font-display text-2xl uppercase">Every stage, documented</h2>
            </div>
            <p className="font-mono text-[12px] text-ink/45">
              {order.events.length} entries · last {fmtDateTime(order.events[order.events.length - 1]?.occurredAt)}
            </p>
          </div>
          <div className="mt-6">
            <StageTimeline stage={order.stage} events={order.events} />
          </div>
        </div>

        <div className="grid gap-4">
          <div className="rounded-sm border border-ink/12 bg-white p-5">
            <p className="label-mono text-ink/50">Cost sheet</p>
            <dl className="mt-3 grid gap-2 text-[13px]">
              {[
                ["Agreed landed cost", formatKesFull(order.totalKes)],
                ["Paid to date", formatKesFull(order.paidKes)],
                ["Outstanding balance", formatKesFull(order.balanceKes)],
                ["Deposit held", formatKes(order.depositKes)],
                ["Payment plan", order.paymentPlan],
              ].map(([k, v]) => (
                <div key={k} className="flex items-baseline justify-between gap-3 border-b border-dashed border-ink/10 pb-2 last:border-0">
                  <dt className="text-ink/55">{k}</dt>
                  <dd className="font-mono font-semibold capitalize text-ink">{v}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-sm border border-ink/12 bg-paper-2/60 p-5">
            <p className="label-mono text-ocean">What happens next</p>
            <p className="mt-2.5 text-[13.5px] leading-relaxed text-ink/70">
              {order.stage >= STAGES.length - 1
                ? "Handover complete. Your logbook is with NTSA and the warranty runs for 3 months on the powertrain."
                : `${STAGES[Math.min(order.stage + 1, STAGES.length - 1)].label} — ${
                    STAGES[Math.min(order.stage + 1, STAGES.length - 1)].detail
                  }`}
            </p>
            <p className="mt-3 font-mono text-[11.5px] text-ink/45">
              Typical window {STAGES[Math.min(order.stage + 1, STAGES.length - 1)].window}
            </p>
          </div>
        </div>
      </section>

      {/* engagement thread */}
      <section className="mt-12 border-t border-ink/10 pt-10">
        <EngagementBoard
          initial={order.engagements}
          orderId={order.id}
          orderRef={order.ref}
          shareUrl={shareUrl}
          title="This shipment's thread"
          subtitle="The desk, the clearing agent and everyone you share the link with. Ask questions, post photos at discharge, react to milestones — nothing gets lost in a WhatsApp group."
        />
      </section>
    </div>
  );
}
