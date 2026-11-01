import Image from "next/image";
import Link from "next/link";
import type { VehicleDTO } from "@/lib/data";
import { formatKes, formatUsd } from "@/lib/duty";
import { IconFuel, IconGauge, IconGear, IconPin, IconArrow } from "./icons";

const STATUS_STYLES: Record<string, string> = {
  available: "bg-leaf text-white",
  reserved: "bg-signal text-ink",
  in_transit: "bg-ocean text-white",
  sold: "bg-clay text-white",
};

const STATUS_LABEL: Record<string, string> = {
  available: "Available to order",
  reserved: "Reserved — on the water",
  in_transit: "In transit",
  sold: "Delivered",
};

export function VehicleCard({ vehicle, priority = false }: { vehicle: VehicleDTO; priority?: boolean }) {
  const sold = vehicle.status === "sold";
  return (
    <Link
      href={`/vehicles/${vehicle.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-sm border border-ink/12 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-ink/30 hover:shadow-[0_28px_50px_-30px_rgba(10,15,13,0.55)]"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-ink-3">
        <Image
          src={vehicle.heroImage}
          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model} ${vehicle.trim}`}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1100px) 50vw, 33vw"
          className={`object-cover transition-transform duration-700 group-hover:scale-[1.06] ${
            sold ? "grayscale" : ""
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/5 to-transparent" />

        <span
          className={`label-mono absolute left-3 top-3 rounded-sm px-2 py-1 ${STATUS_STYLES[vehicle.status] ?? STATUS_STYLES.available}`}
        >
          {STATUS_LABEL[vehicle.status] ?? vehicle.status}
        </span>
        <span className="label-mono absolute right-3 top-3 rounded-sm bg-ink/70 px-2 py-1 text-paper backdrop-blur-sm">
          {vehicle.stockRef}
        </span>

        <div className="absolute inset-x-3 bottom-3 flex items-end justify-between gap-3">
          <div>
            <p className="label-mono text-[10px] text-signal">{vehicle.grade}</p>
            <p className="font-display text-lg uppercase leading-none text-white">
              {vehicle.make} {vehicle.model}
            </p>
            <p className="mt-1 text-[12px] text-white/70">
              {vehicle.year} · {vehicle.trim}
            </p>
          </div>
          <span className="label-mono shrink-0 rounded-sm border border-white/25 px-2 py-1 text-white/80">
            {vehicle.bodyType}
          </span>
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-4">
        <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[12px] text-ink/70">
          <Spec icon={<IconGauge width={15} height={15} />} label={`${vehicle.mileageKm.toLocaleString()} km`} />
          <Spec icon={<IconFuel width={15} height={15} />} label={`${vehicle.engineCc}cc ${vehicle.fuel}`} />
          <Spec icon={<IconGear width={15} height={15} />} label={vehicle.transmission} />
          <Spec icon={<IconPin width={15} height={15} />} label={`Ships from ${vehicle.origin}`} />
        </div>

        <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-ink/15 pt-3">
          <div>
            <p className="label-mono text-[10px] text-ink/45">FOB · landed in Kenya</p>
            <p className="font-mono text-[13px] text-ink/60">{formatUsd(vehicle.fobUsd)}</p>
            <p className="font-display text-[19px] leading-tight text-ink">
              {formatKes(vehicle.totalLandedKes)}
            </p>
          </div>
          <span className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-paper transition-colors group-hover:bg-ocean">
            {sold ? "View file" : vehicle.status === "available" ? "Order" : "Details"}
            <IconArrow width={14} height={14} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function Spec({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className="text-ink/35">{icon}</span>
      <span className="truncate">{label}</span>
    </span>
  );
}
