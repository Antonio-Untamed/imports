"use client";

import { useEffect, useState } from "react";
import { IconAnchor, IconPin, IconShip } from "./icons";

type Pt = [number, number];

const SEG1: [Pt, Pt, Pt, Pt] = [
  [42, 126],
  [150, 196],
  [250, 146],
  [298, 112],
];
const SEG2: [Pt, Pt, Pt, Pt] = [
  [298, 112],
  [320, 96],
  [340, 64],
  [358, 42],
];

function cubic(p: [Pt, Pt, Pt, Pt], t: number): Pt {
  const [a, b, c, d] = p;
  const mt = 1 - t;
  const x = mt ** 3 * a[0] + 3 * mt ** 2 * t * b[0] + 3 * mt * t ** 2 * c[0] + t ** 3 * d[0];
  const y = mt ** 3 * a[1] + 3 * mt ** 2 * t * b[1] + 3 * mt * t ** 2 * c[1] + t ** 3 * d[1];
  return [x, y];
}

const SPLIT = 0.74;

export function RouteMap({
  origin,
  destination,
  progressPct,
  vessel,
  eta,
}: {
  origin: string;
  destination: string;
  progressPct: number;
  vessel?: string;
  eta?: string | null;
}) {
  const p = Math.max(0, Math.min(1, progressPct / 100));
  const point = p <= SPLIT ? cubic(SEG1, p / SPLIT) : cubic(SEG2, (p - SPLIT) / (1 - SPLIT));
  const atSea = p > 0.2 && p < SPLIT;

  // gentle drift so the vessel marker feels alive
  const [drift, setDrift] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setDrift((d) => (d + 1) % 360), 900);
    return () => clearInterval(id);
  }, []);
  const bob = Math.sin((drift * Math.PI) / 180) * 1.4;

  const d = `M ${SEG1[0][0]},${SEG1[0][1]} C ${SEG1[1][0]},${SEG1[1][1]} ${SEG1[2][0]},${SEG1[2][1]} ${SEG1[3][0]},${SEG1[3][1]} C ${SEG2[1][0]},${SEG2[1][1]} ${SEG2[2][0]},${SEG2[2][1]} ${SEG2[3][0]},${SEG2[3][1]}`;

  const etaLabel = eta
    ? new Date(eta).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
    : "—";

  return (
    <div className="relative overflow-hidden rounded-sm border border-white/10 bg-ink">
      <div className="grid-lines absolute inset-0 opacity-70" />
      <svg viewBox="0 0 400 210" className="relative w-full" role="img" aria-label={`Route from ${origin} to ${destination}`}>
        {/* stylised latitude bands */}
        {[30, 70, 110, 150, 190].map((y) => (
          <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
        ))}
        {/* abstract coastline near Kenya */}
        <path
          d="M 292 8 C 300 40, 286 62, 300 92 C 312 118, 296 150, 312 205"
          stroke="#17a39a"
          strokeOpacity="0.35"
          strokeWidth="1.4"
          fill="none"
          strokeDasharray="3 5"
        />
        <path
          d="M 300 92 C 330 96, 360 78, 396 84 L 396 205 L 316 205 C 300 168, 312 128, 300 92 Z"
          fill="#0d6d68"
          fillOpacity="0.16"
        />

        {/* full route */}
        <path d={d} fill="none" stroke="#ffffff" strokeOpacity="0.18" strokeWidth="1.6" strokeDasharray="4 5" />
        {/* travelled portion */}
        <path
          d={d}
          pathLength={100}
          fill="none"
          stroke="#e8a33d"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeDasharray={`${Math.max(0.5, p * 100)} 100`}
        />

        {/* origin */}
        <g>
          <circle cx={SEG1[0][0]} cy={SEG1[0][1]} r="5.5" fill="#0a0f0d" stroke="#17a39a" strokeWidth="2" />
          <text x={SEG1[0][0] - 4} y={SEG1[0][1] - 14} fill="#f6f3ec" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
            {origin.toUpperCase()}
          </text>
        </g>

        {/* Mombasa */}
        <g>
          <circle cx={SEG1[3][0]} cy={SEG1[3][1]} r="5.5" fill="#0a0f0d" stroke="#17a39a" strokeWidth="2" />
          <text x={SEG1[3][0] - 30} y={SEG1[3][1] + 22} fill="#f6f3ec" fontSize="9.5" fontFamily="IBM Plex Mono, monospace">
            MOMBASA · KPA
          </text>
        </g>

        {/* destination */}
        <g>
          <circle cx={SEG2[3][0]} cy={SEG2[3][1]} r="5" fill="#e8a33d" />
          <text
            x={SEG2[3][0] - 6}
            y={SEG2[3][1] - 12}
            fill="#e8a33d"
            fontSize="9.5"
            textAnchor="end"
            fontFamily="IBM Plex Mono, monospace"
          >
            {destination.toUpperCase()}
          </text>
        </g>

        {/* vessel marker */}
        <g transform={`translate(${point[0]}, ${point[1] + bob})`}>
          <circle r="12" fill="#e8a33d" fillOpacity="0.14" className="animate-sonar" />
          <circle r="8" fill="#0a0f0d" stroke="#e8a33d" strokeWidth="1.6" />
          <circle r="2.6" fill="#e8a33d" />
        </g>
      </svg>

      <div className="relative flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-white/10 bg-ink-2/80 px-4 py-3">
        <span className="flex items-center gap-2 text-[12px] text-paper/75">
          <IconShip width={16} height={16} className="text-signal" />
          <span className="font-mono">{vessel || "Vessel TBC"}</span>
        </span>
        <span className="flex items-center gap-2 text-[12px] text-paper/60">
          <IconAnchor width={15} height={15} className="text-ocean-light" />
          {atSea ? "Underway — Indian Ocean" : p >= SPLIT ? "In Kenyan waters / inland" : "Awaiting departure"}
        </span>
        <span className="ml-auto flex items-center gap-2 text-[12px] text-paper/75">
          <IconPin width={15} height={15} className="text-signal" />
          ETA <span className="font-mono text-paper">{etaLabel}</span>
        </span>
      </div>
    </div>
  );
}
