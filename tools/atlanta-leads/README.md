# Atlanta restaurant lead finder

Finds restaurants that have a Google Business Profile but **no website** —
plus the near-miss cases (Facebook-only, DoorDash-only, dead site) that are
usually the same sales conversation.

The only authoritative source for "this profile has no website" is the
Google Places API `websiteUri` field. That is what this tool reads. No
scraping, no guessing.

## Setup

1. Create a Google Cloud project and **enable "Places API (New)"** — the old
   "Places API" will not serve these endpoints.
2. Create an API key. Restricting it to the Places API is a good idea.
3. Export it:

```bash
export GOOGLE_MAPS_API_KEY='...'
```

Python 3.9+, no dependencies.

## Use

```bash
# See how many calls a sweep costs before spending anything
python3 find_leads.py --region atlanta-city --dry-run

# Small, cheap proof run over Midtown + Downtown
python3 find_leads.py --region midtown-downtown --min-reviews 10

# Full city sweep, restaurants only, established businesses
python3 find_leads.py --region atlanta-city --min-reviews 20 --check-liveness

# Everything food-adjacent across the metro (expensive — dry-run it first)
python3 find_leads.py --region atlanta-metro --types wide --max-requests 2000
```

### Output (in `out/`)

| File | Contents |
|---|---|
| `no_website.csv` | Profiles with no website at all — the primary list |
| `leads.csv` | The above plus social-only, ordering-only, free-builder, broken |
| `all_places.csv` | Everything found, for sizing the market |
| `raw/` | Cached API responses — re-runs cost nothing |

Rows are sorted by review count descending, so the busiest businesses with
the weakest web presence come first.

### `website_class` values

| Value | Meaning |
|---|---|
| `no_website` | No `websiteUri` on the profile |
| `social_only` | Facebook, Instagram, Linktree, Yelp… |
| `ordering_platform_only` | DoorDash, Toast, Square, Clover… |
| `free_builder_subdomain` | `*.business.site`, `*.wixsite.com`, Google Sites… |
| `broken_website` | Has a URL, but it did not respond (`--check-liveness`) |
| `real_website` | Owner-controlled domain — not a lead |

A custom domain is always `real_website`, even if it is hosted on Wix or
Squarespace. Only the shared free subdomains are flagged.

## How coverage works

Nearby Search returns at most 20 places per call with no pagination, so a
single query over Atlanta would return 20 restaurants and hide thousands.
The tool tiles the region, and any tile that comes back with a full 20
results is split into quarters and re-queried, recursively, until tiles stop
saturating or hit `--min-radius`. Dense corridors get fine tiles
automatically; the exurbs stay coarse.

Tune with `--start-radius`, `--min-radius`, and `--max-depth`. Lower
`--min-radius` means better recall and more calls.

## Cost

Each tile is one billable Nearby Search call. `websiteUri`, phone, and
rating fall in Google's **Enterprise** SKU, which is the expensive tier —
`--cost-per-1000` defaults to $35 but **check your current Google pricing**,
since it changes and free monthly quota applies. Guard rails:

- `--dry-run` prints the tile count and a floor cost before any call.
- `--max-requests N` hard-stops the sweep.
- `raw/` caching means an interrupted or repeated run does not re-bill.

Budget 2–4x the dry-run floor, since dense tiles subdivide.

## Caveats

- Coverage is high but not provably exhaustive; Google returns the 20
  *nearest* per tile, so extremely dense blocks need a small `--min-radius`.
- `websiteUri` is a snapshot. Re-run before a campaign; owners add sites.
- Chain locations often inherit a corporate site, so they classify as
  `real_website` even when the individual store has no page of its own.
- `--check-liveness` fetches each site directly. It costs nothing but is
  ordinary web traffic from your machine.

## Tests

```bash
python3 test_find_leads.py
```

Covers URL classification, address parsing, tile geometry, region/status
filtering, and a full sweep against a stubbed API — no key or network needed.

## Web app version

The same scanning logic also exists as a hosted app built on Lovable
("Blank Slate Pro"), for when you want a UI, lead tracking, and a team-shared
database instead of CSVs:

- Editor: https://lovable.dev/projects/79401941-3a76-4ea5-aba1-dd3d12f9b136
- Preview: https://id-preview--79401941-3a76-4ea5-aba1-dd3d12f9b136.lovable.app

It adds a Postgres store keyed on the Google place id (so CRM status and
notes survive re-scans), a resumable tile queue, per-lead status/notes/
follow-up dates, and a dashboard broken down by category and ZIP.

The app reads its Google key from the `GOOGLE_MAPS_API_KEY` backend secret,
set in Lovable's project settings. The key must have **application
restrictions set to None or IP addresses** — a referrer-restricted key fails
when called server-side.

This CLI script and the app query Google the same way and cost the same per
call. Use the script for a one-off export; use the app for ongoing outreach.
