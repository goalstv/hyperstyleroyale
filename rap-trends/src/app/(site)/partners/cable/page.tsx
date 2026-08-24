import type { Metadata } from "next";
import { PitchPage } from "@/components/pitch-page";

export const metadata: Metadata = {
  title: "Cable & vMVPD carriage",
  description: "Broadcast-grade linear origination for cable operators and virtual MVPDs.",
};

export default function CablePitchPage() {
  return (
    <PitchPage
      track="Cable & virtual MVPD"
      title="Cable and vMVPD carriage"
      phase="Phase 5"
      status={{ label: "Prospect — requires negotiated carriage", tone: "neutral" }}
      lede="A broadcast-grade linear feed with redundant contribution paths, compliant captions and ratings, ad cue signalling, and a national feed with local insertion opportunities for operators who want them."
      sections={[
        {
          title: "What we are asking for, and what we are not",
          body: "Carriage is a negotiated commercial agreement. Nothing about this product secures it, and we do not represent that any operator has agreed to carry the network. What we can demonstrate today is that the origination side is genuinely ready: the schedule is built and validated seven days out, the rights gate blocks anything that would create a compliance problem, and the feed carries the metadata an operator's systems expect.",
        },
        {
          title: "The programming case",
          body: "Hip-hop is the most commercially significant genre in American music and has no dedicated, editorially credible linear channel. The audience that supports it is the demographic operators lose fastest. RAP TRENDS is programmed as a news-and-music network rather than a video jukebox — a daily flagship, a daily countdown, original performance production, and thirteen city bureaus — which is what produces appointment viewing and, with it, carriage value.",
        },
        {
          title: "Compliance posture",
          body: "Closed captions on every programme, human-reviewed before air. Content ratings on every asset with V-chip signalling. A restricted-advertising policy enforced in software. An emergency override path in master control. The obligations that come with MVPD carriage are handled as engineering requirements rather than as paperwork applied afterwards.",
        },
        {
          title: "Local insertion",
          body: "The national feed reserves eight to twelve minutes an hour of insertable inventory. Operators and affiliates can place local advertising into those windows and report insertions through the affiliate portal, which reconciles against our own delivery logs.",
        },
      ]}
      specs={[
        { label: "Contribution", value: "Redundant IP contribution, primary and backup paths, diverse routing" },
        { label: "Video", value: "1080i/59.94 or 1080p/59.94, broadcast-legal levels" },
        { label: "Audio", value: "Stereo, -24 LKFS, CALM Act compliant loudness" },
        { label: "Captions", value: "CEA-608/708, human-reviewed, carried without re-encode" },
        { label: "Ratings", value: "V-chip content ratings, per-programme, in VBI/ancillary data" },
        { label: "Ad signalling", value: "SCTE-35 / SCTE-104 cue insertion at every break" },
        { label: "EPG metadata", value: "Seven days forward, standard interchange format" },
        { label: "Local avails", value: "8–12 minutes per hour reserved for insertion" },
        { label: "Feed variant", value: "Clean feed only" },
        { label: "Monitoring", value: "Affiliate compliance reporting and stream-health alerting" },
      ]}
      deliverables={[
        "Broadcast-grade national linear feed",
        "Redundant contribution paths",
        "EPG metadata and programme descriptions",
        "Local avail schedule and insertion reporting",
        "Technical specification and acceptance test material",
        "Monthly compliance and performance reporting",
      ]}
      openQuestions={[
        "No carriage agreement exists with any cable operator or virtual MVPD.",
        "Subscriber or licence fees are unproven for a channel at this stage and are not assumed in the business model.",
        "Nielsen-compatible measurement will be obtained only where carriage commercially justifies it.",
        "Music licensing for MVPD carriage requires separately negotiated public-performance and exhibition rights.",
        "Broadcast counsel must review the full operating model before any carriage is executed.",
      ]}
    />
  );
}
