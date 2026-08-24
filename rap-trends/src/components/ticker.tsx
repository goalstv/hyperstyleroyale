import Link from "next/link";
import type { TickerItem } from "@/lib/types";

const KIND_LABEL: Record<TickerItem["kind"], string> = {
  release: "New release",
  breaking: "Breaking",
  chart: "Chart",
  live: "On air",
  premiere: "Premiere",
  concert: "Live event",
};

const KIND_COLOR: Record<TickerItem["kind"], string> = {
  release: "text-neon",
  breaking: "text-blood",
  chart: "text-volt-soft",
  live: "text-blood",
  premiere: "text-gold",
  concert: "text-bone",
};

/**
 * The network ticker. Duplicated once so the marquee loops seamlessly; the copy
 * is aria-hidden so screen readers hear each item exactly once, and the whole
 * strip pauses on hover or keyboard focus.
 */
export function Ticker({ items }: { items: TickerItem[] }) {
  const row = (hidden: boolean) => (
    <ul
      className="flex shrink-0 items-center"
      aria-hidden={hidden || undefined}
      aria-label={hidden ? undefined : "Latest across the network"}
    >
      {items.map((item) => (
        <li key={`${item.id}-${hidden}`} className="flex items-center whitespace-nowrap">
          <span className={`eyebrow mr-2 ${KIND_COLOR[item.kind]}`}>{KIND_LABEL[item.kind]}</span>
          {item.href ? (
            <Link href={item.href} className="text-sm text-bone-dim transition-colors hover:text-bone hover:underline">
              {item.text}
            </Link>
          ) : (
            <span className="text-sm text-bone-dim">{item.text}</span>
          )}
          <span className="mx-5 text-ink-4" aria-hidden>◆</span>
        </li>
      ))}
    </ul>
  );

  return (
    <div className="ticker relative border-y border-ink-4 bg-ink-2 py-2">
      <div className="flex overflow-hidden">
        <div className="ticker-track">
          {row(false)}
          {row(true)}
        </div>
      </div>
    </div>
  );
}
