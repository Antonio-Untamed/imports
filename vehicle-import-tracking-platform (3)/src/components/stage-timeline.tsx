import { STAGES } from "@/lib/constants";
import type { EventDTO } from "@/lib/data";
import { IconAlert, IconCheck, IconClock, IconDoc } from "./icons";

const KIND_STYLE: Record<string, { chip: string; label: string }> = {
  milestone: { chip: "bg-ocean/12 text-ocean-dark", label: "Milestone" },
  update: { chip: "bg-signal/20 text-signal-deep", label: "Update" },
  document: { chip: "bg-ink/8 text-ink/70", label: "Document" },
  alert: { chip: "bg-clay/14 text-clay", label: "Attention" },
};

export function StageTimeline({
  stage,
  events,
  dense = false,
}: {
  stage: number;
  events: EventDTO[];
  dense?: boolean;
}) {
  const eventsByStage = events.reduce<Record<number, EventDTO[]>>((acc, e) => {
    (acc[e.stage] ??= []).push(e);
    return acc;
  }, {});

  return (
    <ol className="relative">
      {STAGES.map((s, i) => {
        const done = i < stage;
        const current = i === stage;
        const stageEvents = eventsByStage[i] ?? [];
        return (
          <li key={s.key} className="relative flex gap-4 pb-6 last:pb-0">
            {i !== STAGES.length - 1 && (
              <span
                className={`absolute left-[15px] top-8 h-full w-px ${
                  done ? "bg-ocean" : "bg-ink/12"
                }`}
              />
            )}
            <span
              className={`relative z-10 mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-[11px] font-bold ${
                done
                  ? "border-ocean bg-ocean text-white"
                  : current
                    ? "border-signal bg-signal text-ink"
                    : "border-ink/15 bg-paper text-ink/35"
              }`}
            >
              {done ? <IconCheck width={15} height={15} strokeWidth={2.4} /> : i + 1}
              {current && (
                <span className="absolute inset-0 -z-10 animate-sonar rounded-full bg-signal/50" />
              )}
            </span>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h4
                  className={`text-[14px] font-bold leading-snug ${
                    current ? "text-ink" : done ? "text-ink/80" : "text-ink/35"
                  }`}
                >
                  {s.label}
                </h4>
                <span className="label-mono text-[10px] text-ink/35">{s.window}</span>
              </div>
              <p className="label-mono mt-1 text-[10px] text-ocean">{s.place}</p>
              {!dense && (
                <p className={`mt-1.5 text-[13px] leading-relaxed ${done || current ? "text-ink/65" : "text-ink/30"}`}>
                  {s.detail}
                </p>
              )}

              {stageEvents.length > 0 && (
                <div className={`mt-3 grid gap-2 ${dense ? "" : "sm:grid-cols-1"}`}>
                  {stageEvents.map((e) => {
                    const kind = KIND_STYLE[e.kind] ?? KIND_STYLE.milestone;
                    const d = new Date(e.occurredAt);
                    return (
                      <div
                        key={e.id}
                        className={`rounded-sm border-l-2 bg-white/70 px-3 py-2.5 ${
                          e.kind === "alert" ? "border-clay bg-clay/5" : "border-ink/12"
                        }`}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={`label-mono rounded-sm px-1.5 py-0.5 ${kind.chip}`}>
                            {e.kind === "alert" ? (
                              <IconAlert width={11} height={11} className="mr-1 inline" />
                            ) : e.kind === "document" ? (
                              <IconDoc width={11} height={11} className="mr-1 inline" />
                            ) : null}
                            {kind.label}
                          </span>
                          <p className="text-[13px] font-semibold text-ink">{e.title}</p>
                          <span className="ml-auto flex items-center gap-1 font-mono text-[11px] text-ink/40">
                            <IconClock width={12} height={12} />
                            {d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}{" "}
                            {d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                        {e.detail && (
                          <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink/65">{e.detail}</p>
                        )}
                        {e.location && (
                          <p className="label-mono mt-1.5 text-[10px] text-ink/35">{e.location}</p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
