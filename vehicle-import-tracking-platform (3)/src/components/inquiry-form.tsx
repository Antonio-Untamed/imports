"use client";

import { useState } from "react";
import { BRAND, waLink } from "@/lib/constants";
import { IconAlert, IconArrow, IconCheck, IconWhatsApp } from "./icons";

const TOPICS = [
  { id: "source", label: "Source a specific car" },
  { id: "callback", label: "Request a callback" },
  { id: "budget", label: "Budget & duty advice" },
  { id: "clearing", label: "Clearing an existing import" },
  { id: "fleet", label: "Fleet / multiple units" },
];

const LABELS: Record<string, string> = Object.fromEntries(TOPICS.map((t) => [t.id, t.label]));

export function InquiryForm() {
  const [form, setForm] = useState({ name: "", contact: "", topic: "source", message: "" });
  const [state, setState] = useState<"idle" | "busy" | "done" | "error">("idle");
  const [error, setError] = useState("");
  const [link, setLink] = useState("");

  function buildMessage() {
    return [
      `*Bandari Motors — ${LABELS[form.topic] ?? form.topic}*`,
      ``,
      `Name: ${form.name}`,
      `Callback on: ${form.contact}`,
      ``,
      form.message,
    ].join("\n");
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    // Open WhatsApp inside the click gesture so popup blockers allow it —
    // the request lands directly on the office number, pre-filled.
    const url = waLink(buildMessage());
    setLink(url);
    const win = window.open(url, "_blank", "noopener,noreferrer");

    setState("busy");
    setError("");
    try {
      const res = await fetch("/api/inquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Could not send");
      setState("done");
      if (!win) setError("WhatsApp was blocked by your browser — use the button below to open it.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send your request");
      setState("error");
    }
  }

  if (state === "done") {
    return (
      <div className="rounded-sm border-l-4 border-leaf bg-leaf/8 p-6">
        <p className="flex items-center gap-2 font-display text-xl uppercase text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-leaf text-white">
            <IconCheck width={16} height={16} strokeWidth={2.6} />
          </span>
          Sent to WhatsApp
        </p>
        <p className="mt-3 text-[13.5px] leading-relaxed text-ink/70">
          Your {LABELS[form.topic]?.toLowerCase()} request has been delivered straight to the import desk on{" "}
          <span className="font-mono font-bold">{BRAND.phone}</span> and logged in the admin console. Expect a
          reply within the hour on business days — usually with two or three auction candidates and a
          CRSP-based landed-cost sheet.
        </p>

        {error && (
          <p className="mt-3 flex items-start gap-2 rounded-sm border border-signal/40 bg-signal/12 px-3.5 py-2.5 text-[12.5px] font-semibold text-signal-deep">
            <IconAlert width={15} height={15} className="mt-0.5 shrink-0" />
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-wrap gap-2.5">
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2 rounded-sm bg-leaf px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-white hover:bg-leaf/90"
          >
            <IconWhatsApp width={16} height={16} /> Open the WhatsApp chat
          </a>
          <a
            href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
            className="rounded-sm border border-ink/20 px-5 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ink/70 hover:border-ocean hover:text-ocean"
          >
            Call {BRAND.phone}
          </a>
          <button
            type="button"
            onClick={() => {
              setForm({ name: "", contact: "", topic: "source", message: "" });
              setState("idle");
              setError("");
            }}
            className="rounded-sm px-4 py-3 text-[12.5px] font-bold uppercase tracking-wider text-ocean hover:underline"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-sm border border-ink/12 bg-white p-5 sm:p-6">
      <p className="label-mono text-ocean">Sourcing brief · callback request</p>
      <h3 className="mt-1.5 font-display text-2xl uppercase">Goes straight to our WhatsApp</h3>
      <p className="mt-2 flex items-start gap-2 text-[12.5px] leading-relaxed text-ink/60">
        <IconWhatsApp width={15} height={15} className="mt-0.5 shrink-0 text-leaf" />
        Sending opens a pre-filled chat with the import desk on{" "}
        <span className="font-mono font-semibold text-ink">{BRAND.phone}</span> and logs the request in our
        admin console so nothing gets lost.
      </p>

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="label-mono text-ink/50">Your name</span>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 w-full rounded-sm border border-ink/18 px-3 py-2.5 text-[14px] outline-none focus:border-ocean"
            placeholder="Grace Akinyi"
          />
        </label>
        <label className="block">
          <span className="label-mono text-ink/50">Number to call back</span>
          <input
            required
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="mt-1.5 w-full rounded-sm border border-ink/18 px-3 py-2.5 font-mono text-[14px] outline-none focus:border-ocean"
            placeholder="+254 7xx xxx xxx"
          />
        </label>
      </div>

      <div className="mt-4">
        <span className="label-mono text-ink/50">What do you need?</span>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {TOPICS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setForm({ ...form, topic: t.id })}
              className={`rounded-sm border px-3 py-2 text-[12.5px] font-semibold transition-colors ${
                form.topic === t.id
                  ? "border-ink bg-ink text-paper"
                  : "border-ink/20 text-ink/65 hover:border-ink/50"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <label className="mt-4 block">
        <span className="label-mono text-ink/50">Spec, budget ceiling and deadline</span>
        <textarea
          required
          rows={4}
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          className="mt-1.5 w-full resize-y rounded-sm border border-ink/18 px-3 py-2.5 text-[14px] outline-none focus:border-ocean"
          placeholder="2019+ Subaru Forester or Mazda CX-5, petrol or diesel, ceiling KES 3.4M landed, needed in Nairobi by end of next quarter."
        />
      </label>

      {state === "error" && error && (
        <p className="mt-3 rounded-sm border border-clay/30 bg-clay/8 px-3.5 py-2.5 text-[13px] font-semibold text-clay">
          {error}
        </p>
      )}

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "busy"}
          className="flex items-center gap-2 rounded-sm bg-leaf px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-wider text-white transition-transform enabled:hover:-translate-y-0.5 disabled:opacity-50"
        >
          <IconWhatsApp width={16} height={16} />
          {state === "busy" ? "Opening WhatsApp…" : "Send to WhatsApp"}
          {state !== "busy" && <IconArrow width={15} height={15} />}
        </button>
        <a
          href={`tel:${BRAND.phone.replace(/\s/g, "")}`}
          className="rounded-sm border border-ink/20 px-5 py-3.5 text-[12.5px] font-bold uppercase tracking-wider text-ink/70 hover:border-ocean hover:text-ocean"
        >
          Or call {BRAND.phone}
        </a>
      </div>
    </form>
  );
}
