import Link from "next/link";
import type { Metadata } from "next";
import { listOrders } from "@/lib/data";
import { DashboardClient } from "@/components/dashboard-client";
import { IconArrow, IconChat } from "@/components/icons";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My orders — Bandari Motors",
  description:
    "Every consignment you have ordered, with landed cost, payment position, pipeline progress and the discussion thread for each shipment.",
};

export default async function DashboardPage() {
  const orders = await listOrders();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-end justify-between gap-5 border-b border-ink/10 pb-6">
        <div>
          <p className="label-mono text-ocean">Client dashboard</p>
          <h1 className="mt-2 font-display text-[clamp(2rem,5vw,3.4rem)] uppercase leading-[0.95]">
            Your imports,
            <br />
            stage by stage
          </h1>
          <p className="mt-3 max-w-xl text-[14px] leading-relaxed text-ink/65">
            Payment position, documents, the vessel the car is on and the conversation around it — all in one
            place instead of five WhatsApp threads.
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link
            href="/track"
            className="flex items-center gap-2 rounded-sm border border-ink/20 px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-ink/75 hover:border-ocean hover:text-ocean"
          >
            Track by reference
          </Link>
          <Link
            href="/community"
            className="flex items-center gap-2 rounded-sm bg-ink px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-paper hover:bg-ocean"
          >
            <IconChat width={15} height={15} /> Community feed
          </Link>
          <Link
            href="/marketplace"
            className="flex items-center gap-2 rounded-sm bg-signal px-4 py-2.5 text-[12.5px] font-bold uppercase tracking-wider text-ink"
          >
            Order another <IconArrow width={15} height={15} />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <DashboardClient orders={orders} />
      </div>
    </div>
  );
}
