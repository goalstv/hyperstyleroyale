import type { ReactNode } from "react";
import Link from "next/link";
import type { Provenance } from "@/lib/types";

/* --------------------------------------------------------------- primitives */

export function Card({
  children, className = "", as: Tag = "div",
}: { children: ReactNode; className?: string; as?: "div" | "article" | "section" | "li" }) {
  return <Tag className={`surface rounded-lg ${className}`}>{children}</Tag>;
}

export function SectionHeader({
  eyebrow, title, description, action, id,
}: {
  eyebrow?: string; title: string; description?: string; action?: ReactNode; id?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4 border-b border-ink-4 pb-4">
      <div className="min-w-0">
        {eyebrow ? <p className="eyebrow text-blood mb-2">{eyebrow}</p> : null}
        <h2 id={id} className="display text-3xl sm:text-4xl text-bone">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm text-bone-dim">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

type Tone = "neutral" | "live" | "volt" | "good" | "warn" | "bad" | "gold";

const TONE_CLASS: Record<Tone, string> = {
  neutral: "bg-ink-4/70 text-bone-dim border-ink-4",
  live: "bg-blood/15 text-blood border-blood/40",
  volt: "bg-volt/15 text-volt-soft border-volt/40",
  good: "bg-neon/12 text-neon border-neon/35",
  warn: "bg-amber/12 text-amber border-amber/35",
  bad: "bg-blood/15 text-blood border-blood/40",
  gold: "bg-gold/12 text-gold border-gold/35",
};

export function Badge({
  children, tone = "neutral", className = "",
}: { children: ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 text-[0.6875rem] font-semibold uppercase tracking-wider ${TONE_CLASS[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export function LiveBadge({ label = "Live" }: { label?: string }) {
  return (
    <Badge tone="live">
      <span className="live-dot" aria-hidden />
      {label}
    </Badge>
  );
}

/**
 * Data-integrity label. Required on anything that is not verified live data —
 * the network's rule is that a viewer can always tell which is which.
 */
export function ProvenanceTag({
  provenance, note, className = "",
}: { provenance: Provenance; note?: string; className?: string }) {
  const map: Record<Provenance, { tone: Tone; label: string }> = {
    verified: { tone: "good", label: "Verified data" },
    demo: { tone: "warn", label: "Demo data" },
    estimated: { tone: "warn", label: "Estimated" },
    unverified: { tone: "bad", label: "Unverified" },
  };
  const { tone, label } = map[provenance];
  return (
    <span className={className}>
      <Badge tone={tone} className={note ? "cursor-help" : undefined}>
        <span title={note}>{label}</span>
      </Badge>
    </span>
  );
}

export function Button({
  children, href, onClick, tone = "primary", size = "md", type = "button", className = "", disabled, ...rest
}: {
  children: ReactNode; href?: string; onClick?: () => void;
  tone?: "primary" | "live" | "ghost" | "outline"; size?: "sm" | "md" | "lg";
  type?: "button" | "submit"; className?: string; disabled?: boolean;
  "aria-label"?: string;
}) {
  const tones = {
    primary: "bg-bone text-ink hover:bg-white",
    live: "bg-blood text-white hover:bg-[#E8282F]",
    ghost: "bg-transparent text-bone hover:bg-ink-4",
    outline: "bg-transparent text-bone border border-ink-4 hover:border-silver hover:bg-ink-3",
  };
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-6 py-3 text-base" };
  const cls = `inline-flex items-center justify-center gap-2 rounded font-semibold uppercase tracking-wide transition-colors disabled:opacity-40 disabled:pointer-events-none ${tones[tone]} ${sizes[size]} ${className}`;
  if (href) return <Link href={href} className={cls} {...rest}>{children}</Link>;
  return <button type={type} onClick={onClick} disabled={disabled} className={cls} {...rest}>{children}</button>;
}

export function Stat({
  label, value, sub, tone = "neutral",
}: { label: string; value: ReactNode; sub?: ReactNode; tone?: Tone }) {
  const accent = {
    neutral: "text-bone", live: "text-blood", volt: "text-volt-soft",
    good: "text-neon", warn: "text-amber", bad: "text-blood", gold: "text-gold",
  }[tone];
  return (
    <div className="surface rounded-lg p-4">
      <p className="eyebrow text-silver">{label}</p>
      <p className={`num mt-2 text-2xl font-semibold ${accent}`}>{value}</p>
      {sub ? <p className="mt-1 text-xs text-bone-dim">{sub}</p> : null}
    </div>
  );
}

/** Horizontal meter. Used for confidence, pacing, coverage, and signal weight. */
export function Meter({
  value, max = 100, tone = "volt", label, showValue = true, height = "h-1.5",
}: { value: number; max?: number; tone?: Tone; label: string; showValue?: boolean; height?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const fill = {
    neutral: "bg-silver", live: "bg-blood", volt: "bg-volt",
    good: "bg-neon", warn: "bg-amber", bad: "bg-blood", gold: "bg-gold",
  }[tone];
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-xs text-bone-dim">{label}</span>
        {showValue ? <span className="num text-xs text-bone">{value}</span> : null}
      </div>
      <div
        className={`mt-1 w-full overflow-hidden rounded-full bg-ink-4 ${height}`}
        role="meter"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label}
      >
        <div className={`h-full rounded-full ${fill}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function EmptyState({ title, description, action }: { title: string; description: string; action?: ReactNode }) {
  return (
    <div className="surface rounded-lg p-10 text-center">
      <p className="display text-2xl text-bone">{title}</p>
      <p className="mx-auto mt-2 max-w-md text-sm text-bone-dim">{description}</p>
      {action ? <div className="mt-5 flex justify-center">{action}</div> : null}
    </div>
  );
}

export function ErrorState({ title, detail, retry }: { title: string; detail: string; retry?: ReactNode }) {
  return (
    <div role="alert" className="rounded-lg border border-blood/40 bg-blood/10 p-6">
      <p className="display text-xl text-blood">{title}</p>
      <p className="mt-2 text-sm text-bone-dim">{detail}</p>
      {retry ? <div className="mt-4">{retry}</div> : null}
    </div>
  );
}

export function Skeleton({ className = "h-4 w-full" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-ink-4 ${className}`} aria-hidden />;
}

export function Notice({
  tone = "volt", title, children,
}: { tone?: Tone; title: string; children: ReactNode }) {
  const border = {
    neutral: "border-ink-4", live: "border-blood/40", volt: "border-volt/40",
    good: "border-neon/35", warn: "border-amber/40", bad: "border-blood/40", gold: "border-gold/35",
  }[tone];
  const bg = {
    neutral: "bg-ink-3", live: "bg-blood/8", volt: "bg-volt/8",
    good: "bg-neon/8", warn: "bg-amber/8", bad: "bg-blood/8", gold: "bg-gold/8",
  }[tone];
  return (
    <div className={`rounded-lg border ${border} ${bg} p-4`}>
      <p className="eyebrow mb-1.5 text-bone">{title}</p>
      <div className="text-sm leading-relaxed text-bone-dim">{children}</div>
    </div>
  );
}

/* -------------------------------------------------------------- data tables */

export function Table({ children, caption }: { children: ReactNode; caption?: string }) {
  return (
    <div className="thin-scroll overflow-x-auto">
      <table className="w-full min-w-[40rem] border-collapse text-sm">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className = "", scope = "col" }: { children: ReactNode; className?: string; scope?: "col" | "row" }) {
  return (
    <th scope={scope} className={`border-b border-ink-4 px-3 py-2.5 text-left eyebrow text-silver ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <td className={`border-b border-ink-4/60 px-3 py-2.5 align-top text-bone-dim ${className}`}>{children}</td>;
}

/** Definition row used across artist, asset, rights, and spec panels. */
export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5 border-b border-ink-4/60 py-2 last:border-0">
      <dt className="eyebrow text-silver">{label}</dt>
      <dd className="text-right text-sm text-bone">{children}</dd>
    </div>
  );
}

export function KeyValue({ children }: { children: ReactNode }) {
  return <dl className="divide-y divide-ink-4/40">{children}</dl>;
}
