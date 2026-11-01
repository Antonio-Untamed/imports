import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getVehicleById } from "@/lib/data";
import { formatKes } from "@/lib/duty";
import { CheckoutForm } from "@/components/checkout-form";
import { IconArrow } from "@/components/icons";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ vehicleId: string }>;
}): Promise<Metadata> {
  const { vehicleId } = await params;
  const v = await getVehicleById(Number(vehicleId));
  if (!v) return { title: "Order — Bandari Motors" };
  return {
    title: `Order the ${v.year} ${v.make} ${v.model} ${v.trim} — Bandari Motors`,
    description: `Confirm your import order. ${formatKes(v.totalLandedKes)} landed in Kenya including KRA duty.`,
  };
}

export default async function CheckoutPage({ params }: { params: Promise<{ vehicleId: string }> }) {
  const { vehicleId } = await params;
  const vehicle = await getVehicleById(Number(vehicleId));
  if (!vehicle) notFound();

  return (
    <div className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6">
      <nav className="label-mono flex flex-wrap items-center gap-2 text-ink/45">
        <Link href="/marketplace" className="hover:text-ocean">Inventory</Link>
        <span>/</span>
        <Link href={`/vehicles/${vehicle.slug}`} className="hover:text-ocean">
          {vehicle.make} {vehicle.model}
        </Link>
        <span>/</span>
        <span className="text-ink/70">Order</span>
      </nav>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="label-mono text-ocean">Import order · step by step</p>
          <h1 className="mt-2 font-display text-[clamp(1.9rem,4.6vw,3.2rem)] uppercase leading-[0.95]">
            Put your name on it
          </h1>
        </div>
        <Link
          href={`/vehicles/${vehicle.slug}`}
          className="flex items-center gap-2 text-[12.5px] font-bold uppercase tracking-wider text-ink/60 hover:text-ocean"
        >
          <IconArrow width={15} height={15} className="rotate-180" /> Back to the listing
        </Link>
      </div>

      <div className="mt-8">
        <CheckoutForm vehicle={vehicle} />
      </div>
    </div>
  );
}
