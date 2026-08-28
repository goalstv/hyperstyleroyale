#!/usr/bin/env python3
"""Find restaurants with a Google Business Profile but no (or a weak) website.

Queries the Google Places API (New) Nearby Search over an adaptively
subdivided grid, then classifies every place found by the strength of its
web presence. Places with no `websiteUri` on their Business Profile are the
primary output; places whose only "website" is a social page, an ordering
portal, or a free site builder are reported separately, since they are
usually the same sales conversation.

Stdlib only. Responses are cached on disk, so re-runs are free and resumable.
"""

from __future__ import annotations

import argparse
import csv
import hashlib
import json
import math
import os
import re
import sys
import time
import urllib.error
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass, field

NEARBY_URL = "https://places.googleapis.com/v1/places:searchNearby"

# Nearby Search (New) returns at most 20 places per call and has no pagination,
# so a tile that comes back full is assumed to be hiding more.
PAGE_LIMIT = 20

FIELD_MASK = ",".join(
    "places." + f
    for f in (
        "id",
        "displayName",
        "formattedAddress",
        "location",
        "types",
        "primaryTypeDisplayName",
        "businessStatus",
        "googleMapsUri",
        "websiteUri",
        "nationalPhoneNumber",
        "rating",
        "userRatingCount",
        "priceLevel",
    )
)

# Bounding boxes: (lat_min, lat_max, lng_min, lng_max)
REGIONS = {
    "atlanta-city": (33.647, 33.887, -84.551, -84.289),
    "atlanta-perimeter": (33.640, 33.930, -84.560, -84.230),
    "atlanta-metro": (33.400, 34.100, -84.750, -84.050),
    "midtown-downtown": (33.740, 33.800, -84.410, -84.360),
}

DEFAULT_TYPES = ["restaurant"]
WIDE_TYPES = [
    "restaurant",
    "cafe",
    "bakery",
    "bar",
    "meal_takeaway",
    "meal_delivery",
    "coffee_shop",
    "sandwich_shop",
    "ice_cream_shop",
]

# A "website" on one of these hosts is not a website the owner controls.
SOCIAL_HOSTS = {
    "facebook.com", "www.facebook.com", "m.facebook.com", "fb.com", "fb.me",
    "instagram.com", "www.instagram.com", "twitter.com", "x.com",
    "tiktok.com", "www.tiktok.com", "linktr.ee", "beacons.ai", "linkin.bio",
    "yelp.com", "www.yelp.com", "tripadvisor.com", "www.tripadvisor.com",
    "nextdoor.com", "youtube.com", "www.youtube.com",
}
ORDERING_HOSTS = {
    "doordash.com", "www.doordash.com", "ubereats.com", "www.ubereats.com",
    "grubhub.com", "www.grubhub.com", "seamless.com", "postmates.com",
    "toasttab.com", "www.toasttab.com", "order.toasttab.com",
    "clover.com", "www.clover.com", "square.site", "squareup.com",
    "chownow.com", "slicelife.com", "menufy.com", "beyondmenu.com",
    "allmenus.com", "singleplatform.com", "ezcater.com", "opentable.com",
}
FREE_BUILDER_HOSTS = {
    "business.site", "sites.google.com", "wixsite.com", "weebly.com",
    "godaddysites.com", "blogspot.com", "wordpress.com", "webs.com",
    "myfreesites.net", "jimdosite.com", "carrd.co",
}

CLASS_NO_WEBSITE = "no_website"
CLASS_SOCIAL = "social_only"
CLASS_ORDERING = "ordering_platform_only"
CLASS_FREE_BUILDER = "free_builder_subdomain"
CLASS_REAL = "real_website"

# Everything except a real, owner-controlled site is a lead by default.
LEAD_CLASSES = (CLASS_NO_WEBSITE, CLASS_SOCIAL, CLASS_ORDERING, CLASS_FREE_BUILDER)

M_PER_DEG_LAT = 111_320.0


def m_per_deg_lng(lat: float) -> float:
    return M_PER_DEG_LAT * math.cos(math.radians(lat))


@dataclass
class Tile:
    lat_min: float
    lat_max: float
    lng_min: float
    lng_max: float
    depth: int = 0

    @property
    def center(self) -> tuple[float, float]:
        return ((self.lat_min + self.lat_max) / 2, (self.lng_min + self.lng_max) / 2)

    @property
    def radius_m(self) -> float:
        """Radius of the circle circumscribing this tile."""
        lat_c, _ = self.center
        half_lat = (self.lat_max - self.lat_min) / 2 * M_PER_DEG_LAT
        half_lng = (self.lng_max - self.lng_min) / 2 * m_per_deg_lng(lat_c)
        return math.hypot(half_lat, half_lng)

    def quarters(self) -> list["Tile"]:
        lat_mid = (self.lat_min + self.lat_max) / 2
        lng_mid = (self.lng_min + self.lng_max) / 2
        return [
            Tile(self.lat_min, lat_mid, self.lng_min, lng_mid, self.depth + 1),
            Tile(self.lat_min, lat_mid, lng_mid, self.lng_max, self.depth + 1),
            Tile(lat_mid, self.lat_max, self.lng_min, lng_mid, self.depth + 1),
            Tile(lat_mid, self.lat_max, lng_mid, self.lng_max, self.depth + 1),
        ]


@dataclass
class Stats:
    requests: int = 0
    cache_hits: int = 0
    tiles_split: int = 0
    errors: int = 0
    places: dict = field(default_factory=dict)


def seed_tiles(bbox: tuple[float, float, float, float], start_radius_m: float) -> list[Tile]:
    """Cover the bounding box with tiles whose circumradius is <= start_radius_m."""
    lat_min, lat_max, lng_min, lng_max = bbox
    lat_c = (lat_min + lat_max) / 2
    # A square with circumradius r has side r*sqrt(2).
    side_m = start_radius_m * math.sqrt(2)
    d_lat = side_m / M_PER_DEG_LAT
    d_lng = side_m / m_per_deg_lng(lat_c)
    n_lat = max(1, math.ceil((lat_max - lat_min) / d_lat))
    n_lng = max(1, math.ceil((lng_max - lng_min) / d_lng))
    step_lat = (lat_max - lat_min) / n_lat
    step_lng = (lng_max - lng_min) / n_lng
    tiles = []
    for i in range(n_lat):
        for j in range(n_lng):
            tiles.append(
                Tile(
                    lat_min + i * step_lat,
                    lat_min + (i + 1) * step_lat,
                    lng_min + j * step_lng,
                    lng_min + (j + 1) * step_lng,
                )
            )
    return tiles


def call_nearby(body: dict, api_key: str, cache_dir: str, stats: Stats,
                max_retries: int = 5) -> dict:
    payload = json.dumps(body, sort_keys=True).encode()
    key = hashlib.sha256(payload + FIELD_MASK.encode()).hexdigest()[:32]
    path = os.path.join(cache_dir, key + ".json")
    if os.path.exists(path):
        stats.cache_hits += 1
        with open(path) as fh:
            return json.load(fh)

    delay = 2.0
    for attempt in range(max_retries):
        req = urllib.request.Request(
            NEARBY_URL,
            data=payload,
            headers={
                "Content-Type": "application/json",
                "X-Goog-Api-Key": api_key,
                "X-Goog-FieldMask": FIELD_MASK,
            },
            method="POST",
        )
        try:
            with urllib.request.urlopen(req, timeout=45) as resp:
                data = json.loads(resp.read().decode())
            stats.requests += 1
            with open(path, "w") as fh:
                json.dump(data, fh)
            return data
        except urllib.error.HTTPError as exc:
            detail = exc.read().decode(errors="replace")[:600]
            # 429 = rate limited, 5xx = transient. Anything else is fatal:
            # a bad key or a disabled API will not fix itself on retry.
            if exc.code not in (429, 500, 502, 503, 504):
                raise SystemExit(
                    f"\nPlaces API returned HTTP {exc.code}. Response:\n{detail}\n"
                )
            print(f"  ! HTTP {exc.code}, retrying in {delay:.0f}s", file=sys.stderr)
        except (urllib.error.URLError, TimeoutError, json.JSONDecodeError) as exc:
            print(f"  ! {type(exc).__name__}: {exc}, retrying in {delay:.0f}s",
                  file=sys.stderr)
        time.sleep(delay)
        delay *= 2

    stats.errors += 1
    return {}


def harvest(tiles: list[Tile], args, api_key: str, cache_dir: str, stats: Stats) -> None:
    """Depth-first sweep; any saturated tile is subdivided and re-queried."""
    queue = list(tiles)
    total_seeded = len(queue)
    done = 0
    while queue:
        tile = queue.pop()
        lat, lng = tile.center
        body = {
            "includedTypes": args.types,
            "maxResultCount": PAGE_LIMIT,
            "rankPreference": "DISTANCE",
            "languageCode": "en",
            "locationRestriction": {
                "circle": {
                    "center": {"latitude": lat, "longitude": lng},
                    "radius": min(tile.radius_m, 50_000.0),
                }
            },
        }
        data = call_nearby(body, api_key, cache_dir, stats)
        places = data.get("places", [])
        for place in places:
            pid = place.get("id")
            if pid:
                stats.places[pid] = place

        done += 1
        if done % 25 == 0 or not queue:
            print(
                f"  tiles done={done} queued={len(queue)} "
                f"unique_places={len(stats.places)} api_calls={stats.requests} "
                f"cached={stats.cache_hits}",
                flush=True,
            )

        saturated = len(places) >= PAGE_LIMIT
        can_split = tile.depth < args.max_depth and tile.radius_m / 2 >= args.min_radius
        if saturated and can_split:
            stats.tiles_split += 1
            queue.extend(tile.quarters())
        if args.max_requests and stats.requests >= args.max_requests:
            print(f"  ! hit --max-requests={args.max_requests}, stopping sweep",
                  file=sys.stderr)
            return
    _ = total_seeded


def host_of(url: str) -> str:
    m = re.match(r"https?://([^/?#]+)", url or "", re.I)
    return m.group(1).lower() if m else ""


def registrable(host: str) -> str:
    parts = host.split(".")
    return ".".join(parts[-2:]) if len(parts) >= 2 else host


def classify(url: str) -> str:
    if not url:
        return CLASS_NO_WEBSITE
    host = host_of(url)
    if not host:
        return CLASS_NO_WEBSITE
    base = registrable(host)
    if host in SOCIAL_HOSTS or base in SOCIAL_HOSTS:
        return CLASS_SOCIAL
    if host in ORDERING_HOSTS or base in ORDERING_HOSTS:
        return CLASS_ORDERING
    # Free builders are only weak on their shared subdomain; a custom domain
    # pointed at Wix or Squarespace is a real site.
    for builder in FREE_BUILDER_HOSTS:
        if host == builder or host.endswith("." + builder):
            return CLASS_FREE_BUILDER
    return CLASS_REAL


ADDR_RE = re.compile(r",\s*([^,]+),\s*([A-Z]{2})\s*(\d{5})(?:-\d{4})?")


def split_address(addr: str) -> tuple[str, str, str]:
    m = ADDR_RE.search(addr or "")
    return (m.group(1).strip(), m.group(2), m.group(3)) if m else ("", "", "")


def in_bbox(place: dict, bbox) -> bool:
    loc = place.get("location") or {}
    lat, lng = loc.get("latitude"), loc.get("longitude")
    if lat is None or lng is None:
        return False
    lat_min, lat_max, lng_min, lng_max = bbox
    return lat_min <= lat <= lat_max and lng_min <= lng <= lng_max


def check_liveness(rows: list[dict], workers: int = 8) -> None:
    """Flag websites that no longer resolve — often the strongest leads."""
    targets = [r for r in rows if r["website"]]
    if not targets:
        return
    print(f"\nChecking liveness of {len(targets)} websites...", flush=True)

    def probe(row: dict) -> None:
        url = row["website"]
        for method in ("HEAD", "GET"):
            try:
                req = urllib.request.Request(
                    url, method=method,
                    headers={"User-Agent": "Mozilla/5.0 (compatible; lead-check/1.0)"},
                )
                with urllib.request.urlopen(req, timeout=10) as resp:
                    row["website_status"] = str(resp.status)
                    return
            except urllib.error.HTTPError as exc:
                # A 405 just means HEAD is unsupported; fall through to GET.
                if exc.code == 405 and method == "HEAD":
                    continue
                row["website_status"] = str(exc.code)
                return
            except Exception as exc:
                row["website_status"] = f"dead:{type(exc).__name__}"
                if method == "GET":
                    return
        return

    with ThreadPoolExecutor(max_workers=workers) as pool:
        list(pool.map(probe, targets))

    for row in targets:
        status = row.get("website_status", "")
        if status.startswith("dead:") or status.startswith(("4", "5")):
            row["website_class"] = "broken_website"


COLUMNS = [
    "name", "website_class", "website", "website_status", "phone", "address",
    "city", "state", "zip", "reviews", "rating", "category", "price_level",
    "business_status", "lat", "lng", "maps_url", "place_id",
]


def to_row(place: dict) -> dict:
    addr = place.get("formattedAddress", "")
    city, state, zipcode = split_address(addr)
    loc = place.get("location") or {}
    website = place.get("websiteUri", "") or ""
    return {
        "name": (place.get("displayName") or {}).get("text", ""),
        "website_class": classify(website),
        "website": website,
        "website_status": "",
        "phone": place.get("nationalPhoneNumber", "") or "",
        "address": addr,
        "city": city,
        "state": state,
        "zip": zipcode,
        "reviews": place.get("userRatingCount", 0) or 0,
        "rating": place.get("rating", "") or "",
        "category": (place.get("primaryTypeDisplayName") or {}).get("text", ""),
        "price_level": place.get("priceLevel", "") or "",
        "business_status": place.get("businessStatus", "") or "",
        "lat": loc.get("latitude", ""),
        "lng": loc.get("longitude", ""),
        "maps_url": place.get("googleMapsUri", "") or "",
        "place_id": place.get("id", ""),
    }


def write_csv(path: str, rows: list[dict]) -> None:
    with open(path, "w", newline="") as fh:
        writer = csv.DictWriter(fh, fieldnames=COLUMNS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    ap = argparse.ArgumentParser(
        description="Find restaurants with a Google Business Profile but no website.",
        formatter_class=argparse.ArgumentDefaultsHelpFormatter,
    )
    ap.add_argument("--region", default="atlanta-city", choices=sorted(REGIONS),
                    help="Named bounding box to sweep")
    ap.add_argument("--bbox", help="Custom bbox 'lat_min,lat_max,lng_min,lng_max' "
                                   "(overrides --region)")
    ap.add_argument("--types", default=",".join(DEFAULT_TYPES),
                    help="Comma-separated Places types, or the keyword 'wide'")
    ap.add_argument("--start-radius", type=float, default=1200.0,
                    help="Circumradius in metres of the initial tiles")
    ap.add_argument("--min-radius", type=float, default=150.0,
                    help="Stop subdividing below this radius in metres")
    ap.add_argument("--max-depth", type=int, default=5,
                    help="Maximum subdivision depth per seed tile")
    ap.add_argument("--min-reviews", type=int, default=0,
                    help="Drop places with fewer reviews than this")
    ap.add_argument("--include-closed", action="store_true",
                    help="Keep places not marked OPERATIONAL")
    ap.add_argument("--check-liveness", action="store_true",
                    help="Probe each website and flag dead ones (no API cost)")
    ap.add_argument("--max-requests", type=int, default=0,
                    help="Hard cap on billable API calls (0 = unlimited)")
    ap.add_argument("--cost-per-1000", type=float, default=35.0,
                    help="Your Nearby Search Enterprise SKU rate, for the estimate")
    ap.add_argument("--outdir", default="out", help="Directory for CSVs and cache")
    ap.add_argument("--dry-run", action="store_true",
                    help="Show tile count and cost estimate, make no API calls")
    args = ap.parse_args()

    args.types = WIDE_TYPES if args.types == "wide" else [
        t.strip() for t in args.types.split(",") if t.strip()
    ]

    if args.bbox:
        parts = [float(x) for x in args.bbox.split(",")]
        if len(parts) != 4:
            raise SystemExit("--bbox needs 4 comma-separated numbers")
        bbox = tuple(parts)
    else:
        bbox = REGIONS[args.region]

    tiles = seed_tiles(bbox, args.start_radius)
    label = args.bbox or args.region
    print(f"Region {label} -> {len(tiles)} seed tiles "
          f"({args.start_radius:.0f} m radius each), types={args.types}")

    if args.dry_run:
        low = len(tiles) * args.cost_per_1000 / 1000
        print(f"Dry run: {len(tiles)} calls minimum "
              f"(~${low:.2f}); dense areas subdivide, so budget 2-4x that. "
              f"No calls made.")
        return 0

    api_key = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("PLACES_API_KEY")
    if not api_key:
        raise SystemExit(
            "Set GOOGLE_MAPS_API_KEY (or PLACES_API_KEY) to a key with the "
            "Places API (New) enabled."
        )

    cache_dir = os.path.join(args.outdir, "raw")
    os.makedirs(cache_dir, exist_ok=True)
    stats = Stats()
    started = time.time()
    harvest(tiles, args, api_key, cache_dir, stats)

    rows = [to_row(p) for p in stats.places.values() if in_bbox(p, bbox)]
    if not args.include_closed:
        rows = [r for r in rows if r["business_status"] in ("OPERATIONAL", "")]
    if args.min_reviews:
        rows = [r for r in rows if (r["reviews"] or 0) >= args.min_reviews]

    if args.check_liveness:
        check_liveness(rows)

    rows.sort(key=lambda r: (-(r["reviews"] or 0), r["name"]))
    leads = [r for r in rows
             if r["website_class"] in LEAD_CLASSES or r["website_class"] == "broken_website"]
    no_site = [r for r in leads if r["website_class"] == CLASS_NO_WEBSITE]

    os.makedirs(args.outdir, exist_ok=True)
    write_csv(os.path.join(args.outdir, "all_places.csv"), rows)
    write_csv(os.path.join(args.outdir, "leads.csv"), leads)
    write_csv(os.path.join(args.outdir, "no_website.csv"), no_site)

    elapsed = time.time() - started
    cost = stats.requests * args.cost_per_1000 / 1000
    print("\n" + "=" * 64)
    print(f"Places found (in bbox, after filters): {len(rows)}")
    breakdown: dict[str, int] = {}
    for r in rows:
        breakdown[r["website_class"]] = breakdown.get(r["website_class"], 0) + 1
    for cls, n in sorted(breakdown.items(), key=lambda kv: -kv[1]):
        pct = 100 * n / len(rows) if rows else 0
        print(f"  {cls:<24} {n:>5}  ({pct:.1f}%)")
    print(f"\nNo website at all:  {len(no_site)}")
    print(f"All leads:          {len(leads)}")
    print(f"API calls billed:   {stats.requests}  (cache hits {stats.cache_hits}, "
          f"tiles split {stats.tiles_split}, errors {stats.errors})")
    print(f"Estimated cost:     ${cost:.2f} at ${args.cost_per_1000:.2f}/1000")
    print(f"Elapsed:            {elapsed:.0f}s")
    print(f"\nWrote {args.outdir}/no_website.csv, leads.csv, all_places.csv")
    return 0


if __name__ == "__main__":
    sys.exit(main())
