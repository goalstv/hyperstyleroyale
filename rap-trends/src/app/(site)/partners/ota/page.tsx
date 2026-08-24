import type { Metadata } from "next";
import { PitchPage } from "@/components/pitch-page";

export const metadata: Metadata = {
  title: "Over-the-air television partnership",
  description: "Subchannel and daypart partnerships with FCC-licensed television stations.",
};

export default function OtaPitchPage() {
  return (
    <PitchPage
      track="Over-the-air television"
      title="Over-the-air partnership"
      phase="Phase 4"
      status={{ label: "Pilot sought — requires a licensed station partner", tone: "neutral" }}
      lede="RAP TRENDS does not hold spectrum and does not hold an FCC licence. Over-the-air distribution happens through a partnership with an existing licensed station — a subchannel, a daypart block, or syndicated programming inside the station's own schedule."
      sections={[
        {
          title: "The honest version of how this works",
          body: "A software platform cannot transmit over the air. Spectrum is licensed, licences are held by station owners, and the FCC regulates what happens on them. What RAP TRENDS brings to a licensed partner is programming, a national sales operation, and an origination system that produces a compliant feed. What the partner brings is the licence, the transmitter, and the market. Any claim beyond that would be misleading, and we will not make it.",
        },
        {
          title: "What a pilot looks like",
          body: "One influential market — Atlanta, New York, Los Angeles, Miami, or Houston. A subchannel or a fixed daypart block on an existing station. A twelve-month term with market exclusivity, barter terms, and a local sales arrangement that gives the station insertable inventory in every hour. We test local advertising, live events, interactive voting, and market-specific segments, and we publish what we learn.",
        },
        {
          title: "Local branding and market-specific content",
          body: "The affiliate can brand the block, insert approved local segments, run local advertising in the reserved avails, and take the CITY REPORT package for its own market. The origination system supports per-market feed variants, so a station is not carrying a generic national feed with its logo pasted on it.",
        },
        {
          title: "ATSC 3.0 and the interactive roadmap",
          body: "The launch requirement is ATSC 1.0 compatibility, because that is what receivers actually have. NEXTGEN TV is where the interesting part lives: broadband-connected interactive components, artist voting that feeds the Index, sponsor offers, and commerce running alongside the broadcast. We also track datacasting and mobile reception as a later-stage opportunity rather than a launch claim.",
        },
      ]}
      specs={[
        { label: "Transmission", value: "ATSC 1.0 compatible; ATSC 3.0 experience prepared" },
        { label: "Feed variant", value: "Clean feed only — explicit audio never rides a broadcast feed" },
        { label: "Delivery to station", value: "Secure IP delivery or satellite, station's preference" },
        { label: "Captions", value: "CEA-608/708, human-reviewed" },
        { label: "Ratings", value: "V-chip signalling on every programme" },
        { label: "Local insertion", value: "8–12 minutes per hour, plus local segment windows" },
        { label: "Station identification", value: "Top-of-hour clock accommodates station ID and legal ID" },
        { label: "Emergency override", value: "Station retains full override; master control supports slate and cutaway" },
        { label: "Reporting", value: "Monthly affidavits and local-insertion reporting through the affiliate portal" },
        { label: "Interactive (ATSC 3.0)", value: "Voting, sponsor offers, commerce via broadband return path", note: "Roadmap, not launch" },
      ]}
      deliverables={[
        "Clean 24/7 feed or daypart block",
        "Local branding and insertion windows",
        "Market-specific CITY REPORT package",
        "Promotional assets and on-air furniture",
        "Technical specification and acceptance testing",
        "Market exclusivity for the term",
      ]}
      openQuestions={[
        "No station partnership exists in any market.",
        "RAP TRENDS holds no FCC licence and no spectrum, and will not represent otherwise.",
        "Station-side regulatory obligations — political file, EEO, children's programming, EAS — remain the licensee's, and the partnership structure must reflect that.",
        "Broadcast counsel must approve the operating model, the programming agreement, and the advertising policy before any transmission.",
        "ATSC 3.0 interactive components depend on the partner station's NEXTGEN TV deployment timeline.",
      ]}
      ctaLabel="Discuss a pilot"
    />
  );
}
