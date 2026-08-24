import type { Metadata } from "next";
import { getNowPlaying, getRadioClock, getSyndicatedFormats } from "@/lib/repo";
import { Badge, Button, Card, LiveBadge, Notice, SectionHeader, Table, Td, Th } from "@/components/ui";
import { fmtTime } from "@/lib/format";
import { formatDuration } from "@/lib/schedule";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Listen live",
  description: "RAP TRENDS RADIO — continuous audio, hourly reports, countdowns, and artist discovery.",
};

const KIND_LABEL: Record<string, string> = {
  music: "Music", news: "News", interview: "Interview", countdown: "Countdown",
  dj_show: "DJ show", discovery: "Discovery", id: "Legal ID", spot_window: "Commercial window",
};

export default async function RadioPage() {
  const [clock, playing, formats] = await Promise.all([
    getRadioClock(), getNowPlaying(), getSyndicatedFormats(),
  ]);

  return (
    <div className="mx-auto max-w-[110rem] px-4 py-8 sm:px-6">
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <LiveBadge label="On air" />
            <p className="eyebrow text-silver">RAP TRENDS RADIO</p>
          </div>
          <h1 className="display mt-3 text-5xl text-bone sm:text-6xl">Listen live</h1>
          <p className="mt-4 max-w-2xl text-bone-dim">
            One continuous audio service: music, one-minute updates at :50, five-minute reports at
            :45, interviews, the daily countdown, and NEXT UP discovery. A clean feed originates in
            parallel for radio affiliates, with legal-ID and local commercial windows in every hour.
          </p>

          <Card className="mt-6 p-5">
            <p className="eyebrow text-silver">Now playing</p>
            <p className="display mt-2 text-4xl text-bone">{playing.title}</p>
            {playing.artist ? <p className="mt-1 text-lg text-bone-dim">{playing.artist}</p> : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="volt">{KIND_LABEL[playing.kind] ?? playing.kind}</Badge>
              <Badge>{formatDuration(playing.durationSeconds)}</Badge>
              {playing.explicit ? <Badge tone="warn">Explicit — digital feed</Badge> : <Badge tone="good">Clean</Badge>}
            </div>
            <p className="mt-4 text-xs text-silver">
              Use LISTEN LIVE in the bar at the bottom of the screen. In-car, hybrid-radio, and
              smart-speaker listening are on the roadmap; the metadata this service publishes is
              already shaped for them.
            </p>
          </Card>

          <Notice tone="warn" title="About this stream" >
            No licensed audio is streamed in this build. Now-playing metadata, the hour clock, the
            affiliate feed structure, and the commercial windows are real product surfaces; the
            audio itself requires executed master, publishing, and digital-performance licences.
          </Notice>
        </div>

        <Card className="overflow-hidden">
          <h2 className="eyebrow border-b border-ink-4 p-3 text-silver">This hour</h2>
          <ol className="thin-scroll max-h-[32rem] overflow-y-auto">
            {clock.map((s) => {
              const isNow = s.id === playing.id;
              return (
                <li
                  key={s.id}
                  className={`flex items-center gap-3 border-b border-ink-4/60 px-3 py-2.5 last:border-0 ${
                    isNow ? "bg-blood/8" : ""
                  }`}
                >
                  <span className="num w-14 shrink-0 text-xs text-silver">{fmtTime(s.startIso)}</span>
                  {isNow ? <span className="live-dot shrink-0" aria-hidden /> : <span className="w-2 shrink-0" />}
                  <span className="min-w-0 flex-1">
                    <span className={`block truncate text-sm ${isNow ? "text-bone" : "text-bone-dim"}`}>{s.title}</span>
                    <span className="text-xs text-silver">{KIND_LABEL[s.kind] ?? s.kind}</span>
                  </span>
                  <span className="num shrink-0 text-xs text-silver">{formatDuration(s.durationSeconds)}</span>
                </li>
              );
            })}
          </ol>
        </Card>
      </div>

      <section aria-labelledby="syndication" className="mt-16">
        <SectionHeader
          id="syndication"
          eyebrow="For radio stations"
          title="Syndicated formats"
          description="Every format below is delivered clean, automation-ready, with cue tones, legal-ID windows, and local commercial availability."
          action={<Button href="/partners/radio" tone="outline" size="sm">Radio partner package</Button>}
        />
        <div className="mt-6">
          <Table caption="RAP TRENDS syndicated radio formats">
            <thead>
              <tr>
                <Th>Format</Th><Th>Length</Th><Th>Cadence</Th><Th>Feed</Th><Th>Delivery</Th>
              </tr>
            </thead>
            <tbody>
              {formats.map((f) => (
                <tr key={f.id}>
                  <Td className="text-bone">
                    <span className="font-semibold">{f.name}</span>
                    <span className="mt-0.5 block text-xs text-silver">{f.description}</span>
                  </Td>
                  <Td className="num whitespace-nowrap">{f.length}</Td>
                  <Td className="whitespace-nowrap">{f.cadence}</Td>
                  <Td><Badge tone={f.feed === "clean" ? "good" : "neutral"}>{f.feed}</Badge></Td>
                  <Td className="text-xs">{f.deliveryWindow}</Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>
      </section>
    </div>
  );
}
