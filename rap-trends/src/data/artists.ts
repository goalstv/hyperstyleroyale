import type { Artist } from "@/lib/types";

/**
 * DEMONSTRATION ARTISTS.
 *
 * Every artist below is fictional and exists only to exercise the product. No
 * real person, recording, likeness, or endorsement is represented. Signal values
 * are synthetic inputs for the Index engine, not observed platform measurements.
 */
const demo = {
  provenance: "demo",
  provenanceNote: "Fictional artist created for demonstration. Not a real person or act.",
} as const;

export const ARTISTS: Artist[] = [
  {
    ...demo, id: "art_01", slug: "sable-mercer", name: "Sable Mercer", city: "Atlanta", cityId: "atl",
    region: "South", tier: "established", verified: true, labelType: "major", formedYear: 2016,
    bio: "Atlanta vocalist and writer whose third album moved the city's melodic register toward live instrumentation. Demonstration profile.",
    tags: ["melodic", "atlanta", "album artist"], nextUp: false, monthlyListenersBand: "5M–10M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_sablemercer" }, { platform: "YouTube", handle: "@demo_sablemercer" }],
    signals: { streaming_velocity: 88, video_views: 82, video_view_velocity: 74, radio_airplay: 79, shazam: 71, search_interest: 76, social_conversation: 80, short_form_usage: 84, playlist_adds: 81, concert_demand: 72, ticket_sales: 68, audience_vote: 74, editorial_assessment: 85, geographic_momentum: 62, engagement_quality: 78 },
  },
  {
    ...demo, id: "art_02", slug: "kp-verse", name: "KP Verse", city: "Detroit", cityId: "det",
    region: "Midwest", tier: "rising", verified: true, labelType: "indie_label", formedYear: 2019,
    bio: "Detroit technician whose breath control and pocket have made him the most-cited reference point among younger writers in the city. Demonstration profile.",
    tags: ["detroit", "lyricist", "producer-led"], nextUp: true, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_kpverse" }],
    signals: { streaming_velocity: 74, video_views: 61, video_view_velocity: 83, radio_airplay: 42, shazam: 58, search_interest: 69, social_conversation: 77, short_form_usage: 88, playlist_adds: 70, concert_demand: 55, ticket_sales: 47, audience_vote: 81, editorial_assessment: 88, geographic_momentum: 79, engagement_quality: 72 },
  },
  {
    ...demo, id: "art_03", slug: "nia-oduya", name: "Nia Oduya", city: "Lagos", cityId: "lag",
    region: "Africa", tier: "rising", verified: true, labelType: "indie_label", formedYear: 2020,
    bio: "Lagos rapper working between Afro-rap and alté, and one of the clearest examples of the Lagos-to-Atlanta pipeline the network tracks. Demonstration profile.",
    tags: ["lagos", "afro-rap", "international"], nextUp: true, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_niaoduya" }, { platform: "TikTok", handle: "@demo_niaoduya" }],
    signals: { streaming_velocity: 81, video_views: 76, video_view_velocity: 89, radio_airplay: 34, shazam: 74, search_interest: 72, social_conversation: 84, short_form_usage: 92, playlist_adds: 78, concert_demand: 61, ticket_sales: 52, audience_vote: 79, editorial_assessment: 82, geographic_momentum: 91, engagement_quality: 75 },
  },
  {
    ...demo, id: "art_04", slug: "cash-tyrell", name: "Cash Tyrell", city: "Houston", cityId: "hou",
    region: "South", tier: "established", verified: true, labelType: "independent", formedYear: 2012,
    bio: "Houston independent who has never signed a distribution deal longer than eighteen months and owns his catalogue outright. A recurring subject on THE BUSINESS. Demonstration profile.",
    tags: ["houston", "independent", "catalogue owner"], nextUp: false, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_cashtyrell" }],
    signals: { streaming_velocity: 66, video_views: 58, video_view_velocity: 51, radio_airplay: 71, shazam: 49, search_interest: 55, social_conversation: 60, short_form_usage: 47, playlist_adds: 59, concert_demand: 78, ticket_sales: 82, audience_vote: 63, editorial_assessment: 79, geographic_momentum: 48, engagement_quality: 81 },
  },
  {
    ...demo, id: "art_05", slug: "lux-armand", name: "Lux Armand", city: "New York", cityId: "nyc",
    region: "Northeast", tier: "established", verified: true, labelType: "major", formedYear: 2014,
    bio: "New York writer whose live show turned a mixtape career into an arena one. Demonstration profile.",
    tags: ["new york", "live show", "album artist"], nextUp: false, monthlyListenersBand: "5M–10M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_luxarmand" }],
    signals: { streaming_velocity: 79, video_views: 84, video_view_velocity: 62, radio_airplay: 83, shazam: 68, search_interest: 74, social_conversation: 71, short_form_usage: 63, playlist_adds: 77, concert_demand: 88, ticket_sales: 91, audience_vote: 70, editorial_assessment: 80, geographic_momentum: 54, engagement_quality: 83 },
  },
  {
    ...demo, id: "art_06", slug: "trilla-may", name: "Trilla May", city: "Memphis", cityId: "mem",
    region: "South", tier: "rising", verified: true, labelType: "independent", formedYear: 2021,
    bio: "Memphis artist whose tape-culture production choices have travelled far past the city. Demonstration profile.",
    tags: ["memphis", "street rap", "tape culture"], nextUp: true, monthlyListenersBand: "500K–1M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_trillamay" }],
    signals: { streaming_velocity: 71, video_views: 54, video_view_velocity: 78, radio_airplay: 28, shazam: 61, search_interest: 58, social_conversation: 73, short_form_usage: 86, playlist_adds: 62, concert_demand: 44, ticket_sales: 38, audience_vote: 76, editorial_assessment: 77, geographic_momentum: 84, engagement_quality: 66 },
  },
  {
    ...demo, id: "art_07", slug: "dane-castille", name: "Dane Castille", city: "New Orleans", cityId: "nola",
    region: "South", tier: "rising", verified: false, labelType: "independent", formedYear: 2022,
    bio: "New Orleans performer bridging bounce tempo and contemporary street rap. Demonstration profile.",
    tags: ["new orleans", "bounce", "performer"], nextUp: true, monthlyListenersBand: "100K–500K (demo band)",
    socials: [{ platform: "TikTok", handle: "@demo_danecastille" }],
    signals: { streaming_velocity: 58, video_views: 41, video_view_velocity: 72, radio_airplay: 19, shazam: 44, search_interest: 46, social_conversation: 64, short_form_usage: 81, playlist_adds: 48, concert_demand: 51, ticket_sales: 33, audience_vote: 68, editorial_assessment: 73, geographic_momentum: 77, engagement_quality: 59 },
  },
  {
    ...demo, id: "art_08", slug: "ivory-lane", name: "Ivory Lane", city: "Los Angeles", cityId: "la",
    region: "West", tier: "established", verified: true, labelType: "major", formedYear: 2015,
    bio: "Los Angeles artist and creative director whose visual work is studied as closely as her records. Demonstration profile.",
    tags: ["los angeles", "visual", "album artist"], nextUp: false, monthlyListenersBand: "5M–10M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_ivorylane" }],
    signals: { streaming_velocity: 84, video_views: 91, video_view_velocity: 79, radio_airplay: 72, shazam: 77, search_interest: 81, social_conversation: 86, short_form_usage: 76, playlist_adds: 83, concert_demand: 74, ticket_sales: 71, audience_vote: 77, editorial_assessment: 83, geographic_momentum: 58, engagement_quality: 80 },
  },
  {
    ...demo, id: "art_09", slug: "brixton-ade", name: "Brixton Ade", city: "London", cityId: "ldn",
    region: "Europe", tier: "rising", verified: true, labelType: "indie_label", formedYear: 2018,
    bio: "South London writer working across UK rap and jazz-informed production. Demonstration profile.",
    tags: ["london", "uk rap", "jazz"], nextUp: false, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_brixtonade" }],
    signals: { streaming_velocity: 69, video_views: 63, video_view_velocity: 66, radio_airplay: 57, shazam: 55, search_interest: 61, social_conversation: 67, short_form_usage: 59, playlist_adds: 71, concert_demand: 64, ticket_sales: 58, audience_vote: 62, editorial_assessment: 81, geographic_momentum: 66, engagement_quality: 74 },
  },
  {
    ...demo, id: "art_10", slug: "quan-delacroix", name: "Quan Delacroix", city: "Chicago", cityId: "chi",
    region: "Midwest", tier: "established", verified: true, labelType: "indie_label", formedYear: 2013,
    bio: "Chicago writer whose records sit between the city's two dominant traditions and belong to neither. Demonstration profile.",
    tags: ["chicago", "lyricist", "live band"], nextUp: false, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_quandelacroix" }],
    signals: { streaming_velocity: 63, video_views: 57, video_view_velocity: 49, radio_airplay: 66, shazam: 47, search_interest: 53, social_conversation: 58, short_form_usage: 44, playlist_adds: 64, concert_demand: 69, ticket_sales: 66, audience_vote: 57, editorial_assessment: 84, geographic_momentum: 45, engagement_quality: 79 },
  },
  {
    ...demo, id: "art_11", slug: "amara-veil", name: "Amara Veil", city: "Toronto", cityId: "tor",
    region: "North America", tier: "rising", verified: true, labelType: "independent", formedYear: 2021,
    bio: "Toronto vocalist and rapper whose Caribbean-inflected melodic writing has travelled south quickly. Demonstration profile.",
    tags: ["toronto", "melodic", "caribbean"], nextUp: true, monthlyListenersBand: "500K–1M (demo band)",
    socials: [{ platform: "TikTok", handle: "@demo_amaraveil" }],
    signals: { streaming_velocity: 76, video_views: 68, video_view_velocity: 81, radio_airplay: 38, shazam: 66, search_interest: 64, social_conversation: 75, short_form_usage: 87, playlist_adds: 73, concert_demand: 49, ticket_sales: 41, audience_vote: 78, editorial_assessment: 76, geographic_momentum: 72, engagement_quality: 69 },
  },
  {
    ...demo, id: "art_12", slug: "grand-mecca", name: "Grand Mecca", city: "New York", cityId: "nyc",
    region: "Northeast", tier: "established", verified: true, labelType: "independent", formedYear: 2009,
    bio: "Veteran New York writer and ARCHIVE fixture whose catalogue conversations anchor the network's historical programming. Demonstration profile.",
    tags: ["new york", "veteran", "archive"], nextUp: false, monthlyListenersBand: "500K–1M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_grandmecca" }],
    signals: { streaming_velocity: 41, video_views: 38, video_view_velocity: 29, radio_airplay: 52, shazam: 26, search_interest: 44, social_conversation: 47, short_form_usage: 22, playlist_adds: 39, concert_demand: 58, ticket_sales: 61, audience_vote: 43, editorial_assessment: 86, geographic_momentum: 31, engagement_quality: 77 },
  },
  {
    ...demo, id: "art_13", slug: "solae-brooks", name: "Solae Brooks", city: "Atlanta", cityId: "atl",
    region: "South", tier: "rising", verified: true, labelType: "indie_label", formedYear: 2020,
    bio: "Atlanta writer whose NEXT UP appearance moved her from regional to national rotation. Demonstration profile.",
    tags: ["atlanta", "next up", "melodic"], nextUp: true, monthlyListenersBand: "500K–1M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_solaebrooks" }],
    signals: { streaming_velocity: 78, video_views: 66, video_view_velocity: 84, radio_airplay: 44, shazam: 69, search_interest: 67, social_conversation: 76, short_form_usage: 83, playlist_adds: 74, concert_demand: 52, ticket_sales: 45, audience_vote: 82, editorial_assessment: 79, geographic_momentum: 74, engagement_quality: 71 },
  },
  {
    ...demo, id: "art_14", slug: "prod-mainframe", name: "Mainframe", city: "Los Angeles", cityId: "la",
    region: "West", tier: "established", verified: true, labelType: "independent", formedYear: 2011,
    bio: "Producer and BARS regular whose breakdowns of his own sessions are among the network's most-watched segments. Demonstration profile.",
    tags: ["producer", "los angeles", "bars"], nextUp: false, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "YouTube", handle: "@demo_mainframe" }],
    signals: { streaming_velocity: 57, video_views: 74, video_view_velocity: 61, radio_airplay: 33, shazam: 31, search_interest: 58, social_conversation: 63, short_form_usage: 69, playlist_adds: 51, concert_demand: 37, ticket_sales: 29, audience_vote: 59, editorial_assessment: 82, geographic_momentum: 42, engagement_quality: 76 },
  },
  {
    ...demo, id: "art_15", slug: "zeta-royale", name: "Zeta Royale", city: "Miami", cityId: "mia",
    region: "South", tier: "rising", verified: true, labelType: "independent", formedYear: 2022,
    bio: "Miami artist whose club-first release strategy is the clearest current example of nightlife driving national streaming. Demonstration profile.",
    tags: ["miami", "club", "nightlife"], nextUp: true, monthlyListenersBand: "500K–1M (demo band)",
    socials: [{ platform: "TikTok", handle: "@demo_zetaroyale" }],
    signals: { streaming_velocity: 83, video_views: 59, video_view_velocity: 88, radio_airplay: 31, shazam: 78, search_interest: 63, social_conversation: 71, short_form_usage: 91, playlist_adds: 68, concert_demand: 57, ticket_sales: 43, audience_vote: 74, editorial_assessment: 68, geographic_momentum: 89, engagement_quality: 30 },
  },
  {
    ...demo, id: "art_16", slug: "obi-strand", name: "Obi Strand", city: "Johannesburg", cityId: "jnb",
    region: "Africa", tier: "rising", verified: false, labelType: "independent", formedYear: 2021,
    bio: "Johannesburg rapper working over amapiano tempos, and a live illustration of the dance-to-rap conversion the Index tracks. Demonstration profile.",
    tags: ["johannesburg", "amapiano", "international"], nextUp: true, monthlyListenersBand: "100K–500K (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_obistrand" }],
    signals: { streaming_velocity: 64, video_views: 48, video_view_velocity: 76, radio_airplay: 22, shazam: 51, search_interest: 49, social_conversation: 66, short_form_usage: 79, playlist_adds: 57, concert_demand: 46, ticket_sales: 31, audience_vote: 65, editorial_assessment: 74, geographic_momentum: 86, engagement_quality: 62 },
  },
  {
    ...demo, id: "art_17", slug: "vega-monroe", name: "Vega Monroe", city: "Chicago", cityId: "chi",
    region: "Midwest", tier: "independent", verified: false, labelType: "independent", formedYear: 2023,
    bio: "Chicago newcomer who arrived through the RAP TRENDS submission portal and cleared editorial review on the strength of the writing. Demonstration profile.",
    tags: ["chicago", "submission", "next up"], nextUp: true, monthlyListenersBand: "Under 100K (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_vegamonroe" }],
    signals: { streaming_velocity: 44, video_views: 27, video_view_velocity: 63, radio_airplay: 8, shazam: 29, search_interest: 33, social_conversation: 52, short_form_usage: 71, playlist_adds: 38, concert_demand: 27, ticket_sales: 14, audience_vote: 71, editorial_assessment: 80, geographic_momentum: 64, engagement_quality: 58 },
  },
  {
    ...demo, id: "art_18", slug: "north-pierre", name: "North Pierre", city: "Detroit", cityId: "det",
    region: "Midwest", tier: "independent", verified: false, labelType: "independent", formedYear: 2023,
    bio: "Detroit writer with a small catalogue and an unusually high repeat-listen rate. Demonstration profile.",
    tags: ["detroit", "independent", "next up"], nextUp: true, monthlyListenersBand: "Under 100K (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_northpierre" }],
    signals: { streaming_velocity: 39, video_views: 24, video_view_velocity: 57, radio_airplay: 6, shazam: 24, search_interest: 29, social_conversation: 44, short_form_usage: 62, playlist_adds: 33, concert_demand: 22, ticket_sales: 11, audience_vote: 66, editorial_assessment: 78, geographic_momentum: 58, engagement_quality: 71 },
  },
  {
    ...demo, id: "art_19", slug: "saint-cassia", name: "Saint Cassia", city: "Miami", cityId: "mia",
    region: "South", tier: "rising", verified: true, labelType: "indie_label", formedYear: 2019,
    bio: "Miami artist working across Spanish and English on the same records. Demonstration profile.",
    tags: ["miami", "bilingual", "latin trap"], nextUp: false, monthlyListenersBand: "1M–5M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_saintcassia" }],
    signals: { streaming_velocity: 72, video_views: 69, video_view_velocity: 64, radio_airplay: 61, shazam: 67, search_interest: 62, social_conversation: 68, short_form_usage: 72, playlist_adds: 76, concert_demand: 63, ticket_sales: 59, audience_vote: 66, editorial_assessment: 75, geographic_momentum: 61, engagement_quality: 73 },
  },
  {
    ...demo, id: "art_20", slug: "hollow-park", name: "Hollow Park", city: "Los Angeles", cityId: "la",
    region: "West", tier: "rising", verified: true, labelType: "independent", formedYear: 2020,
    bio: "Los Angeles duo working in alternative rap with a live band and a deliberately slow release cadence. Demonstration profile.",
    tags: ["los angeles", "alternative", "live band"], nextUp: false, monthlyListenersBand: "500K–1M (demo band)",
    socials: [{ platform: "Instagram", handle: "@demo_hollowpark" }],
    signals: { streaming_velocity: 54, video_views: 46, video_view_velocity: 42, radio_airplay: 24, shazam: 33, search_interest: 47, social_conversation: 55, short_form_usage: 51, playlist_adds: 61, concert_demand: 58, ticket_sales: 54, audience_vote: 52, editorial_assessment: 81, geographic_momentum: 39, engagement_quality: 82 },
  },
];

export const ARTIST_BY_ID = new Map(ARTISTS.map((a) => [a.id, a]));
export const ARTIST_BY_SLUG = new Map(ARTISTS.map((a) => [a.slug, a]));
export const NEXT_UP_ARTISTS = ARTISTS.filter((a) => a.nextUp);
