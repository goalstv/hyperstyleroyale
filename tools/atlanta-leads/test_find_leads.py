#!/usr/bin/env python3
"""Offline tests: geometry, classification, filtering, and a stubbed sweep."""
import math
import os
import sys
import tempfile
import types

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import find_leads as fl

fails = []


def check(label, got, want):
    if got != want:
        fails.append(f"{label}: got {got!r}, want {want!r}")
        print(f"  FAIL {label}: got {got!r} want {want!r}")
    else:
        print(f"  ok   {label}")


print("-- classify --")
check("empty", fl.classify(""), fl.CLASS_NO_WEBSITE)
check("none", fl.classify(None), fl.CLASS_NO_WEBSITE)
check("facebook", fl.classify("https://www.facebook.com/joesdiner"), fl.CLASS_SOCIAL)
check("insta", fl.classify("http://instagram.com/joes"), fl.CLASS_SOCIAL)
check("linktree", fl.classify("https://linktr.ee/joes"), fl.CLASS_SOCIAL)
check("doordash", fl.classify("https://www.doordash.com/store/joes-123"), fl.CLASS_ORDERING)
check("toast", fl.classify("https://order.toasttab.com/joes"), fl.CLASS_ORDERING)
check("square.site", fl.classify("https://joes.square.site"), fl.CLASS_ORDERING)
check("business.site", fl.classify("https://joes-diner.business.site"), fl.CLASS_FREE_BUILDER)
check("wixsite sub", fl.classify("https://joe.wixsite.com/diner"), fl.CLASS_FREE_BUILDER)
check("google sites", fl.classify("https://sites.google.com/view/joes"), fl.CLASS_FREE_BUILDER)
check("real", fl.classify("https://joesdiner.com"), fl.CLASS_REAL)
check("real www", fl.classify("http://www.joesdiner.com/menu"), fl.CLASS_REAL)
# A custom domain on a paid builder is a real site, not a free subdomain.
check("custom domain on wix", fl.classify("https://joesdiner.com"), fl.CLASS_REAL)
check("garbage", fl.classify("not-a-url"), fl.CLASS_NO_WEBSITE)

print("-- address parsing --")
check("full", fl.split_address("675 Ponce De Leon Ave NE, Atlanta, GA 30308, USA"),
      ("Atlanta", "GA", "30308"))
check("suite", fl.split_address("123 Main St Suite 4, Decatur, GA 30030, USA"),
      ("Decatur", "GA", "30030"))
check("zip+4", fl.split_address("1 A St, Atlanta, GA 30303-1234, USA"),
      ("Atlanta", "GA", "30303"))
check("unparseable", fl.split_address("somewhere"), ("", "", ""))

print("-- tile geometry --")
t = fl.Tile(33.74, 33.78, -84.40, -84.36)
# Circumradius must actually reach the corners, or the sweep leaves gaps.
half_lat_m = (33.78 - 33.74) / 2 * fl.M_PER_DEG_LAT
half_lng_m = (0.04) / 2 * fl.m_per_deg_lng(33.76)
check("radius covers corner", round(t.radius_m) >= round(math.hypot(half_lat_m, half_lng_m)), True)
q = t.quarters()
check("four quarters", len(q), 4)
check("quarter area sums", round(sum((x.lat_max - x.lat_min) * (x.lng_max - x.lng_min) for x in q), 10),
      round((t.lat_max - t.lat_min) * (t.lng_max - t.lng_min), 10))
check("depth increments", q[0].depth, 1)
check("quarter radius halves", round(q[0].radius_m / t.radius_m, 3), 0.5)

seeds = fl.seed_tiles(fl.REGIONS["midtown-downtown"], 600)
check("seed tiles cover bbox lat", round(min(s.lat_min for s in seeds), 6), 33.74)
check("seed tiles cover bbox lat max", round(max(s.lat_max for s in seeds), 6), 33.8)
check("seed radius within budget", all(s.radius_m <= 600 + 1e-6 for s in seeds), True)

print("-- bbox filter --")
bbox = fl.REGIONS["atlanta-city"]
check("inside", fl.in_bbox({"location": {"latitude": 33.77, "longitude": -84.38}}, bbox), True)
check("outside (Marietta)", fl.in_bbox({"location": {"latitude": 33.95, "longitude": -84.55}}, bbox), False)
check("missing loc", fl.in_bbox({}, bbox), False)

print("-- stubbed end-to-end sweep --")
FAKE = {
    "p1": {"id": "p1", "displayName": {"text": "No Site Diner"},
           "formattedAddress": "1 Peachtree St NE, Atlanta, GA 30303, USA",
           "location": {"latitude": 33.755, "longitude": -84.388},
           "businessStatus": "OPERATIONAL", "userRatingCount": 412, "rating": 4.6,
           "nationalPhoneNumber": "(404) 555-0101",
           "primaryTypeDisplayName": {"text": "Restaurant"}},
    "p2": {"id": "p2", "displayName": {"text": "Facebook Only Grill"},
           "formattedAddress": "2 Edgewood Ave, Atlanta, GA 30303, USA",
           "location": {"latitude": 33.754, "longitude": -84.387},
           "websiteUri": "https://www.facebook.com/fbgrill",
           "businessStatus": "OPERATIONAL", "userRatingCount": 88},
    "p3": {"id": "p3", "displayName": {"text": "Real Website Bistro"},
           "formattedAddress": "3 Auburn Ave, Atlanta, GA 30303, USA",
           "location": {"latitude": 33.756, "longitude": -84.386},
           "websiteUri": "https://realbistro.com",
           "businessStatus": "OPERATIONAL", "userRatingCount": 900},
    "p4": {"id": "p4", "displayName": {"text": "Closed Cafe"},
           "formattedAddress": "4 Marietta St, Atlanta, GA 30303, USA",
           "location": {"latitude": 33.757, "longitude": -84.389},
           "businessStatus": "CLOSED_PERMANENTLY", "userRatingCount": 12},
    "p5": {"id": "p5", "displayName": {"text": "Way Out Of Region"},
           "formattedAddress": "5 Far Rd, Macon, GA 31201, USA",
           "location": {"latitude": 32.84, "longitude": -83.63},
           "businessStatus": "OPERATIONAL", "userRatingCount": 50},
    "p6": {"id": "p6", "displayName": {"text": "Tiny New Spot"},
           "formattedAddress": "6 Luckie St, Atlanta, GA 30303, USA",
           "location": {"latitude": 33.758, "longitude": -84.390},
           "businessStatus": "OPERATIONAL", "userRatingCount": 2},
}

calls = {"n": 0}


def fake_call(body, api_key, cache_dir, stats, max_retries=5):
    calls["n"] += 1
    stats.requests += 1
    # First tile saturates to prove subdivision fires; children return the rest.
    if calls["n"] == 1:
        return {"places": [dict(FAKE["p1"], id=f"filler{i}",
                                displayName={"text": f"Filler {i}"},
                                formattedAddress="9 Filler St, Atlanta, GA 30303, USA")
                           for i in range(fl.PAGE_LIMIT)]}
    if calls["n"] == 2:
        return {"places": list(FAKE.values())}
    return {"places": []}


fl.call_nearby = fake_call
stats = fl.Stats()
args = types.SimpleNamespace(types=["restaurant"], max_depth=2, min_radius=100,
                             max_requests=0)
tmp = tempfile.mkdtemp()
fl.harvest([fl.Tile(33.74, 33.78, -84.40, -84.36)], args, "fake", tmp, stats)
check("subdivision fired", stats.tiles_split >= 1, True)
check("unique places collected", len(stats.places), fl.PAGE_LIMIT + len(FAKE))

rows = [fl.to_row(p) for p in stats.places.values() if fl.in_bbox(p, fl.REGIONS["atlanta-city"])]
check("out-of-region dropped", any(r["name"] == "Way Out Of Region" for r in rows), False)
rows_open = [r for r in rows if r["business_status"] in ("OPERATIONAL", "")]
check("closed dropped", any(r["name"] == "Closed Cafe" for r in rows_open), False)
rows_rev = [r for r in rows_open if r["reviews"] >= 10]
check("min-reviews drops tiny", any(r["name"] == "Tiny New Spot" for r in rows_rev), False)

leads = [r for r in rows_rev if r["website_class"] in fl.LEAD_CLASSES]
names = {r["name"] for r in leads}
check("no-site diner is a lead", "No Site Diner" in names, True)
check("facebook grill is a lead", "Facebook Only Grill" in names, True)
check("real bistro excluded", "Real Website Bistro" in names, False)

out = os.path.join(tmp, "leads.csv")
fl.write_csv(out, leads)
with open(out) as fh:
    body = fh.read()
check("csv header", body.splitlines()[0], ",".join(fl.COLUMNS))
check("csv rows", len(body.strip().splitlines()) - 1, len(leads))

print()
if fails:
    print(f"{len(fails)} FAILURE(S)")
    for f in fails:
        print("  - " + f)
    sys.exit(1)
print("all tests passed")
