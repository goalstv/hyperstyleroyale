import type { Metadata } from "next";
import { PitchPage } from "@/components/pitch-page";

export const metadata: Metadata = {
  title: "Radio syndication partnership",
  description: "A clean 24/7 feed plus hourly reports, countdowns, and station-branded custom editions.",
};

export default function RadioPitchPage() {
  return (
    <PitchPage
      track="Radio syndication"
      title="RAP TRENDS on radio"
      phase="Phase 3"
      status={{ label: "Building the affiliate feed — first markets sought", tone: "warn" }}
      lede="A clean 24/7 music-and-news service, plus short-form and long-form programmes that drop into an existing station clock: sixty-second updates, five-minute reports, a daily countdown, a two-hour weekend countdown, and station-branded custom editions."
      sections={[
        {
          title: "What a station actually gets",
          body: "Content that would cost a station a full-time staff to produce: a newsroom covering the format daily, artist interviews, a chart with a published method, and an emerging-artist franchise. All of it delivered clean, automation-ready, with cue tones, legal-ID windows, and local commercial availability in every hour. The network retains one national unit per quarter-hour on syndicated programmes; everything else is the station's to sell.",
        },
        {
          title: "Built for a real station clock",
          body: "Updates land at :50 and reports at :45, which is where a music station has room for them. The countdown is delivered at 04:00 ET for same-day use. The weekend countdown arrives Thursday at noon so a programme director has time to place it. Metadata is shaped for standard automation systems, and now-playing information, album art, and programme information publish alongside the audio.",
        },
        {
          title: "Clean feed, and why we are strict about it",
          body: "Radio affiliates receive the clean feed exclusively. The origination system will not route an explicit asset to a radio-affiliate destination — the rights gate treats a missing clean version as a blocker, not a warning. A station carrying RAP TRENDS is not taking on an indecency risk from our end.",
        },
        {
          title: "Hybrid radio and on-demand",
          body: "The service publishes RadioDNS-compatible metadata on the roadmap, so hybrid receivers and automotive dashboards can carry artwork and programme information. Every long-form programme is also released as a podcast with a transcript, which gives the affiliate a second life for the same content.",
        },
      ]}
      specs={[
        { label: "Affiliate feed", value: "Clean 24/7, secure IP delivery; satellite available by agreement" },
        { label: "Codec", value: "AAC 128 kb/s stereo; higher-rate contribution available" },
        { label: "Loudness", value: "Broadcast-normalized, consistent across programme and music elements" },
        { label: "Metadata", value: "Now-playing, artist, title, programme, artwork; automation-compatible" },
        { label: "Cue tones", value: "Standard cue tones at every local window" },
        { label: "Legal ID", value: "Top-of-hour window reserved for station legal identification" },
        { label: "Emergency", value: "Station retains full override and EAS capability" },
        { label: "Local avails", value: "12 minutes per hour on syndicated programmes" },
        { label: "Short-form", value: ":60 update hourly; 5:00 report hourly in dayparts" },
        { label: "Long-form", value: "Daily 58:00 countdown; weekly 2-hour countdown; 10:00 NEXT UP spotlight" },
        { label: "On-demand", value: "Podcast versions with transcripts and chapters" },
        { label: "Reporting", value: "Weekly affidavits; cue sheets for performance-rights reporting" },
      ]}
      deliverables={[
        "Clean 24/7 feed",
        "Seven syndicated formats including station-branded custom editions",
        "Automation-compatible metadata and cue tones",
        "Cue sheets for performance-rights reporting",
        "Promotional assets and station imaging",
        "Market exclusivity per agreement",
      ]}
      openQuestions={[
        "No radio affiliate agreement is in place in any market.",
        "Delivery vendor for the affiliate feed is not yet selected.",
        "Music licensing for a syndicated radio service requires executed master, publishing, and public-performance agreements.",
        "Satellite delivery requires a transponder arrangement that has not been contracted.",
      ]}
      ctaLabel="Request the radio package"
    />
  );
}
