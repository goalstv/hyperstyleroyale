-- =============================================================================
-- RAP TRENDS — PostgreSQL schema
--
-- Targets Postgres 15+ / Supabase. Mirrors the TypeScript domain model in
-- src/lib/types.ts. Written so the demo adapter in src/lib/repo.ts can be
-- swapped for real queries without any call site changing.
--
-- Conventions
--   * Every table carries created_at / updated_at.
--   * Anything that can reach a screen carries a provenance column, so the UI
--     can never present demonstration data as verified live data.
--   * History tables are append-only and have no UPDATE or DELETE policy.
--   * Money is numeric(14,2). Never float.
--   * Timestamps are timestamptz. The network clock is America/New_York and
--     conversion happens at the edge, never in storage.
-- =============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";

-- ---------------------------------------------------------------- enumerations

create type provenance         as enum ('verified','demo','estimated','unverified');
create type user_role          as enum (
  'founder_admin','editor_in_chief','journalist','video_producer','programming_director',
  'master_control','social_producer','ad_sponsorship_manager','rights_compliance',
  'affiliate_manager','analytics_viewer','external_contributor','artist','affiliate','member');
create type artist_tier        as enum ('established','rising','independent');
create type label_type         as enum ('independent','indie_label','major');
create type signal_key         as enum (
  'streaming_velocity','video_views','video_view_velocity','radio_airplay','shazam',
  'search_interest','social_conversation','short_form_usage','playlist_adds','concert_demand',
  'ticket_sales','audience_vote','editorial_assessment','geographic_momentum','engagement_quality');
create type source_auth        as enum (
  'licensed_api','approved_feed','public_source','direct_submission','internal_editorial');
create type source_status      as enum ('connected','pending_agreement','disabled');
create type article_state      as enum (
  'idea','assigned','drafting','editing','fact_check','approved','scheduled','published',
  'updated','archived');
create type content_rating     as enum ('G','PG','PG-13','TV-14','TV-MA');
create type platform           as enum (
  'web','ios','android','ctv_app','fast','cable','ota','vmvpd','youtube','social','podcast',
  'radio_affiliate','internet_radio');
create type asset_type         as enum (
  'long_form_video','short_form_video','live_feed','audio','music_video','interview','performance',
  'image','graphic','promo','commercial','caption','transcript','article_document');
create type right_type         as enum (
  'master_recording','publishing','music_video_exhibition','synchronization','public_performance',
  'digital_performance','mechanical','archival_footage','ugc_license');
create type restricted_category as enum ('alcohol','cannabis','gambling','political','pharma','age_restricted');
create type caption_status     as enum ('none','auto_draft','human_reviewed','delivered');
create type qc_status          as enum ('pending','passed','failed','waived');
create type publish_status     as enum ('ingested','in_prep','ready','published','expired','taken_down');
create type daypart            as enum ('overnight','morning','midday','afternoon','primetime','late');
create type schedule_kind      as enum ('episode','promo','commercial_break','filler','live_window');
create type channel_kind       as enum ('linear_tv','radio','live','fast_popup');
create type endpoint_status    as enum ('live','provisioning','error','paused','prospect');
create type campaign_status    as enum ('draft','pending_compliance','approved','live','paused','completed');
create type submission_status  as enum ('received','in_review','editorial_hold','accepted','declined');
create type affiliate_status   as enum ('prospect','in_negotiation','contracted','on_air');
create type drive_folder       as enum ('ARTICLES','VIDEOS');
create type drive_status       as enum ('detected','imported','duplicate','matched','error');

-- --------------------------------------------------------------- shared bits

create or replace function touch_updated_at() returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- =============================================================================
-- IDENTITY
-- =============================================================================

create table users (
  id            uuid primary key default gen_random_uuid(),
  email         citext not null unique,
  name          text not null,
  title         text,
  city          text,
  avatar_initials text not null,
  active        boolean not null default true,
  -- Multiple roles are unioned at request time. See src/lib/roles.ts.
  roles         user_role[] not null default '{}',
  last_seen_at  timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on users using gin (roles);
create trigger users_touch before update on users for each row execute function touch_updated_at();

-- Append-only. Every permission-relevant action lands here.
create table audit_log (
  id          bigserial primary key,
  occurred_at timestamptz not null default now(),
  actor_id    uuid references users(id),
  action      text not null,
  entity_type text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  reason      text,
  ip_hash     text
);
create index on audit_log (entity_type, entity_id, occurred_at desc);
create index on audit_log (actor_id, occurred_at desc);

-- =============================================================================
-- ARTISTS
-- =============================================================================

create table cities (
  id          text primary key,
  slug        text not null unique,
  name        text not null,
  country     text not null,
  region      text not null,
  timezone    text not null,
  correspondent text,
  blurb       text,
  scenes      text[] not null default '{}',
  radio_affiliate_target text,
  ota_target  text,
  provenance  provenance not null default 'demo',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table city_venues (
  id       uuid primary key default gen_random_uuid(),
  city_id  text not null references cities(id) on delete cascade,
  name     text not null,
  capacity integer check (capacity > 0)
);

create table artists (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  city_id       text references cities(id),
  region        text,
  tier          artist_tier not null default 'independent',
  label_type    label_type not null default 'independent',
  formed_year   integer,
  bio           text,
  tags          text[] not null default '{}',
  -- Claimed and verified through the artist portal.
  verified      boolean not null default false,
  claimed_by    uuid references users(id),
  next_up       boolean not null default false,
  -- Bands, never precise counts, unless a licensed source can verify the figure.
  audience_band text,
  provenance    provenance not null default 'demo',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on artists (city_id);
create index on artists using gin (name gin_trgm_ops);
create trigger artists_touch before update on artists for each row execute function touch_updated_at();

create table artist_socials (
  id        uuid primary key default gen_random_uuid(),
  artist_id uuid not null references artists(id) on delete cascade,
  platform  text not null,
  handle    text not null,
  unique (artist_id, platform)
);

-- =============================================================================
-- THE RAP TRENDS INDEX
-- =============================================================================

-- A source may only contribute once an agreement exists and it is connected.
create table index_sources (
  id             uuid primary key default gen_random_uuid(),
  key            signal_key not null unique,
  label          text not null,
  provider       text not null,
  authorization_basis source_auth not null,
  status         source_status not null default 'pending_agreement',
  weight         numeric(4,3) not null check (weight >= 0 and weight <= 1),
  refresh_minutes integer not null default 60,
  last_sync_at   timestamptz,
  notes          text,
  -- Set when the licence or agreement is executed. Null means not contracted.
  agreement_signed_at timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
-- A connected source must have an executed agreement behind it.
alter table index_sources add constraint connected_requires_agreement
  check (status <> 'connected' or authorization_basis in ('public_source','internal_editorial')
         or agreement_signed_at is not null);

create table index_profiles (
  id              text primary key,
  label           text not null,
  half_life_days  integer not null check (half_life_days > 0),
  emerging_boost  numeric(4,3) not null default 1.0,
  -- signal_key -> weight. Validated to sum to 1 in application code and tests.
  weights         jsonb not null,
  regional_weights jsonb,
  active          boolean not null default false,
  created_by      uuid references users(id),
  created_at      timestamptz not null default now()
);

create table chart_entries (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  artist_id     uuid not null references artists(id),
  city_id       text references cities(id),
  release_date  date not null,
  explicit      boolean not null default false,
  isrc          text,
  weeks_on      integer not null default 0,
  peak_rank     integer,
  previous_rank integer,
  provenance    provenance not null default 'demo',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on chart_entries (artist_id);
create unique index on chart_entries (isrc) where isrc is not null;

-- Raw signal readings, one row per entry / source / window. Append-only.
create table signal_readings (
  id            bigserial primary key,
  entry_id      uuid not null references chart_entries(id) on delete cascade,
  source_key    signal_key not null,
  -- Normalized 0-100 within the release cohort.
  value         numeric(5,2) not null check (value >= 0 and value <= 100),
  window_start  timestamptz not null,
  window_end    timestamptz not null,
  ingested_at   timestamptz not null default now(),
  raw_payload   jsonb,
  unique (entry_id, source_key, window_start)
);
create index on signal_readings (entry_id, ingested_at desc);

-- One row per publication of the chart. Append-only: a published chart is a
-- historical fact and is never edited.
create table index_snapshots (
  id            bigserial primary key,
  computed_at   timestamptz not null default now(),
  profile_id    text not null references index_profiles(id),
  region_id     text references cities(id),
  entry_id      uuid not null references chart_entries(id),
  rank          integer not null,
  score         numeric(5,2) not null,
  confidence    numeric(3,2) not null check (confidence >= 0 and confidence <= 1),
  editorial_delta numeric(5,2) not null default 0,
  recency_multiplier numeric(6,4) not null,
  emerging_multiplier numeric(5,3) not null,
  regional_multiplier numeric(5,3) not null,
  contributions jsonb not null,
  flags         jsonb not null default '[]',
  published     boolean not null default false,
  publication_block text
);
create index on index_snapshots (computed_at desc, rank);
create index on index_snapshots (entry_id, computed_at desc);

-- Every override carries an author and a written reason, and is shown publicly.
create table editorial_overrides (
  id           uuid primary key default gen_random_uuid(),
  entry_id     uuid not null references chart_entries(id) on delete cascade,
  delta_points numeric(5,2) not null,
  reason       text not null check (length(reason) >= 20),
  author_id    uuid not null references users(id),
  active       boolean not null default true,
  created_at   timestamptz not null default now(),
  expires_at   timestamptz
);
create index on editorial_overrides (entry_id) where active;

-- One vote per verified account per entry per day. The constraint is the
-- anti-manipulation control, not a rate limiter bolted on afterwards.
create table audience_votes (
  id         bigserial primary key,
  entry_id   uuid not null references chart_entries(id) on delete cascade,
  user_id    uuid not null references users(id) on delete cascade,
  vote_date  date not null default current_date,
  created_at timestamptz not null default now(),
  unique (entry_id, user_id, vote_date)
);

-- =============================================================================
-- PROGRAMMING
-- =============================================================================

create table shows (
  id              uuid primary key default gen_random_uuid(),
  slug            text not null unique,
  title           text not null,
  pillar          text not null,
  format          text not null,
  runtime_minutes integer not null check (runtime_minutes > 0),
  cadence         text,
  synopsis        text,
  hosts           text[] not null default '{}',
  rating          content_rating not null default 'TV-14',
  has_clean_version boolean not null default true,
  art_color       text,
  provenance      provenance not null default 'demo',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table episodes (
  id           uuid primary key default gen_random_uuid(),
  show_id      uuid not null references shows(id) on delete cascade,
  season       integer not null default 1,
  number       integer not null,
  title        text not null,
  synopsis     text,
  duration_seconds integer not null check (duration_seconds > 0),
  asset_id     uuid,
  published_at timestamptz,
  provenance   provenance not null default 'demo',
  created_at   timestamptz not null default now(),
  unique (show_id, season, number)
);

-- =============================================================================
-- MEDIA AND RIGHTS
-- =============================================================================

create table media_assets (
  id             uuid primary key default gen_random_uuid(),
  title          text not null,
  description    text,
  type           asset_type not null,
  duration_seconds integer not null default 0,
  resolution     text,
  aspect_ratio   text,
  audio_format   text,
  loudness_lufs  numeric(5,2),
  rating         content_rating not null default 'TV-14',
  explicit       boolean not null default false,
  clean_version_asset_id uuid references media_assets(id),
  artist_id      uuid references artists(id),
  show_id        uuid references shows(id),
  episode_id     uuid references episodes(id),
  caption_status caption_status not null default 'none',
  transcript_status text not null default 'none',
  qc_status      qc_status not null default 'pending',
  qc_notes       text,
  publish_status publish_status not null default 'ingested',
  -- Storage keys, not URLs: the CDN and signing layer resolve these.
  mezzanine_key  text,
  proxy_key      text,
  thumbnail_key  text,
  source_kind    text,
  source_ref     text,
  source_link    text,
  content_hash   text,
  provenance     provenance not null default 'demo',
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create index on media_assets (show_id, episode_id);
create index on media_assets (artist_id);
create index on media_assets (publish_status);
-- Duplicate ingestion guard: the Drive connector hashes before importing.
create unique index on media_assets (content_hash) where content_hash is not null;
create trigger media_touch before update on media_assets for each row execute function touch_updated_at();

alter table episodes add constraint episodes_asset_fk
  foreign key (asset_id) references media_assets(id) on delete set null;

-- The gate reads this table. A missing row means "not cleared", never
-- "probably fine". See src/lib/rights.ts.
create table rights_windows (
  id            uuid primary key default gen_random_uuid(),
  asset_id      uuid not null references media_assets(id) on delete cascade,
  rights_owner  text not null,
  cleared       right_type[] not null default '{}',
  platforms     platform[] not null default '{}',
  -- 'WORLDWIDE' or ISO 3166-1 alpha-2 codes.
  territories   text[] not null default '{}',
  starts_at     timestamptz not null,
  ends_at       timestamptz,
  ad_restrictions restricted_category[] not null default '{}',
  talent_release_on_file boolean not null default false,
  location_release_on_file boolean not null default false,
  union_terms   text,
  contract_ref  text,
  notes         text,
  created_by    uuid references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_at is null or ends_at > starts_at)
);
create index on rights_windows (asset_id);
create index on rights_windows (ends_at) where ends_at is not null;

create table music_cues (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references media_assets(id) on delete cascade,
  sequence     integer not null,
  title        text not null,
  performer    text,
  writers      text,
  publishers   text,
  isrc         text,
  iswc         text,
  pro          text,
  usage_type   text,
  start_seconds integer not null,
  duration_seconds integer not null,
  unique (asset_id, sequence)
);

create table takedowns (
  id           uuid primary key default gen_random_uuid(),
  asset_id     uuid not null references media_assets(id) on delete cascade,
  claimant     text not null,
  received_at  timestamptz not null default now(),
  notice_ref   text,
  action_taken text,
  counter_notice_at timestamptz,
  resolved_at  timestamptz,
  handled_by   uuid references users(id)
);

-- =============================================================================
-- EDITORIAL
-- =============================================================================

create table articles (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  headline      text not null,
  dek           text,
  body          text,
  state         article_state not null default 'idea',
  author_id     uuid not null references users(id),
  editor_id     uuid references users(id),
  pillar        text,
  tags          text[] not null default '{}',
  seo_title     text,
  seo_description text,
  social_copy   text,
  push_copy     text,
  fact_check_status text not null default 'not_started',
  fact_check_by uuid references users(id),
  fact_check_notes text,
  embargo_at    timestamptz,
  scheduled_at  timestamptz,
  published_at  timestamptz,
  breaking      boolean not null default false,
  read_minutes  integer not null default 0,
  provenance    provenance not null default 'demo',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on articles (state, updated_at desc);
create index on articles (author_id);
create index on articles (published_at desc) where state in ('published','updated');
create trigger articles_touch before update on articles for each row execute function touch_updated_at();

-- Gates the workflow enforces, restated in the database so a bad write cannot
-- slip past the application layer.
alter table articles add constraint published_requires_seo
  check (state not in ('published','updated') or (seo_title is not null and seo_description is not null));
alter table articles add constraint published_requires_fact_check
  check (state not in ('approved','scheduled','published','updated') or fact_check_status = 'cleared');

create table article_sources (
  id          uuid primary key default gen_random_uuid(),
  article_id  uuid not null references articles(id) on delete cascade,
  label       text not null,
  url         text,
  verified_by uuid references users(id),
  verified_at timestamptz
);

create table article_corrections (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  note       text not null,
  issued_by  uuid not null references users(id),
  issued_at  timestamptz not null default now()
);

-- Append-only. A story's history is never editable.
create table article_revisions (
  id         bigserial primary key,
  article_id uuid not null references articles(id) on delete cascade,
  from_state article_state,
  to_state   article_state not null,
  actor_id   uuid not null references users(id),
  body_snapshot text,
  note       text,
  created_at timestamptz not null default now()
);
create index on article_revisions (article_id, created_at desc);

create table article_comments (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid not null references articles(id) on delete cascade,
  author_id  uuid not null references users(id),
  body       text not null,
  resolved   boolean not null default false,
  created_at timestamptz not null default now()
);

create table article_artists (
  article_id uuid not null references articles(id) on delete cascade,
  artist_id  uuid not null references artists(id) on delete cascade,
  primary key (article_id, artist_id)
);

create table article_cities (
  article_id uuid not null references articles(id) on delete cascade,
  city_id    text not null references cities(id) on delete cascade,
  primary key (article_id, city_id)
);

create table article_assets (
  article_id uuid not null references articles(id) on delete cascade,
  asset_id   uuid not null references media_assets(id) on delete cascade,
  primary key (article_id, asset_id)
);

-- =============================================================================
-- SCHEDULING AND CHANNELS
-- =============================================================================

create table channels (
  id            text primary key,
  name          text not null,
  kind          channel_kind not null,
  feed_variants text[] not null default '{clean}',
  platforms     platform[] not null default '{}',
  status        text not null default 'off_air',
  description   text,
  created_at    timestamptz not null default now()
);

create table schedule_items (
  id            uuid primary key default gen_random_uuid(),
  channel_id    text not null references channels(id) on delete cascade,
  starts_at     timestamptz not null,
  duration_seconds integer not null check (duration_seconds > 0),
  ends_at       timestamptz generated always as (starts_at + make_interval(secs => duration_seconds)) stored,
  kind          schedule_kind not null,
  title         text not null,
  show_id       uuid references shows(id),
  episode_id    uuid references episodes(id),
  asset_id      uuid references media_assets(id),
  daypart       daypart not null,
  explicit_allowed boolean not null default false,
  approved      boolean not null default false,
  approved_by   uuid references users(id),
  region_blackouts text[] not null default '{}',
  schedule_version integer not null default 1,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index on schedule_items (channel_id, starts_at);
-- Overlap prevention at the database level, not only in the validator.
alter table schedule_items add constraint no_overlap
  exclude using gist (
    channel_id with =,
    tstzrange(starts_at, starts_at + make_interval(secs => duration_seconds)) with &&
  );

create table schedule_versions (
  id          bigserial primary key,
  channel_id  text not null references channels(id) on delete cascade,
  version     integer not null,
  service_day date not null,
  snapshot    jsonb not null,
  approved_by uuid references users(id),
  created_at  timestamptz not null default now(),
  unique (channel_id, service_day, version)
);

-- Written by the playout system. This is the only airtime evidence the network
-- will report to an artist, an affiliate, or a PRO.
create table playout_log (
  id           bigserial primary key,
  channel_id   text not null references channels(id),
  asset_id     uuid references media_assets(id),
  schedule_item_id uuid references schedule_items(id),
  started_at   timestamptz not null,
  ended_at     timestamptz,
  feed_variant text not null default 'clean',
  territory    text,
  as_run       boolean not null default true
);
create index on playout_log (asset_id, started_at desc);
create index on playout_log (channel_id, started_at desc);

-- =============================================================================
-- DISTRIBUTION
-- =============================================================================

create table distribution_endpoints (
  id              uuid primary key default gen_random_uuid(),
  name            text not null,
  platform        platform not null,
  package         text,
  status          endpoint_status not null default 'prospect',
  territory       text,
  technical_format text,
  scheduled_delivery text,
  last_success_at timestamptz,
  last_error      text,
  owner_user_id   uuid references users(id),
  vendor          text,
  rights_eligible boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create table delivery_attempts (
  id          bigserial primary key,
  endpoint_id uuid not null references distribution_endpoints(id) on delete cascade,
  asset_id    uuid references media_assets(id),
  attempted_at timestamptz not null default now(),
  succeeded   boolean not null,
  error       text,
  payload_ref text
);
create index on delivery_attempts (endpoint_id, attempted_at desc);

create table affiliate_packages (
  id            text primary key,
  name          text not null,
  kind          text not null,
  summary       text,
  hours_per_week text,
  local_avails_per_hour integer not null default 0,
  feed          text,
  requirements  text[] not null default '{}',
  exclusivity   text,
  price_model   text
);

create table affiliates (
  id            uuid primary key default gen_random_uuid(),
  station       text not null,
  market        text not null,
  kind          text not null,
  package_id    text references affiliate_packages(id),
  status        affiliate_status not null default 'prospect',
  contact_name  text,
  contact_email citext,
  facility_id   text,
  exclusivity_window text,
  contract_ref  text,
  manager_id    uuid references users(id),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table affiliate_reports (
  id            uuid primary key default gen_random_uuid(),
  affiliate_id  uuid not null references affiliates(id) on delete cascade,
  period_month  date not null,
  spots_inserted integer not null default 0,
  local_minutes integer not null default 0,
  restricted_categories restricted_category[] not null default '{}',
  preemptions   text,
  filed_at      timestamptz not null default now(),
  reconciled    boolean not null default false,
  unique (affiliate_id, period_month)
);

-- =============================================================================
-- MONETIZATION
-- =============================================================================

create table advertisers (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  category      text,
  restricted_category restricted_category,
  contact       citext,
  created_at    timestamptz not null default now()
);

create table campaigns (
  id            uuid primary key default gen_random_uuid(),
  advertiser_id uuid not null references advertisers(id),
  name          text not null,
  starts_at     timestamptz not null,
  ends_at       timestamptz not null,
  budget_usd    numeric(14,2) not null check (budget_usd >= 0),
  delivered_usd numeric(14,2) not null default 0,
  platforms     platform[] not null default '{}',
  geo_targets   text[] not null default '{}',
  dayparts      daypart[] not null default '{}',
  frequency_cap_per_day integer not null default 0,
  content_exclusions text[] not null default '{}',
  restricted_category restricted_category,
  age_gate      integer,
  status        campaign_status not null default 'draft',
  compliance_approved_by uuid references users(id),
  compliance_approved_at timestamptz,
  make_good_impressions bigint not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  check (ends_at > starts_at)
);
-- A restricted-category campaign cannot go live without a named approver.
alter table campaigns add constraint restricted_requires_approval
  check (restricted_category is null or status in ('draft','pending_compliance')
         or compliance_approved_by is not null);

create table campaign_creatives (
  id          uuid primary key default gen_random_uuid(),
  campaign_id uuid not null references campaigns(id) on delete cascade,
  asset_id    uuid references media_assets(id),
  duration_seconds integer,
  approved    boolean not null default false,
  disclosure_text text
);

create table ad_deliveries (
  id           bigserial primary key,
  campaign_id  uuid not null references campaigns(id) on delete cascade,
  creative_id  uuid references campaign_creatives(id),
  endpoint_id  uuid references distribution_endpoints(id),
  delivered_at timestamptz not null default now(),
  impressions  bigint not null default 0,
  completions  bigint not null default 0,
  clicks       bigint not null default 0,
  daypart      daypart,
  territory    text
);
create index on ad_deliveries (campaign_id, delivered_at desc);

create table sponsor_opportunities (
  id               text primary key,
  name             text not null,
  franchise        text not null,
  platforms        platform[] not null default '{}',
  rate_card_usd    numeric(14,2) not null,
  unit             text not null,
  inventory_per_month integer not null default 0,
  description      text,
  deliverables     text[] not null default '{}'
);

-- =============================================================================
-- ARTIST SUBMISSIONS
-- =============================================================================

create table submission_plans (
  id                   text primary key,
  name                 text not null,
  price_usd            numeric(10,2) not null default 0,
  cadence              text,
  features             text[] not null default '{}',
  editorial_guarantee  text not null,
  review_window_days   integer not null default 14
);

create table submissions (
  id              uuid primary key default gen_random_uuid(),
  artist_id       uuid references artists(id),
  artist_name     text not null,
  contact_email   citext not null,
  track_title     text not null,
  city            text,
  plan_id         text not null references submission_plans(id),
  explicit_version boolean not null default false,
  clean_version   boolean not null default false,
  isrc            text,
  iswc            text,
  upc             text,
  label           text,
  publisher       text,
  pro             text,
  territories     text[] not null default '{}',
  license_starts_at timestamptz,
  license_ends_at timestamptz,
  rights_docs_provided boolean not null default false,
  next_up_application boolean not null default false,
  rights_attestation_at timestamptz not null default now(),
  status          submission_status not null default 'received',
  reviewer_id     uuid references users(id),
  notes           text,
  submitted_at    timestamptz not null default now(),
  -- At least one version must be identified or the record cannot be routed.
  check (explicit_version or clean_version)
);
create index on submissions (status, submitted_at desc);

-- Editors scoring a submission must not see the plan. This view is what the
-- review queue reads; the base table is restricted to administrators.
create view submission_review_queue as
  select id, artist_name, track_title, city, explicit_version, clean_version,
         rights_docs_provided, next_up_application, submitted_at, status
  from submissions;

create table submission_scores (
  id            uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  editor_id     uuid not null references users(id),
  score         integer not null check (score between 1 and 10),
  note          text,
  created_at    timestamptz not null default now(),
  unique (submission_id, editor_id)
);

-- =============================================================================
-- INGESTION AND OPERATIONS
-- =============================================================================

create table drive_sync_records (
  id            uuid primary key default gen_random_uuid(),
  folder        drive_folder not null,
  file_name     text not null,
  drive_file_id text not null,
  drive_link    text not null,
  mime_type     text,
  content_hash  text,
  detected_at   timestamptz not null default now(),
  status        drive_status not null default 'detected',
  matched_asset_id uuid references media_assets(id),
  matched_article_id uuid references articles(id),
  ai_suggestions jsonb,
  notified_user_id uuid references users(id),
  message       text,
  unique (drive_file_id)
);
create unique index on drive_sync_records (content_hash) where content_hash is not null;

create table drive_connections (
  id            uuid primary key default gen_random_uuid(),
  folder        drive_folder not null unique,
  drive_folder_id text not null,
  connected     boolean not null default true,
  -- Off by default. Enabling is an explicit act, recorded in the audit log.
  auto_publish  boolean not null default false,
  page_token    text,
  last_swept_at timestamptz,
  connected_by  uuid references users(id)
);

create table health_checks (
  id          text primary key,
  area        text not null,
  label       text not null,
  status      text not null,
  detail      text,
  value       text,
  updated_at  timestamptz not null default now()
);

create table ticker_items (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null,
  text       text not null,
  href       text,
  starts_at  timestamptz not null default now(),
  expires_at timestamptz,
  created_by uuid references users(id)
);

create table newsletter_subscribers (
  id             uuid primary key default gen_random_uuid(),
  email          citext not null unique,
  interests      text[] not null default '{}',
  -- Double opt-in: not subscribed until confirmed_at is set.
  consent_at     timestamptz not null default now(),
  confirmed_at   timestamptz,
  unsubscribed_at timestamptz,
  consent_source text
);

-- =============================================================================
-- ROW-LEVEL SECURITY
--
-- Supabase-style. Policies are illustrative; the full set lives with the
-- migration that enables them. The principle: staff tables deny by default and
-- grant per role claim, and history tables have no update or delete policy at
-- all.
-- =============================================================================

alter table articles              enable row level security;
alter table submissions           enable row level security;
alter table rights_windows        enable row level security;
alter table campaigns             enable row level security;
alter table audit_log             enable row level security;
alter table article_revisions     enable row level security;
alter table index_snapshots       enable row level security;

-- A journalist reads the newsroom and writes only their own unpublished work.
create policy journalist_read_articles on articles for select
  using (auth.jwt() ->> 'role' in ('journalist','editor_in_chief','founder_admin','video_producer','social_producer','external_contributor'));

create policy journalist_write_own on articles for update
  using (author_id = auth.uid() and state in ('idea','assigned','drafting','editing'))
  with check (author_id = auth.uid() and state in ('idea','drafting','editing'));

-- Publication is the editor-in-chief's, and the founder's.
create policy editor_publish on articles for update
  using (auth.jwt() ->> 'role' in ('editor_in_chief','founder_admin'));

-- An artist sees only their own submissions.
create policy artist_read_own_submissions on submissions for select
  using (artist_id in (select id from artists where claimed_by = auth.uid())
         or auth.jwt() ->> 'role' in ('editor_in_chief','founder_admin','rights_compliance'));

-- Rights records are written only by compliance.
create policy rights_write on rights_windows for all
  using (auth.jwt() ->> 'role' in ('rights_compliance','founder_admin'));

-- History is append-only: insert and select policies exist, update and delete
-- policies deliberately do not.
create policy audit_insert on audit_log for insert with check (true);
create policy audit_read on audit_log for select
  using (auth.jwt() ->> 'role' in ('founder_admin','rights_compliance'));
create policy revisions_insert on article_revisions for insert with check (true);
create policy revisions_read on article_revisions for select using (true);
create policy snapshots_insert on index_snapshots for insert with check (true);
create policy snapshots_read on index_snapshots for select using (true);

-- =============================================================================
-- HELPER VIEWS
-- =============================================================================

-- Licences lapsing inside 60 days. Drives the compliance warnings in the OS.
create view expiring_rights as
  select rw.*, ma.title as asset_title,
         extract(day from rw.ends_at - now())::int as days_remaining
  from rights_windows rw
  join media_assets ma on ma.id = rw.asset_id
  where rw.ends_at is not null
    and rw.ends_at > now()
    and rw.ends_at < now() + interval '60 days'
  order by rw.ends_at;

-- Verified airtime, the only performance evidence reported to artists.
create view artist_airtime as
  select a.id as artist_id, a.name, ma.id as asset_id, ma.title,
         pl.channel_id, pl.started_at, pl.feed_variant
  from playout_log pl
  join media_assets ma on ma.id = pl.asset_id
  join artists a on a.id = ma.artist_id
  where pl.as_run;

-- The most recent published chart.
create view current_chart as
  select distinct on (rank) *
  from index_snapshots
  where published
  order by rank, computed_at desc;
