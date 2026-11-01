"use client";

import Image from "next/image";
import { useState } from "react";
import { IconChevron } from "./icons";

export function VehicleGallery({ images, alt }: { images: string[]; alt: string }) {
  const [index, setIndex] = useState(0);
  const shots = images.length ? images : [alt];
  const go = (dir: number) => setIndex((i) => (i + dir + shots.length) % shots.length);

  return (
    <div>
      <div className="group relative aspect-[16/10] overflow-hidden rounded-sm border border-ink/12 bg-ink">
        <Image
          src={shots[index]}
          alt={`${alt} — view ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 62vw"
          className="object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/70 to-transparent p-4">
          <p className="font-mono text-[11.5px] text-paper/75">
            {String(index + 1).padStart(2, "0")} / {String(shots.length).padStart(2, "0")}
          </p>
        </div>
        {shots.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-paper opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-ink"
            >
              <IconChevron width={18} height={18} className="rotate-180" />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-3 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-ink/70 text-paper opacity-0 backdrop-blur transition-opacity group-hover:opacity-100 hover:bg-ink"
            >
              <IconChevron width={18} height={18} />
            </button>
          </>
        )}
      </div>

      {shots.length > 1 && (
        <div className="mt-3 grid grid-cols-4 gap-3">
          {shots.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIndex(i)}
              className={`relative aspect-[4/3] overflow-hidden rounded-sm border-2 transition-colors ${
                i === index ? "border-signal" : "border-ink/10 hover:border-ink/35"
              }`}
              aria-label={`Show photo ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="140px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
