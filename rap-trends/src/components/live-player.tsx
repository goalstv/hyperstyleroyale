"use client";

import { useEffect, useState } from "react";
import { ArtSurface } from "./cards";

/**
 * Live television surface.
 *
 * A working transport shell: elapsed position against the scheduled start,
 * captions and audio-description toggles, quality selection, and a full-screen
 * request. No licensed video is streamed in this build, and the surface says so
 * rather than implying a feed exists.
 */
export function LivePlayer({
  title, showTitle, rating, startIso, durationSeconds,
}: {
  title: string; showTitle?: string; rating: string;
  startIso?: string; durationSeconds: number;
}) {
  const [captions, setCaptions] = useState(true);
  const [quality, setQuality] = useState("Auto (1080p)");
  const [muted, setMuted] = useState(true);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const elapsed = startIso ? Math.max(0, Math.floor((now - Date.parse(startIso)) / 1000)) : 0;
  const progress = durationSeconds > 0 ? Math.min(100, (elapsed / durationSeconds) * 100) : 0;
  const clock = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

  return (
    <div className="overflow-hidden rounded-lg border border-ink-4 bg-ink-2">
      <div className="relative">
        <ArtSurface seed={showTitle ?? title} ratio="aspect-video" label="Live channel slate">
          <div className="w-full">
            <p className="eyebrow mb-1 text-blood">RAP TRENDS TV · Live</p>
            <p className="display-tight text-3xl text-bone sm:text-5xl">{title}</p>
          </div>
        </ArtSurface>

        {/* Bug and rating, exactly as they sit on the broadcast feed. */}
        <div className="pointer-events-none absolute right-3 top-3 flex items-center gap-2">
          <span className="rounded bg-ink/70 px-1.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-wider text-bone">
            {rating}
          </span>
          <span className="display rounded bg-ink/70 px-2 py-0.5 text-sm text-bone">RT</span>
        </div>

        {captions ? (
          <div className="pointer-events-none absolute inset-x-0 bottom-16 flex justify-center px-8">
            <p className="max-w-2xl rounded bg-black/80 px-3 py-1.5 text-center text-sm text-white">
              [Captions render here. Caption files are delivered with every scheduled asset and are
              blocked from air until a human has reviewed them.]
            </p>
          </div>
        ) : null}
      </div>

      <div className="border-t border-ink-4 p-3">
        <div className="flex items-center gap-2">
          <span className="num text-xs text-silver">{clock(elapsed)}</span>
          <div className="h-1 flex-1 overflow-hidden rounded bg-ink-4">
            <div className="h-full bg-blood" style={{ width: `${progress}%` }} />
          </div>
          <span className="num text-xs text-silver">{clock(durationSeconds)}</span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={!muted}
            className="rounded border border-ink-4 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-bone hover:border-silver"
          >
            {muted ? "Unmute" : "Mute"}
          </button>
          <button
            type="button"
            onClick={() => setCaptions((c) => !c)}
            aria-pressed={captions}
            className={`rounded border px-3 py-1.5 text-xs font-semibold uppercase tracking-wide ${
              captions ? "border-neon/50 bg-neon/10 text-neon" : "border-ink-4 text-bone-dim hover:border-silver"
            }`}
          >
            Captions {captions ? "on" : "off"}
          </button>
          <label className="flex items-center gap-2 text-xs text-bone-dim">
            <span className="eyebrow text-silver">Quality</span>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value)}
              className="rounded border border-ink-4 bg-ink-3 px-2 py-1.5 text-xs text-bone"
            >
              {["Auto (1080p)", "1080p", "720p", "480p", "Audio only"].map((q) => (
                <option key={q}>{q}</option>
              ))}
            </select>
          </label>
          <span className="ml-auto text-[0.625rem] text-silver">
            Demo slate — no licensed video is streamed in this build.
          </span>
        </div>
      </div>
    </div>
  );
}
