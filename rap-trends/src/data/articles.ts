import type { Article } from "@/lib/types";
import { daysAgoIso, daysAheadIso, minutesAgoIso } from "@/lib/clock";

/**
 * DEMONSTRATION EDITORIAL.
 *
 * Every story below concerns fictional artists and fictional events. No real
 * quote, statistic, chart position, or news event is represented. Stories are
 * distributed across the workflow so the newsroom console shows a realistic
 * queue rather than ten finished pieces.
 */
const demo = {
  provenance: "demo",
  provenanceNote: "Demonstration story about fictional artists. Not reporting on real events.",
} as const;

export const ARTICLES: Article[] = [
  {
    ...demo, id: "art_a01", slug: "detroit-tempo-shift", headline: "Detroit is exporting its tempo again — and the rest of the format is following",
    dek: "KP Verse's third tape has pushed a Detroit-specific pocket into rooms from Atlanta to Lagos. Producers explain what actually changed.",
    state: "published", authorId: "usr_03", authorName: "Rahman", editorId: "usr_02",
    pillar: "CITY REPORT", cityIds: ["det", "atl"], artistIds: ["art_02", "art_18"],
    tags: ["detroit", "production", "regional"], breaking: false, readMinutes: 7,
    seo: { title: "Detroit's tempo shift is spreading across rap", description: "How a Detroit-specific pocket became a national production reference." },
    socialCopy: "Detroit's pocket is the reference point again. Producers break down what changed. 🎧",
    pushCopy: "Detroit is exporting its tempo again. Read the CITY REPORT.",
    sources: [
      { label: "Interview — KP Verse, Detroit, conducted in person", verifiedBy: "usr_02" },
      { label: "Interview — three producers, on the record", verifiedBy: "usr_02" },
    ],
    factCheck: { status: "cleared", checkedBy: "usr_02", notes: "All quotes verified against recordings. Release dates confirmed with distributor." },
    publishedIso: daysAgoIso(1), relatedAssetIds: ["asset_int_01"],
    corrections: [],
    body: `Something in Detroit's rhythmic vocabulary has travelled.\n\nFor most of the last decade, the city's most distinctive quality was the writing — the density, the internal rhyme, the refusal to leave space. What is moving now is the pocket underneath it.\n\nThis is a demonstration article written to exercise the RAP TRENDS newsroom. The artists, quotes, and events described here are fictional.\n\nThree producers, all working out of the same east-side building, describe the same change: a swing that sits fractionally behind where a trap record would place it, and a bass line that answers the vocal rather than carrying it.\n\n"You can hear when somebody is copying it and hasn't lived with it," KP Verse said. "The gap is the whole thing."\n\nThe Index has tracked the spread through geographic momentum rather than raw volume — the signal that measures how many distinct markets a sound reaches rather than how loud it is in one.`,
  },
  {
    ...demo, id: "art_a02", slug: "independent-ownership-math", headline: "The independent ownership math has changed, and most artists have not noticed",
    dek: "Distribution advances are cheaper than they were three years ago. THE BUSINESS walks through what that does to a catalogue's long-term value.",
    state: "published", authorId: "usr_03", authorName: "Rahman", editorId: "usr_02",
    pillar: "THE BUSINESS", cityIds: ["hou"], artistIds: ["art_04"],
    tags: ["ownership", "distribution", "business"], breaking: false, readMinutes: 9,
    seo: { title: "The new math of independent catalogue ownership", description: "What cheaper distribution advances do to long-term catalogue value." },
    socialCopy: "Cheaper advances change the ownership math. Here's how.",
    pushCopy: "THE BUSINESS: the independent ownership math just changed.",
    sources: [{ label: "Interview — Cash Tyrell", verifiedBy: "usr_02" }, { label: "Two distribution executives, background" }],
    factCheck: { status: "cleared", checkedBy: "usr_02" },
    publishedIso: daysAgoIso(3), relatedAssetIds: [], corrections: [],
    body: `A demonstration article for THE BUSINESS.\n\nAn advance is a loan against your own future income, and the interest is denominated in ownership. When advances get cheaper, the correct amount to take goes down, not up.\n\nCash Tyrell has never signed a distribution agreement longer than eighteen months. "Every deal is a bet on what you'll be worth at the end of it," he said. "Short deals mean I get to re-price myself."\n\nThe figures used in this demonstration story are illustrative.`,
  },
  {
    ...demo, id: "art_a03", slug: "lagos-atlanta-pipeline", headline: "The Lagos-to-Atlanta pipeline is now running in both directions",
    dek: "Nia Oduya's session logs show something the charts have not caught up to yet.",
    state: "published", authorId: "usr_12", authorName: "Lagos Contributor", editorId: "usr_02",
    pillar: "CITY REPORT", cityIds: ["lag", "atl"], artistIds: ["art_03"],
    tags: ["lagos", "international", "afro-rap"], breaking: false, readMinutes: 6,
    seo: { title: "Lagos and Atlanta are trading in both directions", description: "The Afro-rap exchange has stopped being one-way." },
    socialCopy: "Lagos ↔ Atlanta. The exchange goes both ways now.",
    pushCopy: "CITY REPORT: the Lagos–Atlanta pipeline runs both ways.",
    sources: [{ label: "Interview — Nia Oduya, Lagos", verifiedBy: "usr_02" }],
    factCheck: { status: "cleared", checkedBy: "usr_02" },
    publishedIso: daysAgoIso(4), relatedAssetIds: ["asset_short_01"], corrections: [],
    body: `Demonstration CITY REPORT filed from Lagos.\n\nFor five years the traffic was one way. That is no longer true, and the session credits are the clearest evidence.`,
  },
  {
    ...demo, id: "art_a04", slug: "short-form-usage-signal", headline: "Why RAP TRENDS weights sound usage instead of video views",
    dek: "A methodology note: creation counts are harder to buy than view counts, and they predict radio adds better.",
    state: "published", authorId: "usr_02", authorName: "Editor-in-Chief", editorId: "usr_02",
    pillar: "TRENDING 10", cityIds: [], artistIds: [],
    tags: ["methodology", "index", "data"], breaking: false, readMinutes: 5,
    seo: { title: "Why the Index weights sound usage over views", description: "A methodology note on short-form signals." },
    socialCopy: "Creations, not views. Here's why the Index is built that way.",
    pushCopy: "Methodology: why we weight sound usage over views.",
    sources: [{ label: "RAP TRENDS Index methodology, v3", url: "/trending/methodology", verifiedBy: "usr_02" }],
    factCheck: { status: "cleared", checkedBy: "usr_02" },
    publishedIso: daysAgoIso(6), relatedAssetIds: [], corrections: [
      { iso: daysAgoIso(5), note: "An earlier version described the short-form weight as 12%. The published weight in profile v3 is 10%." },
    ],
    body: `Demonstration methodology note.\n\nA view is a passive event. A creation is a decision. The second is more expensive to manufacture at scale, which makes it a better signal — not a perfect one.`,
  },
  {
    ...demo, id: "art_a05", slug: "memphis-tape-archive", headline: "The Memphis tape archive is being digitised — and the rights are a mess",
    dek: "Thousands of hours of regionally traded tapes have no clear chain of title. ARCHIVE looks at what it takes to clear one.",
    state: "published", authorId: "usr_03", authorName: "Rahman", editorId: "usr_02",
    pillar: "ARCHIVE", cityIds: ["mem"], artistIds: ["art_06"],
    tags: ["memphis", "archive", "rights"], breaking: false, readMinutes: 11,
    seo: { title: "Digitising the Memphis tape archive", description: "Chain of title is the hard part of archival hip-hop." },
    socialCopy: "The tapes exist. The paperwork doesn't.",
    pushCopy: "ARCHIVE: inside the Memphis tape digitisation effort.",
    sources: [{ label: "Interview — two archivists", verifiedBy: "usr_02" }, { label: "Rights counsel, background" }],
    factCheck: { status: "cleared", checkedBy: "usr_02" },
    publishedIso: daysAgoIso(8), relatedAssetIds: [], corrections: [],
    body: `Demonstration ARCHIVE feature.\n\nRAP TRENDS will not exhibit archival material without a documented chain of title. That position costs us programming, and it is not negotiable.`,
  },
  {
    ...demo, id: "art_a06", slug: "zeta-royale-flag", headline: "A charting record is carrying an open manipulation flag. Here is what that means",
    dek: "Transparency note on this week's TRENDING 10 and the review now under way.",
    state: "published", authorId: "usr_02", authorName: "Editor-in-Chief", editorId: "usr_02",
    pillar: "TRENDING 10", cityIds: ["mia"], artistIds: ["art_15"],
    tags: ["index", "transparency", "miami"], breaking: false, readMinutes: 4,
    seo: { title: "Transparency note: an open flag on this week's chart", description: "What a manipulation flag on the RAP TRENDS Index means." },
    socialCopy: "There's an open flag on this week's chart. We're showing our work.",
    pushCopy: "Transparency note on this week's TRENDING 10.",
    sources: [{ label: "RAP TRENDS Index audit log", verifiedBy: "usr_02" }],
    factCheck: { status: "cleared", checkedBy: "usr_02" },
    publishedIso: minutesAgoIso(300), relatedAssetIds: [], corrections: [],
    body: `Demonstration transparency note.\n\nA flag is not an accusation. It is a statement that the evidence pattern is unusual and that a human is looking at it. The record stays on the chart, the flag stays visible, and the editorial adjustment is logged with a name against it.`,
  },
  {
    ...demo, id: "art_a07", slug: "sessions-hollow-park", headline: "Hollow Park brought a nine-piece band to RAP TRENDS SESSIONS",
    dek: "The full set, and a conversation about why the duo release two records a year at most.",
    state: "scheduled", authorId: "usr_04", authorName: "Video Producer", editorId: "usr_02",
    pillar: "RAP TRENDS SESSIONS", cityIds: ["la"], artistIds: ["art_20"],
    tags: ["sessions", "performance", "los angeles"], breaking: false, readMinutes: 5,
    seo: { title: "Hollow Park on RAP TRENDS SESSIONS", description: "A nine-piece band, one room, no playback." },
    socialCopy: "Nine pieces. One room. No playback. 🎬",
    pushCopy: "New SESSIONS: Hollow Park, full set.",
    sources: [{ label: "Session recording, RAP TRENDS Studios", verifiedBy: "usr_02" }],
    factCheck: { status: "cleared", checkedBy: "usr_02" },
    scheduledIso: daysAheadIso(1), relatedAssetIds: ["asset_perf_01"], corrections: [],
    body: `Demonstration SESSIONS write-up, scheduled for publication alongside the episode premiere.`,
  },
  {
    ...demo, id: "art_a08", slug: "next-up-selection-process", headline: "How NEXT UP actually picks artists",
    dek: "Editorial review, verified performance data, and a written rule that placement is never for sale.",
    state: "fact_check", authorId: "usr_03", authorName: "Rahman", editorId: "usr_02",
    pillar: "NEXT UP", cityIds: ["chi", "det"], artistIds: ["art_17", "art_18"],
    tags: ["next up", "editorial", "process"], breaking: false, readMinutes: 6,
    seo: { title: "How NEXT UP picks artists", description: "The selection process, written down." },
    socialCopy: "How NEXT UP picks artists — the process, in writing.",
    pushCopy: "How NEXT UP actually picks artists.",
    sources: [{ label: "NEXT UP editorial charter" }, { label: "Interview — two selection-panel editors" }],
    factCheck: { status: "in_progress", checkedBy: "usr_02", notes: "Awaiting confirmation of panel composition from the editorial charter." },
    relatedAssetIds: [], corrections: [],
    body: `Demonstration process piece, currently in fact check.`,
  },
  {
    ...demo, id: "art_a09", slug: "club-to-chart-miami", headline: "Miami's club circuit is still the fastest chart on-ramp in America",
    dek: "Four weeks from a Wynwood DJ pool to national streaming rotation, traced record by record.",
    state: "editing", authorId: "usr_03", authorName: "Rahman", editorId: "usr_02",
    pillar: "CITY REPORT", cityIds: ["mia"], artistIds: ["art_15", "art_19"],
    tags: ["miami", "club", "nightlife"], breaking: false, readMinutes: 8,
    seo: { title: "Miami's club circuit as a chart on-ramp", description: "Four weeks from DJ pool to national rotation." },
    socialCopy: "Four weeks from the club to the chart. Miami, traced.",
    pushCopy: "CITY REPORT: Miami's club-to-chart pipeline.",
    sources: [{ label: "Interviews — five DJs, on the record" }],
    factCheck: { status: "not_started" },
    relatedAssetIds: [], corrections: [],
    body: `Demonstration CITY REPORT draft, currently with the editor.`,
  },
  {
    ...demo, id: "art_a10", slug: "amapiano-tempo-conversion", headline: "Amapiano changed rap's tempo. Johannesburg is where the conversion happens",
    dek: "A bureau assignment on the dance-to-rap crossover the Index has been tracking for eleven months.",
    state: "assigned", authorId: "usr_12", authorName: "Lagos Contributor", editorId: "usr_02",
    pillar: "CITY REPORT", cityIds: ["jnb"], artistIds: ["art_16"],
    tags: ["johannesburg", "amapiano", "international"], breaking: false, readMinutes: 0,
    seo: { title: "", description: "" },
    socialCopy: "", pushCopy: "",
    sources: [], factCheck: { status: "not_started" },
    relatedAssetIds: [], corrections: [],
    body: `Assignment brief: travel to Johannesburg, report the amapiano-to-rap tempo conversion from the studios doing it. Two weeks. Demonstration record.`,
  },
];

export const ARTICLE_BY_ID = new Map(ARTICLES.map((a) => [a.id, a]));
export const ARTICLE_BY_SLUG = new Map(ARTICLES.map((a) => [a.slug, a]));
export const PUBLISHED_ARTICLES = ARTICLES.filter((a) => a.state === "published" || a.state === "updated")
  .sort((a, b) => Date.parse(b.publishedIso ?? "0") - Date.parse(a.publishedIso ?? "0"));
