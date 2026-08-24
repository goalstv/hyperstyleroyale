# RAP TRENDS — Third-Party Dependencies

Everything requiring a vendor, licence, API, agreement, or human decision that software cannot
supply. Nothing on this list is contracted.

## 1. Music rights — the hard dependency

| Requirement | Counterparty | Blocks |
|---|---|---|
| Master recording licences | Labels, distributors, independent artists | Radio, linear, FAST, all carriage |
| Publishing agreements | Publishers, administrators | Every musical use |
| Public performance | ASCAP, BMI, SESAC, GMR | Broadcast, cable, radio carriage |
| Digital performance | SoundExchange | Internet radio, streaming |
| Music-video exhibition | Labels, video rights holders | Any video not network-produced |
| Synchronization | Publishers and labels | YouTube, social |
| Mechanical | Publishers, MLC | Podcast distribution |
| Chain of title on archival material | Original owners, estates | **RAP TRENDS CLASSICS cannot launch without it** |

No engineering decision reduces these. They are the largest cost line and the longest lead time in
the business.

## 2. Index data sources

Each contributes only once an agreement is executed. Until then the source stays
`pending_agreement`, contributes nothing, and lowers the published confidence figure.

| Signal | Source class | Status |
|---|---|---|
| Streaming velocity, playlist adds, engagement quality | Licensed DSP analytics | Not contracted |
| Video views and velocity | Video platform partner API | Not contracted |
| Radio airplay | Airplay monitoring service | Not contracted |
| Song identification | Identification partner | **Not contracted — excluded from every published score** |
| Search interest | Public trends index | Public source, usable |
| Social conversation | Social listening partner, authorized firehose | Not contracted |
| Short-form sound usage | Platform commercial API | Not contracted |
| Concert demand, ticket sales | Ticketing partner | Not contracted |
| Audience voting | First-party | Built |
| Editorial assessment | Internal | Built |

We do not scrape. Where an agreement is unavailable, the signal is excluded — visibly, on the public
methodology page.

## 3. Broadcast and delivery infrastructure

| Capability | Vendor class | Status |
|---|---|---|
| Cloud playout | Amagi or comparable | Adapter defined, not contracted |
| Broadcast encoding | Encoder vendor | Specified |
| Server-side ad insertion | SSAI platform | Markers in the feed, platform not selected |
| Broadcast contribution | Contribution provider | Design complete |
| CDN | CDN provider | Not contracted |
| Object storage | S3-compatible | Not provisioned |
| Satellite delivery | Transponder provider | Not contracted |
| Radio affiliate delivery | Delivery vendor | Not selected |

## 4. Distribution agreements

| Route | Counterparty | Status |
|---|---|---|
| FAST | Platforms and aggregators | No agreement |
| Connected TV | Roku, Fire TV, Apple TV, Android TV, Samsung, LG | Certification not begun |
| Cable / vMVPD | Operators | No agreement |
| Over-the-air | An FCC-licensed station | **No partnership. RAP TRENDS holds no licence or spectrum** |
| Radio | Station groups and independents | No agreement |
| Podcast | Directories | Not submitted |
| Internet radio | Directories | Not submitted |

## 5. Measurement

| Requirement | Provider | Status |
|---|---|---|
| Audience measurement | Nielsen or comparable | Obtained only where carriage justifies it |
| Radio ratings | Nielsen Audio | Same |
| Digital analytics | First-party | Built |

We do not claim ratings we have not bought.

## 6. Platform services

| Service | Purpose | Status |
|---|---|---|
| Postgres / Supabase | Persistence and auth | Not provisioned |
| Google Cloud | Drive ingestion | Not configured |
| AI transcription and captioning | Media prep | Not contracted |
| Email delivery | Transactional and newsletter | Not contracted |
| Push notifications | Mobile and web | Not configured |
| SMS | Critical alerts | Not contracted |
| Error tracking | Observability | Not configured |
| Payments | Memberships and artist plans | Not contracted |

## 7. Professional services — required before launch

| Discipline | Why | Status |
|---|---|---|
| Broadcast counsel | FCC obligations, carriage agreements, political advertising, the OTA partnership structure | **Required. Not engaged** |
| Music-licensing professionals | Every licence in section 1 | **Required. Not engaged** |
| Privacy counsel | Privacy policy, processor register, COPPA, state and international law | Required |
| Advertising counsel | Restricted-category rules per jurisdiction | Required |
| Accessibility audit | Independent WCAG 2.2 AA conformance | Required |
| Security assessment | Penetration test and review before handling real personal data | Required |
| Insurance broker | E&O, general liability, production insurance | Required |

## 8. Human agreements

| Agreement | With | Status |
|---|---|---|
| Talent contracts | Hosts, correspondents, producers | Not executed |
| Appearance releases | Every interview and performance subject | Process defined |
| Location releases | Venues and shoot locations | Process defined |
| Union agreements | Where performers, writers, or crew are covered | Not determined |
| Bureau agreements | Thirteen city correspondents | Not executed |
| Affiliate agreements | Stations and groups | Not executed |
| Advertiser insertion orders | Brands and agencies | Not executed |

## 9. What is genuinely built

To keep the contrast honest: the domain layer (Index scoring, rights gate, schedule validation, ad
safety, editorial workflow) with 155 passing tests; the public network site; RAP TRENDS OS with
role-based access; artist and affiliate portals; and a public API including a standards-compliant
EPG. All of it runs on a seeded demonstration dataset with no external dependency.

Everything on this page is what turns that into a network.
