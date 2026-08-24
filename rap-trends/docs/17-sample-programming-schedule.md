# RAP TRENDS — Sample Programming Schedule

A full week of RAP TRENDS TV. All times Eastern. Generated from the daypart grid in
`src/data/schedule.ts`; the same grid drives the public schedule page, the EPG endpoint, and the
programming console.

## Structure

Every hour is built the same way so ad load is predictable and the channel never drifts:

- **Half-hour slot** — programme 25:30 · break 2:30 · promo 1:00 · break 1:00 = 30:00
- **Hour slot** — programme 52:00 · break 4:00 · promo 1:00 · break 3:00 = 60:00

Each day totals exactly 86,400 seconds. The schedule validator enforces it, and the test suite
asserts it for all seven days.

## Weekday grid (Monday–Friday)

| Time | Programme | Franchise | Feed |
|---|---|---|---|
| 00:00 | BARS | BARS | **Explicit permitted** |
| 02:00 | RAP TRENDS SESSIONS | SESSIONS | Clean |
| 06:00 | TRENDING 10 (repeat) | TRENDING 10 | Clean |
| 09:00 | CITY REPORT rotation | CITY REPORT | Clean |
| 12:00 | THE DROP | THE DROP | Clean |
| 13:00 | THE BUSINESS | THE BUSINESS | Clean |
| 16:00 | NEXT UP | NEXT UP | Clean |
| 18:00 | TRENDING 10 | TRENDING 10 | Clean |
| 18:30 | CITY REPORT | CITY REPORT | Clean |
| **19:00** | **RAP TRENDS LIVE** | **Flagship, live** | Clean |
| 20:00 | Nightly feature (rotates) | Varies | Clean |
| 21:00 | BARS | BARS | Clean version |
| 22:00 | RAP TRENDS SESSIONS | SESSIONS | Clean |
| 23:00 | TRENDING 10 (replay) | TRENDING 10 | Clean |

### The 20:00 feature rotation

| Day | Feature |
|---|---|
| Monday | CITY REPORT — extended market package |
| Tuesday | THE BUSINESS — long form |
| Wednesday | BARS — cypher special |
| Thursday | **NEXT UP** — the week's emerging artists |
| Friday | THE DROP — the release-week rundown |
| Saturday | RAP TRENDS SESSIONS |
| Sunday | RAP TRENDS SESSIONS |

## Weekend grid (Saturday–Sunday)

| Time | Programme | Franchise |
|---|---|---|
| 00:00 | BARS | BARS — explicit permitted |
| 02:00 | RAP TRENDS SESSIONS | SESSIONS |
| 07:00 | TRENDING 10 | TRENDING 10 |
| 09:00 | NEXT UP | NEXT UP |
| 12:00 | CITY REPORT | CITY REPORT |
| 15:00 | THE BUSINESS | THE BUSINESS |
| 17:00 | THE DROP | THE DROP |
| 19:00 | Weekend feature | SESSIONS |
| 20:00 | RAP TRENDS SESSIONS | SESSIONS |
| 22:00 | TRENDING 10 | TRENDING 10 |

## Dayparts

| Daypart | Hours | Character |
|---|---|---|
| Overnight | 00:00–06:00 | BARS and SESSIONS. Explicit feed permitted |
| Morning | 06:00–10:00 | TRENDING 10 repeats. Clean, low-commitment viewing |
| Midday | 10:00–15:00 | CITY REPORT, THE DROP, THE BUSINESS |
| Afternoon | 15:00–19:00 | NEXT UP, countdown, city report into primetime |
| Primetime | 19:00–23:00 | Flagship, nightly feature, BARS, SESSIONS |
| Late | 23:00–24:00 | Countdown replay into the overnight block |

## Explicit content policy on air

Explicit audio rides the feed **only** in the late and overnight dayparts, and **only** on owned
digital origination. Broadcast, cable, and radio-affiliate carriage always receives the clean feed.

This is enforced, not documented: `validateSchedule()` raises an error-severity issue for an explicit
item scheduled in any other daypart, and the rights gate blocks a missing clean version from ever
reaching an OTA or radio-affiliate destination. The programming console will not let the schedule be
approved with that error open.

## Commercial inventory

| Slot type | Break inventory | Promo |
|---|---|---|
| Half-hour | 3:30 across two breaks | 1:00 |
| Hour | 7:00 across two breaks | 1:00 |

Roughly **8 minutes per hour** of commercial inventory. On affiliate carriage, 8–12 minutes per hour
is reserved for local insertion depending on the package.

## RAP TRENDS RADIO — hour clock

| Position | Element | Length |
|---|---|---|
| :00 | Legal identification | 0:10 |
| :00 | RAP TRENDS Report — top of hour | 5:00 |
| :05 | Music | ~3:30 |
| :09 | Music | ~3:20 |
| :12 | **Commercial window — local avail** | 2:00 |
| :14 | Music | ~3:10 |
| :17 | NEXT UP Spotlight | 10:00 |
| :27 | Music | ~3:50 |
| :31 | Music | ~3:25 |
| :35 | Music | ~3:40 |
| :39 | **Commercial window — national** | 2:00 |
| :41 | Music | ~3:30 |
| :45 | RAP TRENDS Report (dayparts) | 5:00 |
| :50 | **RAP TRENDS Update** | 1:00 |
| :51 | Music to top of hour | ~9:00 |

The affiliate feed carries the same clock with the legal-ID window reserved for the station and 12
minutes per hour of local availability.

## What is not in the schedule yet

ARCHIVE (blocked on chain-of-title clearance), CULTURE MARKET (Phase 3), RAP TRENDS AWARDS (Phase 4),
and city and event pop-up channels (Phase 3). Slots for each are reserved in the grid design so
adding them is a scheduling change rather than a restructure.
