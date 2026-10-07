# 25 — The POLARIS catalogue

What is actually in the library, where each number came from, and which parts
of it cannot be scheduled yet. Written against one file:

```
Dropbox  /rahman dukes/Spacemob/Programming Schedule/
         POLARIS_Distributor_Programming_Book_ContentOverview_Big.xlsx
         server_modified 2026-07-07T19:38:08Z
         retrieved        2026-10-07
```

Transcribed into `src/data/catalogue.ts`. The reconciliation below is enforced
by `tests/catalogue.test.ts`, so a number cannot drift away from its source
without a test failing.

## What reconciles

The detail tab states 293 franchises and 1,019 assets. Its own sixteen
content-type rows sum to exactly that, so the transcription is checkable and it
checks out.

| Type | Franchises | Assets |
|---|---:|---:|
| Series | 80 | 448 |
| Long Form | 93 | 164 |
| Short Form | 37 | 39 |
| Movies | 30 | 38 |
| News | 19 | 22 |
| Documentary | 13 | 18 |
| Sports | 10 | 13 |
| Livestream | 6 | 205 |
| Performance | 3 | 4 |
| Fashion | 1 | 1 |
| Podcast | 1 | 67 |
| **Total** | **293** | **1,019** |

Five of the sixteen source rows are mis-keyed spellings of a type that already
exists — `Documetary`, `Log Form`, `Moviies`, `Shirt Form`, `Shortss`. Between
them they hold 9 franchises and 11 assets, which would otherwise read as six
extra content types on a distributor deck. They are folded into the type they
plainly belong to; folding changes no total, which the test checks both ways.

## What does not reconcile

The dashboard tab and the detail tab disagree. The detail tab wins here, on the
simple grounds that it is the one that can be counted.

| Dashboard claim | Status | What we publish |
|---|---|---|
| Current Library Hours — 3,000+ | **Unverifiable from this file** | Nothing. The Duration column is empty on all 293 rows, so hours cannot be derived. |
| Individual Assets — 1,200+ | **Contradicted** | 1,019 — the detail tab's own count and its own stated total. |
| Original Franchises — 20+ | Different metric | Both, separately. 20+ means originals; 293 counts every catalogue row. Not in conflict, and neither is printed as the other. |
| Programming Mix — News/Docs/Sports/Music/… % | **Empty** | Nothing. Every percentage cell is blank. |
| Rating — `MPAA;TV-MA` | **Not per title** | Nothing. The same value sits on all 293 rows, including news and HBCU sports, so it is a bulk default. TV-MA is also a TV Parental Guidelines rating, not an MPAA one. |
| Genre — `Pop, Urban, R&B, Alternative` | **Not per title** | Nothing. Identical on all 293 rows. |

The 3,000-hour figure is the one to be careful with, because it is the number a
distributor will repeat back. On a 1,019-asset library it implies a ~2h55m
average runtime, which does not match a catalogue whose largest strands are
podcasts, interviews and short-form clips. It may well be true of the raw
footage. It is not supported by this file, so it does not go in a deck.

The inventory tab has a column-shift problem of its own: each row carries five
values against seven headers (`Franchise, Genre, Episodes, Avg Runtime, Hours,
Rights, Status`). `Crown Source | News | 30 | Owned | Active` could be 30
episodes or a 30-minute average. The numbers — 30, 30, 30, 90, 60, 45, 120 —
read like runtimes, but reading is not knowing, so the value is carried as
`unattributedNumber` and shown with its ambiguity rather than labelled.

## The titles problem

This is the gap flagged on the 7 Oct call: on the site, articles and videos
have been carrying filenames where titles should be.

The catalogue has the same issue at source. Alongside properly titled rows sit
working file IDs: `news_final`, `pnc_v`, `ep_bike_life`, `promo_young_thug_polaris`,
`billy_blue`, `whh_rothschild`, `hs_jonb`, `zebfinal`, `meth_kids`, `avcar`.
A hand count of the detail tab puts it around **seventy of the 293 rows** —
approximate, because it is a judgement call on a handful (`Milano`, `nigel`,
`chase`) that could be either a title or a working name. Several are real
multi-asset strands.

These are **not** given titles here. A filename is an internal content ID. We
do not infer an artist, a topic, or a story from one — `meth_kids` is a file
name, and anything we wrote from it would be invention. Five such rows carry
three or more assets and are therefore schedulable strands that cannot be
scheduled until POLARIS supplies titles:

| File ID | Type | Assets |
|---|---|---:|
| `news_final` | Long Form | 4 |
| `pnc_v` | Long Form | 4 |
| `white_house_anti_gun` | Long Form | 4 |
| `ep_bike_life` | Long Form | 3 |
| `promo_young_thug_polaris` | Long Form | 3 |
| `billy_blue` | Series | 3 |

**Ask:** a title, a one-line synopsis and an on-air strand for each. That is a
short list and it unblocks real programming.

## The rights picture

This is the finding that matters most, and it is a structural one rather than a
list of problems.

A large share of the catalogue is press and junket material: red-carpet
interviews, premiere Q&As, trailers, award-show coverage, label release events,
and segments from other companies' shows. For an entertainment news operation
that is entirely normal — it is how the beat works. But **press access to cover
something is not a licence to carry it on a 24/7 channel.** Junket footage
typically arrives under terms that permit news and promotional use, often with
a window, and often excluding linear carriage and FAST distribution. Those are
exactly the two things the business plan depends on.

Rows naming another rights holder in the title itself, grouped by who would
have to clear them:

| Rights holder | Titles in the catalogue |
|---|---|
| SMACK / Ultimate Rap League | `SMACK URL` — **200 assets**, the single largest strand |
| SiriusXM | `Havoc from Mobb Deep Sirius Sattelite Radio Show` — 21 assets |
| Paramount / MTV | `The MTV Effect: The First Hip-Hop Podcast` — 4 assets |
| Sway's Universe | `SwaysUniverse:DoomsdayCypher` Pt. 1–3, `SwaysUniverse:DeLaSoul` |
| Disney / Hulu | `DaveEastOnWu-TangHuluShow`, `wu_tang_dave_east_hulu` |
| Amazon MGM / Orion | `American Fiction` (×3 + Oscars edition), `Blink Twice` (×2 + interviews), `Nickle Boys` (×2), `Rob Peace` (×3) |
| Warner Bros. Discovery | `Movies:KrushGroove`, `Shorts:RickRossAndMeekMillOnTNT`, `crime_wbd` |
| NBCUniversal | `SNL50 Jay Pharaoh and Xzibit` |
| Revolt | `Shorts: Behind The Scenes Of Drink Champs` |
| Michael Jackson estate | `Steve Manning, The Man Behind Michael Jackson` (17), `Michael Jackson Tribute Film`, `promo_steve_mj_velvet_rope` |
| King estate | `MLK Now`, `mlknow` |
| Labels (master + publishing) | `music_video_pushat_darkest`, `music_video_offset_swing`, `MusicVideo:WriteToDreamRobMarkman`, `TheBestInToday'sMusicVideo` |
| Promoters / artists (live capture) | `LIVE:LaurynHill`, `LIVE: Freeway`, `LIVE:T-Pain`, `LIVE:RollingLoud2022` |
| Haute Living | `Haute With DJ Khaled`, `HauteLiving: Rick Ross` |

Two consequences:

1. **The largest strand is the least certain.** SMACK / URL is 200 of 1,019
   assets — a fifth of the library by count and the thing a distributor would
   anchor a schedule on. A spreadsheet row saying it is in the catalogue is not
   a carriage right. Until there is a written agreement with SMACK/URL, the
   24/7 grid has a fifth of its inventory unaccounted for.
2. **The MTV Effect confirms the pattern is already live.** That title matches
   the asset already held on the site for carrying MTV on-screen branding. The
   catalogue and the gate reached the same conclusion independently, which is
   the gate working, and it means the branding issue is not hypothetical.

Separately, `att`, `brand_attt_dib_final` and `pnc_v` look like branded
deliverables for AT&T and PNC. If those air, they are sponsored content and
must be labelled as such — the firewall rule applies to inherited inventory
exactly as it applies to new sales.

### What the rights pass needs

A row-by-row clearance review of all 293, run by qualified counsel, recording
for each: the rights holder, the grant actually held (news/promotional vs.
distribution), any window, any territory limit, and whether it covers linear
carriage and FAST. Until a row has that record, it is inventory, not schedule.
The product already enforces this: `checkEligibility` fails closed, and
`thirdPartyConfirmed` cannot be bypassed by beta preview.

Qualified broadcast counsel and music-licensing professionals must approve the
final operating model. Nothing in this document is a legal opinion.

## What is usable today

Three things come out of this file clean and go straight into the product.

**The 28-day grid.** Seven dayparts × seven days, with all four weeks identical
in the source. Stored as one week and expanded to 196 cells, so the weeks
cannot drift apart. `Crown Source` holds 12–3p every weekday; prime is
originals, film and event.

**The rotation rules.** Premiere cadence, repeat window and refresh period per
category — daily news on a 24–48h repeat, features on 21–30 days, films on
28–35. This is the part of the book a distributor actually reads, and it is
specific enough to schedule against.

**The named franchises.** Fourteen strands with real, counted episode orders,
led by Whoo's House (150), Behind the Rhyme (107) and Rap on Wrestling (67).
These are the strands that make a 24/7 channel plausible, and three of them are
marked Owned on the inventory tab.

## Open questions for Rahman

1. Titles and synopses for the six untitled multi-asset strands above.
2. The SMACK / URL agreement — does one exist in writing, and what does it
   cover?
3. For the junket and premiere material: what do the access agreements actually
   grant? News use only, or distribution?
4. Where does 3,000 hours come from? If there is a runtime export, the Duration
   column can be filled and the figure becomes publishable.
5. The inventory tab's shifted column — are those episode counts or average
   runtimes?
6. Is the Amagi-equivalent playout capability software or hardware? (Raised on
   the 7 Oct call and still open. It decides whether the current vendor is
   replaceable or whether hardware has to be bought.)
