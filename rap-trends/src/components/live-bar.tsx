"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RadioSegment, ScheduleItem } from "@/lib/types";

/**
 * Persistent WATCH LIVE / LISTEN LIVE controls.
 *
 * The radio control is a working transport: it holds play state, tracks elapsed
 * position against the published clock, and advances to the next segment when
 * one ends. It does not stream licensed audio in this build — the surface states
 * that plainly rather than pretending to play something.
 */
export function LiveBar({
  segments, current, nextTitle,
}: {
  segments: RadioSegment[];
  current: ScheduleItem | undefined;
  nextTitle?: string;
}) {
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [volume, setVolume] = useState(70);
  const [muted, setMuted] = useState(false);
  const [tick, setTick] = useState(() => Date.now());
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!playing) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => setTick(Date.now()), 1000);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [playing]);

  const segment = useMemo(() => {
    const at = tick;
    return (
      segments.find((s) => Date.parse(s.startIso) <= at && at < Date.parse(s.startIso) + s.durationSeconds * 1000) ??
      segments[0]
    );
  }, [segments, tick]);

  const elapsed = segment ? Math.max(0, Math.floor((tick - Date.parse(segment.startIso)) / 1000)) : 0;
  const progress = segment ? Math.min(100, (elapsed / segment.durationSeconds) * 100) : 0;

  const toggle = useCallback(() => {
    setPlaying((p) => {
      if (!p) setTick(Date.now());
      return !p;
    });
  }, []);

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-50 border-t border-ink-4 bg-ink-2/97 backdrop-blur">
      {expanded ? (
        <div className="mx-auto max-w-[110rem] border-b border-ink-4 px-4 py-4 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow text-blood">RAP TRENDS RADIO — this hour</p>
              <p className="mt-1 text-sm text-bone-dim">
                Continuous audio: music, hourly reports, interviews, countdowns, and discovery.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="rounded border border-ink-4 px-2 py-1 text-xs uppercase tracking-wide text-bone-dim hover:text-bone"
            >
              Collapse
            </button>
          </div>
          <ol className="thin-scroll mt-3 max-h-56 overflow-y-auto">
            {segments.map((s) => {
              const isNow = s.id === segment?.id;
              return (
                <li
                  key={s.id}
                  className={`flex items-center gap-3 border-b border-ink-4/50 py-2 text-sm ${
                    isNow ? "text-bone" : "text-bone-dim"
                  }`}
                >
                  <span className="num w-16 shrink-0 text-xs text-silver">
                    {new Date(s.startIso).toLocaleTimeString("en-US", {
                      hour: "numeric", minute: "2-digit", timeZone: "America/New_York",
                    })}
                  </span>
                  {isNow ? <span className="live-dot shrink-0" aria-hidden /> : <span className="w-2 shrink-0" />}
                  <span className="min-w-0 flex-1 truncate">{s.title}</span>
                  <span className="eyebrow shrink-0 text-silver">{s.kind.replace("_", " ")}</span>
                  {s.explicit ? (
                    <span className="shrink-0 rounded border border-ink-4 px-1 text-[0.625rem] font-bold text-bone-dim">E</span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      <div className="mx-auto flex max-w-[110rem] items-center gap-3 px-4 py-2.5 sm:px-6">
        <Link
          href="/live"
          className="flex shrink-0 items-center gap-2 rounded bg-blood px-3 py-2 text-xs font-bold uppercase tracking-wider text-white transition-colors hover:bg-[#E8282F]"
        >
          <span className="live-dot bg-white" aria-hidden />
          Watch live
        </Link>

        <button
          type="button"
          onClick={toggle}
          aria-pressed={playing}
          aria-label={playing ? "Pause RAP TRENDS Radio" : "Listen live to RAP TRENDS Radio"}
          className="flex shrink-0 items-center gap-2 rounded border border-ink-4 bg-ink-3 px-3 py-2 text-xs font-bold uppercase tracking-wider text-bone transition-colors hover:border-silver"
        >
          <span aria-hidden className="text-volt-soft">{playing ? "❚❚" : "▶"}</span>
          <span className="hidden sm:inline">{playing ? "Pause" : "Listen live"}</span>
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <p className="truncate text-xs font-semibold text-bone">
              {segment?.title ?? "RAP TRENDS RADIO"}
            </p>
            {segment?.artist ? (
              <p className="hidden truncate text-xs text-bone-dim sm:block">— {segment.artist}</p>
            ) : null}
          </div>
          <div className="mt-1 h-0.5 w-full overflow-hidden rounded bg-ink-4">
            <div
              className="h-full bg-volt transition-[width] duration-1000 ease-linear"
              style={{ width: `${playing ? progress : 0}%` }}
            />
          </div>
          <p className="mt-1 truncate text-[0.625rem] text-silver">
            {playing
              ? "Demo transport — no licensed audio is streamed in this build."
              : nextTitle
                ? `Next on RAP TRENDS TV: ${nextTitle}`
                : current?.title ?? "RAP TRENDS TV"}
          </p>
        </div>

        <div className="hidden items-center gap-2 md:flex">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            aria-label={muted ? "Unmute" : "Mute"}
            className="rounded px-2 py-1 text-bone-dim hover:text-bone"
          >
            <span aria-hidden>{muted || volume === 0 ? "🔇" : "🔊"}</span>
          </button>
          <label className="flex items-center gap-2">
            <span className="sr-only">Volume</span>
            <input
              type="range"
              min={0}
              max={100}
              value={muted ? 0 : volume}
              onChange={(e) => {
                setVolume(Number(e.target.value));
                setMuted(false);
              }}
              className="h-1 w-20 accent-[#1B57F5]"
            />
          </label>
        </div>

        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="shrink-0 rounded border border-ink-4 px-2 py-1.5 text-[0.625rem] font-semibold uppercase tracking-wide text-bone-dim hover:text-bone"
        >
          {expanded ? "Hide" : "Clock"}
        </button>
      </div>
    </div>
  );
}
