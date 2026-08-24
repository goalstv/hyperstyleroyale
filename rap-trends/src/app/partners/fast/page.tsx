import type { Metadata } from "next";
import { PitchPage } from "@/components/pitch-page";

export const metadata: Metadata = {
  title: "FAST & connected TV partnership",
  description: "RAP TRENDS TV as a 24/7 FAST channel: HLS delivery, SCTE-35, XMLTV EPG, and SSAI readiness.",
};

export default function FastPitchPage() {
  return (
    <PitchPage
      track="FAST & connected TV"
      title="RAP TRENDS on FAST"
      phase="Phase 2"
      status={{ label: "In discussion — no agreement in place", tone: "warn" }}
      lede="A 24/7 linear hip-hop channel built for ad-supported streaming from the first frame: cloud playout, standards-compliant ad markers, a clean feed, and an EPG that is accurate seven days out."
      sections={[
        {
          title: "Why this channel works on a FAST platform",
          body: "FAST catalogues are deep in film and shallow in music, and the music channels that exist are mostly automated video jukeboxes with no editorial voice. RAP TRENDS is a programmed network with a daily flagship, a daily countdown, original performance production, and thirteen city bureaus — the kind of schedule that produces session length rather than a two-minute sample. Every hour is built as programme, break, promo, break, so the ad load is predictable and the breaks land where a platform expects them.",
        },
        {
          title: "Clean feed by default",
          body: "The channel originates a clean feed as its primary variant. Explicit audio exists only on owned digital origination, only in the late and overnight dayparts, and the scheduler rejects an explicit asset placed anywhere else before it can reach air. Platforms that require a clean feed receive one without a separate operational arrangement.",
        },
        {
          title: "Rights are validated before delivery, not after",
          body: "Every scheduled asset passes a rights gate that checks the specific rights required for FAST distribution — master, publishing, music-video exhibition, and public performance — against territory, licence window, caption status, and clean-version availability. A missing rights record blocks delivery rather than producing a takedown three weeks later.",
        },
        {
          title: "What we bring to the ad conversation",
          body: "Server-side ad insertion readiness, SCTE-35 markers on every break, VAST 4.2 and VMAP compatibility, and a restricted-category policy enforced in software. Frequency capping, geographic targeting, and contextual targeting by franchise or city bureau are available on our own inventory and can be exposed to platform demand.",
        },
      ]}
      specs={[
        { label: "Feed", value: "24/7 linear HLS (CMAF), H.264/AAC", note: "HEVC available on request" },
        { label: "Renditions", value: "6 renditions, 480p to 1080p, 8.4 Mb/s top" },
        { label: "Ad markers", value: "SCTE-35, in-band", note: "Break structure: 150s + 60s promo + 60s per half hour" },
        { label: "Ad standards", value: "VAST 4.2, VMAP, server-side insertion ready" },
        { label: "EPG", value: "XMLTV and JSON, 7 days forward", note: "GET /api/epg?format=xmltv" },
        { label: "Captions", value: "WebVTT on HLS; 608/708 on contribution", note: "Human-reviewed before air — AI drafts are blocked" },
        { label: "Ratings", value: "TV-14 typical, TV-MA late only, per-programme metadata" },
        { label: "Redundancy", value: "Primary and hot-standby encoders, automatic failover to slate" },
        { label: "VOD", value: "Episode library with start-over and catch-up where rights permit" },
        { label: "Platforms targeted", value: "Roku, Fire TV, Apple TV, Android TV, Samsung, LG, web" },
        { label: "Territory", value: "United States at launch; international via channel licensing" },
        { label: "Vendor posture", value: "Cloud playout via a third-party provider (Amagi or comparable)", note: "Abstracted behind an adapter so the vendor can be replaced" },
      ]}
      deliverables={[
        "24/7 linear feed, clean variant",
        "Seven-day EPG in XMLTV and JSON",
        "Platform-specific artwork and channel branding",
        "VOD library with per-title rights metadata",
        "Ad-policy documentation and restricted-category rules",
        "Monthly performance reporting",
      ]}
      openQuestions={[
        "No FAST distribution agreement is in place with any platform or aggregator.",
        "Cloud playout vendor is not yet contracted.",
        "Ad-sales representation on platform-sold inventory is unresolved.",
        "Music licensing for a public linear feed requires executed master, publishing, and public-performance agreements before launch.",
      ]}
    />
  );
}
