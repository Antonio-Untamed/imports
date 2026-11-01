"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import type { EngagementDTO } from "@/lib/data";
import { BRAND } from "@/lib/constants";
import { IconChat, IconFire, IconHeart, IconLike, IconPlus, IconSearch } from "./icons";

const REACTIONS = [
  { key: "like", label: "Solid", Icon: IconLike },
  { key: "heart", label: "Love it", Icon: IconHeart },
  { key: "fire", label: "Fire", Icon: IconFire },
];

const ROLE_STYLE: Record<string, string> = {
  agent: "bg-ocean text-white",
  system: "bg-ink/80 text-paper",
  client: "bg-signal text-ink",
};

function timeAgo(isoStr: string) {
  const diff = Date.now() - new Date(isoStr).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(isoStr).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

const AVATAR_TONES = ["bg-ocean", "bg-clay", "bg-ink", "bg-leaf", "bg-signal-deep"];
function toneFor(handle: string) {
  let h = 0;
  for (const c of handle) h = (h * 31 + c.charCodeAt(0)) % 9973;
  return AVATAR_TONES[h % AVATAR_TONES.length];
}

export function EngagementBoard({
  initial,
  orderId,
  orderRef,
  title = "Shipment thread",
  subtitle,
  shareUrl,
  compact = false,
}: {
  initial: EngagementDTO[];
  orderId?: number | null;
  orderRef?: string;
  title?: string;
  subtitle?: string;
  shareUrl?: string;
  compact?: boolean;
}) {
  const [items, setItems] = useState<EngagementDTO[]>(initial);
  const [filter, setFilter] = useState<"all" | "agent" | "client">("all");
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [replyTo, setReplyTo] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // loaded in an effect so server and client render identically on first paint
  const [me, setMe] = useState<{ name: string; handle: string }>({ name: "", handle: "you" });
  const [resolvedUrl, setResolvedUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("bandari.identity");
      if (raw) {
        const parsed = JSON.parse(raw) as { name?: string; handle?: string };
        if (parsed?.name) setMe({ name: parsed.name, handle: parsed.handle || "you" });
      }
    } catch {
      /* ignore */
    }
    if (!shareUrl) setResolvedUrl(window.location.href);
  }, [shareUrl]);

  const saveMe = (name: string) => {
    const handle =
      name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ".")
        .replace(/^\.|\.$/g, "") || "you";
    const next = { name, handle };
    setMe(next);
    try {
      localStorage.setItem("bandari.identity", JSON.stringify(next));
    } catch {
      /* ignore */
    }
  };

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const visible = useMemo(() => {
    let out = items;
    if (filter !== "all") out = out.filter((i) => (filter === "agent" ? i.authorRole !== "client" : i.authorRole === "client"));
    if (query.trim()) {
      const q = query.toLowerCase();
      out = out.filter(
        (i) => i.body.toLowerCase().includes(q) || i.authorName.toLowerCase().includes(q)
      );
    }
    return out;
  }, [items, filter, query]);

  async function submitPost(body: string, imageUrl: string, parentId: number | null, name: string) {
    if (!body.trim()) return;
    setBusy(true);
    try {
      const res = await fetch("/api/engagements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: orderId ?? null, parentId, authorName: name, body, imageUrl }),
      });
      if (!res.ok) throw new Error("failed");
      const json = (await res.json()) as { post: EngagementDTO };
      setItems((prev) => {
        if (!parentId) return [json.post, ...prev];
        const walk = (nodes: EngagementDTO[]): EngagementDTO[] =>
          nodes.map((n) =>
            n.id === parentId ? { ...n, children: [...n.children, json.post] } : { ...n, children: walk(n.children) }
          );
        return walk(prev);
      });
      setReplyTo(null);
      notify("Posted to the thread");
    } catch {
      notify("Could not post — try again");
    } finally {
      setBusy(false);
    }
  }

  async function react(id: number, type: string) {
    const handle = me.handle || "guest";
    try {
      const res = await fetch("/api/engagements/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, handle, type }),
      });
      const json = (await res.json()) as { reactions: Record<string, number>; active: boolean };
      setItems((prev) => {
        const walk = (nodes: EngagementDTO[]): EngagementDTO[] =>
          nodes.map((n) => (n.id === id ? { ...n, reactions: json.reactions, children: walk(n.children) } : { ...n, children: walk(n.children) }));
        return walk(prev);
      });
    } catch {
      /* ignore */
    }
  }

  const url = shareUrl ?? resolvedUrl ?? "https://bandarimotors.co.ke";
  const totalReactions = items.reduce(
    (s, i) => s + Object.values(i.reactions).reduce((a, b) => a + b, 0),
    0
  );

  return (
    <section className="relative">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl uppercase">{title}</h3>
          {subtitle && <p className="mt-1.5 max-w-xl text-[13.5px] text-ink/60">{subtitle}</p>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="label-mono rounded-sm border border-ink/15 px-2.5 py-1.5 text-ink/55">
            {items.length} posts · {totalReactions} reactions
          </span>
          <ShareRow url={url} text={orderRef ? `Tracking ${orderRef} on Bandari Motors` : "Importing a car to Kenya"} />
        </div>
      </div>

      {/* composer */}
      <div className="mt-5 rounded-sm border border-ink/12 bg-white p-4">
        <div className="flex gap-3">
          <span
            className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[12px] font-bold text-white ${toneFor(me.handle || "you")}`}
          >
            {me.name ? initials(me.name) : "?"}
          </span>
          <Composer
            key={me.name}
            busy={busy}
            placeholder={
              orderId
                ? "Ask the clearing desk something, or post an update for your crew…"
                : "Share what you learned importing into Kenya…"
            }
            submitLabel="Post update"
            requireName
            defaultName={me.name}
            onName={saveMe}
            onSubmit={(body, image, name) => submitPost(body, image, null, name)}
          />
        </div>
      </div>

      {/* filters */}
      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(["all", "agent", "client"] as const).map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => setFilter(f)}
            className={`rounded-sm border px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider transition-colors ${
              filter === f ? "border-ink bg-ink text-paper" : "border-ink/15 text-ink/60 hover:border-ink/40"
            }`}
          >
            {f === "all" ? "Everything" : f === "agent" ? "Desk updates" : "Client chatter"}
          </button>
        ))}
        <label className="relative ml-auto flex min-w-[180px] flex-1 items-center sm:max-w-xs">
          <IconSearch width={15} height={15} className="absolute left-3 text-ink/35" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search the thread"
            className="w-full rounded-sm border border-ink/15 bg-white py-2 pl-9 pr-3 text-[13px] outline-none focus:border-ocean"
          />
        </label>
      </div>

      {/* posts */}
      <div className={`mt-4 grid gap-3 ${compact ? "" : ""}`}>
        {visible.length === 0 && (
          <p className="rounded-sm border border-dashed border-ink/20 bg-white/60 p-6 text-center text-sm text-ink/50">
            Nothing here yet. Be the first to post an update on this shipment.
          </p>
        )}
        {visible.map((post) => (
          <PostCard
            key={post.id}
            post={post}
            me={me.handle}
            onReact={(id, type) => react(id, type)}
            replyTo={replyTo}
            setReplyTo={setReplyTo}
            busy={busy}
            onReply={(body, image, name) => submitPost(body, image, post.id, name)}
            orderRef={post.orderRef ?? orderRef}
          />
        ))}
      </div>

      {toast && (
        <div className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-sm bg-ink px-4 py-2.5 text-[13px] font-semibold text-paper shadow-lg animate-rise">
          {toast}
        </div>
      )}
    </section>
  );
}

function PostCard({
  post,
  me,
  onReact,
  replyTo,
  setReplyTo,
  busy,
  onReply,
  orderRef,
  isReply = false,
}: {
  post: EngagementDTO;
  me: string;
  onReact: (id: number, type: string) => void;
  replyTo: number | null;
  setReplyTo: (id: number | null) => void;
  busy: boolean;
  onReply: (body: string, image: string, name: string) => void;
  orderRef?: string;
  isReply?: boolean;
}) {
  return (
    <article
      className={`rounded-sm border bg-white p-4 transition-shadow ${
        post.pinned ? "border-signal/50 shadow-[0_0_0_1px_rgba(232,163,61,0.25)]" : "border-ink/12"
      } ${isReply ? "bg-paper-2/40" : ""}`}
    >
      <div className="flex gap-3">
        <span
          className={`grid h-9 w-9 shrink-0 place-items-center rounded-full font-mono text-[12px] font-bold text-white ${toneFor(post.authorHandle)}`}
        >
          {initials(post.authorName)}
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <p className="text-[13.5px] font-bold text-ink">{post.authorName}</p>
            <span className="font-mono text-[11px] text-ink/35">@{post.authorHandle}</span>
            <span className={`label-mono rounded-sm px-1.5 py-0.5 ${ROLE_STYLE[post.authorRole] ?? ROLE_STYLE.client}`}>
              {post.authorRole === "agent" ? "Bandari desk" : post.authorRole === "system" ? "Auto update" : "Client"}
            </span>
            {post.pinned && <span className="label-mono text-signal-deep">Pinned</span>}
            {orderRef && !isReply && (
              <a
                href={`/order/${orderRef}`}
                className="label-mono rounded-sm border border-ink/15 px-1.5 py-0.5 text-ink/55 hover:border-ocean hover:text-ocean"
              >
                {orderRef}
              </a>
            )}
            <span className="ml-auto font-mono text-[11px] text-ink/35">{timeAgo(post.createdAt)}</span>
          </div>

          <p className="mt-2 whitespace-pre-line text-[14px] leading-relaxed text-ink/85">{post.body}</p>

          {post.imageUrl && (
            <div className="relative mt-3 aspect-[16/9] overflow-hidden rounded-sm border border-ink/10">
              <Image
                src={post.imageUrl}
                alt="Shipment attachment"
                fill
                sizes="(max-width: 768px) 100vw, 640px"
                className="object-cover"
              />
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            {REACTIONS.map(({ key, label, Icon }) => {
              const active = (post.reactions[key] ?? 0) > 0;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => onReact(post.id, key)}
                  aria-label={label}
                  title={label}
                  className={`flex items-center gap-1.5 rounded-sm border px-2.5 py-1.5 text-[12px] font-semibold transition-colors ${
                    active
                      ? "border-ink bg-ink text-paper"
                      : "border-ink/15 text-ink/60 hover:border-ink/45 hover:text-ink"
                  }`}
                >
                  <Icon width={14} height={14} />
                  {post.reactions[key] ?? 0}
                </button>
              );
            })}
            {!isReply && (
              <button
                type="button"
                onClick={() => setReplyTo(replyTo === post.id ? null : post.id)}
                className="flex items-center gap-1.5 rounded-sm border border-transparent px-2.5 py-1.5 text-[12px] font-semibold text-ink/55 hover:border-ink/20 hover:text-ink"
              >
                <IconChat width={14} height={14} />
                Reply {post.children.length > 0 && `(${post.children.length})`}
              </button>
            )}
          </div>

          {replyTo === post.id && (
            <div className="mt-3 border-t border-dashed border-ink/15 pt-3">
              <Composer
                busy={busy}
                placeholder="Write a reply…"
                submitLabel="Reply"
                compact
                onSubmit={(body, image, name) => onReply(body, image, name)}
                onCancel={() => setReplyTo(null)}
              />
            </div>
          )}

          {post.children.length > 0 && (
            <div className="mt-3 grid gap-2.5 border-l-2 border-ink/8 pl-3">
              {post.children.map((c) => (
                <PostCard
                  key={c.id}
                  post={c}
                  me={me}
                  onReact={onReact}
                  replyTo={replyTo}
                  setReplyTo={setReplyTo}
                  busy={busy}
                  onReply={onReply}
                  isReply
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

function Composer({
  onSubmit,
  busy,
  placeholder,
  submitLabel,
  requireName = false,
  defaultName = "",
  onName,
  onCancel,
  compact = false,
}: {
  onSubmit: (body: string, imageUrl: string, name: string) => void;
  busy: boolean;
  placeholder: string;
  submitLabel: string;
  requireName?: boolean;
  defaultName?: string;
  onName?: (name: string) => void;
  onCancel?: () => void;
  compact?: boolean;
}) {
  const [body, setBody] = useState("");
  const [image, setImage] = useState("");
  const [name, setName] = useState(defaultName);
  const [showImage, setShowImage] = useState(false);

  const canSubmit = body.trim().length > 1 && (!requireName || name.trim().length > 1) && !busy;

  return (
    <div className="min-w-0 flex-1">
      {requireName && (
        <input
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            onName?.(e.target.value);
          }}
          placeholder="Your name"
          className="mb-2 w-full max-w-xs rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px] outline-none focus:border-ocean"
        />
      )}
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={compact ? 2 : 3}
        placeholder={placeholder}
        className="w-full resize-y rounded-sm border border-ink/15 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-ocean"
      />
      {showImage && (
        <input
          value={image}
          onChange={(e) => setImage(e.target.value)}
          placeholder="Paste a photo URL (optional)"
          className="mt-2 w-full rounded-sm border border-ink/15 bg-white px-3 py-2 text-[13px] outline-none focus:border-ocean"
        />
      )}
      <div className="mt-2.5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          disabled={!canSubmit}
          onClick={() => {
            onSubmit(body, image, name || "Anonymous");
            setBody("");
            setImage("");
            setShowImage(false);
          }}
          className="rounded-sm bg-ink px-4 py-2 text-[12px] font-bold uppercase tracking-wider text-paper transition-colors enabled:hover:bg-ocean disabled:cursor-not-allowed disabled:opacity-35"
        >
          {busy ? "Posting…" : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => setShowImage((v) => !v)}
          className="flex items-center gap-1.5 rounded-sm border border-ink/15 px-3 py-2 text-[12px] font-semibold text-ink/60 hover:border-ink/40 hover:text-ink"
        >
          <IconPlus width={13} height={13} /> Photo
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm px-3 py-2 text-[12px] font-semibold text-ink/50 hover:text-ink"
          >
            Cancel
          </button>
        )}
        <span className="ml-auto font-mono text-[11px] text-ink/30">{body.length}/2000</span>
      </div>
    </div>
  );
}

export function ShareRow({ url, text }: { url: string; text: string }) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const msg = encodeURIComponent(text);
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1800);
          } catch {
            /* ignore */
          }
        }}
        className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[12px] font-semibold text-ink/60 hover:border-ink/40 hover:text-ink"
      >
        {copied ? "Link copied" : "Copy link"}
      </button>
      <a
        href={`https://wa.me/?text=${msg}%20${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[12px] font-semibold text-ink/60 hover:border-leaf hover:text-leaf"
      >
        WhatsApp
      </a>
      <a
        href={`https://twitter.com/intent/tweet?text=${msg}&url=${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="rounded-sm border border-ink/15 px-2.5 py-1.5 text-[12px] font-semibold text-ink/60 hover:border-ink/50 hover:text-ink"
      >
        Share
      </a>
      <a
        href={`https://wa.me/${BRAND.whatsapp}?text=${msg}%20${encoded}`}
        target="_blank"
        rel="noreferrer"
        className="hidden rounded-sm bg-leaf px-3 py-1.5 text-[12px] font-bold uppercase tracking-wider text-white hover:bg-leaf/90 sm:block"
      >
        Ask the desk
      </a>
    </div>
  );
}
