import { Suspense } from "react";
import type { Metadata } from "next";
import { listVehicles } from "@/lib/data";
import { MarketplaceBrowser } from "@/components/marketplace-browser";
import { formatKes } from "@/lib/duty";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Inventory — Bandari Motors",
  description:
    "Cleared-ready imported vehicles from Japan, the UK and the UAE with full landed cost including KRA duty, excise, IDF, RDL and VAT.",
};

export default async function MarketplacePage() {
  const all = await listVehicles({});
  const available = all.filter((v) => v.status === "available").length;
  const cheapest = Math.min(...all.map((v) => v.totalLandedKes));
  const dearest = Math.max(...all.map((v) => v.totalLandedKes));

  return (
    <div className="border-b border-ink/10 bg-ink text-paper">
      <div className="grid-lines">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
          <p className="label-mono text-signal">Stock list · updated hourly from auction results</p>
          <div className="mt-3 flex flex-wrap items-end justify-between gap-6">
            <h1 className="display-hero text-[clamp(2.2rem,6vw,4.4rem)] text-paper">
              {all.length} units,
              <br />
              {available} ready to order
            </h1>
            <dl className="flex flex-wrap gap-x-10 gap-y-4">
              <div>
                <dt className="label-mono text-paper/45">Landed price range</dt>
                <dd className="mt-1 font-mono text-[15px] text-paper">
                  {formatKes(cheapest)} — {formatKes(dearest)}
                </dd>
              </div>
              <div>
                <dt className="label-mono text-paper/45">Sources</dt>
                <dd className="mt-1 font-mono text-[15px] text-paper">Japan · UK · UAE</dd>
              </div>
              <div>
                <dt className="label-mono text-paper/45">Age rule</dt>
                <dd className="mt-1 font-mono text-[15px] text-paper">≤ 8 years, enforced</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      <div className="bg-paper py-10">
        <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
          <Suspense fallback={<p className="text-sm text-ink/50">Loading filters…</p>}>
            <MarketplaceBrowser all={all} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
