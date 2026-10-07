# 27 — Why the Index is not publishing

The Index engine works. It has no inputs. This document says so in one place,
because the gap between those two facts is the single most important thing to
be straight about on this site.

## The bug

Thirteen of the fifteen signal sources were marked:

```ts
status: "connected", lastSyncIso: minutesAgoIso(24),
provider: "Licensed DSP analytics agreement (placeholder vendor)"
```

A vendor that does not exist, an agreement that was never signed, a connector
that has never run — and a timestamp saying it synced 24 minutes ago.

This was not a labelling slip, because `status` is not a label.
`index-engine.ts` counts a signal **only** if its source is `connected`:

```ts
sources.filter((s) => s.status === "connected")   // line 170 and line 213
```

So marking them connected meant synthetic signals produced full coverage, high
confidence, and a chart that passed `isPublishable`. The page footer said
demonstration data. The arithmetic said verified and live. `/trending/audit` —
the page whose entire job is to prove the chart reproduces — was reporting a
clean replay of a chart built on nothing.

Of everything on the site, the Index is the thing whose pitch is transparency.
It was the one surface making a claim it could not source.

## The second bug, on the deployed demo

The public chart read:

```
1. Simulated entry 01 — Kendrick Lamar
2. Simulated entry 02 — Future
3. Simulated entry 03 — Megan Thee Stallion
```

The ugly part is the song title. The serious part is the rest of the row.

An earlier pass had carefully avoided inventing *release titles* for real
artists, on the grounds that an invented title is a discography claim. That
reasoning was right and it stopped one row short. A rank, a composite score and
a confidence figure are also claims — about a named person's commercial
performance — and inventing those is exactly what "do not fabricate chart
performance" prohibits. Calling the record "Simulated entry 01" does not make
"#1, engagement quality 83" any less of a made-up statistic about Kendrick
Lamar.

So the title was never the problem. The score was.

## What it is now

**The registry tells the truth.** Nothing is connected. No source carries a sync
timestamp, because nothing has ever synced. The two not-connected reasons are
kept apart, because they have different fixes:

| Status | Meaning | Count |
|---|---|---:|
| `connected` | Live connector, has synced, contributes to scores | **0** |
| `pending_agreement` | Blocked on a counterparty's signature | 12 |
| `not_implemented` | No external blocker; waiting on our own build | 3 |

The three in the last row are search interest, audience voting and the
editorial board. Nobody has to sign anything for those — they need engineering
and, for the board, three editors. That distinction is the roadmap: twelve of
these are a business-development problem and three are a sprint.

**The engine produces the right outcome unaided.** Zero connected sources means
zero coverage, which means zero confidence, which means `isPublishable` refuses
every entry with a stated reason. No code was added to make the Index go quiet.
It went quiet because the inputs are honest now. That is the design working.

**`signalReadiness()` is the new headline.** The public surface leads with
"0 of 15 signals have a live source" and the agreement/build split. A
transparent index that admits it has no inputs yet is worth considerably more
than one showing positions it invented — and it is the version that survives a
journalist or a diligence team actually checking.

**The demo chart uses invented acts.** Sable Mercer, KP Verse, Ivory Lane and
the rest, with real release titles, framed as a worked example of the method.
The synthetic signal bundles were moved off the real artists and onto the
invented acts — the numbers were always synthetic, so attaching them to people
who do not exist is what makes them honest, and no new number was invented in
the process.

**Real artists keep their place.** All twenty stay in the directory with their
names, the scene notes, and their MusicBrainz facts — real MBID, real country,
real disambiguation, each with its own citable URL. What they no longer carry is
a signal bundle, which is the structural guard: no signals means nothing to
score, which means they cannot be ranked even by accident.

## The guards

`tests/index-readiness.test.ts`:

- No source may be `connected` without a recorded sync.
- No placeholder provider may be `connected`.
- A disconnected source may not carry a sync timestamp.
- Readiness must report 0 live, 15 total, and must account for every signal as
  live, agreement-blocked or build-blocked.
- Against the real registry, every entry must score zero contributions at zero
  confidence and fail `isPublishable` with a reason.
- On the deployed demo, additionally: no chart entry may belong to a real
  artist, and no real artist may carry a signal bundle.

One existing test had to change, and the way it broke is worth recording. The
snapshot replay test imported the production registry. Once nothing
contributed, every entry scored the same, so deleting an editorial override from
the record stopped moving any score and the tamper check silently went vacuous —
it still passed its `matches` assertion only because the *digest* caught the
removal. The test now builds its own all-connected fixture, because a unit test
of the audit trail should not change meaning when the commercial state of the
business changes, and it asserts the digest break and the score diff separately
since they fail independently.

## Turning a signal on

The order is: get the agreement, build the connector, write observations
through `makeObservation` (which returns `null` without a source URL, so an
uncited reading cannot enter), flip that one source to `connected` with a real
`lastSyncIso`, and watch readiness go to 1 of 15.

`SignalBundle` is `Partial<Record<SignalKey, number>>` and
`MIN_SIGNALS_FOR_PUBLICATION` is 6, so partial coverage is handled correctly all
the way up: six real signals and the Index starts publishing with honest
confidence while the other nine stay dark. It comes on signal by signal, not all
at once.

The cheapest first one is probably the editorial board — no counterparty, no
API, three editors and a form. It is also the signal that makes the rest of the
chart defensible, because it is the one a human can explain.

Qualified counsel should review any data-licensing agreement before a source is
connected.
