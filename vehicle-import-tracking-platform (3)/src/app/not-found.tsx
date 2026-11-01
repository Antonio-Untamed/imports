import Link from "next/link";
import { getAllRefs } from "@/lib/data";
import { IconArrow, IconSearch } from "@/components/icons";

export const dynamic = "force-dynamic";

export default async function NotFound() {
  let refs: string[] = [];
  try {
    refs = await getAllRefs();
  } catch {
    refs = [];
  }

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-3xl flex-col items-start justify-center px-4 py-20 sm:px-6">
      <p className="label-mono text-clay">Error 404 · consignment not found</p>
      <h1 className="display-hero mt-3 text-[clamp(2.2rem,7vw,4.5rem)]">
        Nothing at this
        <br />
        berth
      </h1>
      <p className="mt-5 max-w-xl text-[14.5px] leading-relaxed text-ink/65">
        The reference you typed does not match an order, a vehicle listing or a page. Check for a transposed
        digit — references look like <span className="font-mono text-ink">BM-2604-HLX</span>, and the 6-digit
        passcode works just as well.
      </p>

      <div className="mt-7 flex flex-wrap gap-3">
        <Link
          href="/track"
          className="flex items-center gap-2 rounded-sm bg-signal px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink transition-transform hover:-translate-y-0.5"
        >
          <IconSearch width={15} height={15} /> Track a shipment
        </Link>
        <Link
          href="/marketplace"
          className="flex items-center gap-2 rounded-sm border border-ink/25 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink hover:border-ocean hover:text-ocean"
        >
          Browse inventory <IconArrow width={15} height={15} />
        </Link>
      </div>

      {refs.length > 0 && (
        <div className="mt-10 w-full rounded-sm border border-ink/12 bg-white p-5">
          <p className="label-mono text-ink/50">Live references you can open right now</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {refs.map((r) => (
              <Link
                key={r}
                href={`/order/${r}`}
                className="rounded-sm border border-ink/15 px-3 py-1.5 font-mono text-[12px] text-ink/70 transition-colors hover:border-ocean hover:bg-ocean hover:text-white"
              >
                {r}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
