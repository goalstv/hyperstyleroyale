# RAP TRENDS — the ingestion layer

How real data reaches the Index, and what stops it lying on the way in.

## The problem this solves

The Index engine is good and the data behind it is invented. Every one of the
fifteen signals is simulated, the public surface carries a standing "Simulated
data" banner, and `robots.txt` is `Disallow: /`. The engine is not the gap —
inputs are.

This layer supplies them. It does not touch `index-engine.ts`, and that is
deliberate: the engine is pure, deterministic and covered by 35 tests, and those
properties are exactly what the transparency claim rests on.

## The rule

> A number may only reach `SignalBundle` if we can say where it came from, when
> it was observed, and what URL a reader could check it against.

`makeObservation` returns `null` rather than an observation with no source URL.
There is no code path that produces an uncited reading, so "we'll add the source
later" is not something a future edit can quietly do.

## Shape

```
src/lib/ingest/
  types.ts        RawObservation, Fetcher, SourceResult
  http.ts         the network boundary — httpFetcher and fixtureFetcher
  observation.ts  scaling (passthrough / linear / log10) and construction
  resolve.ts      name → roster artist, with the common-word guard
  normalize.ts    observations → SignalBundle + coverage
  snapshot.ts     freeze, digest and replay
  run.ts          one ingest run, returning a report
  sources/
    musicbrainz.ts   identity spine
    bandsintown.ts   concert_demand + bureau events
src/lib/enrich/
  facts.ts         SourcedFact<T> — a fact cannot exist without a citation
  from-sources.ts  per-upstream fact sheets
src/lib/city-events.ts   per-bureau upcoming dates
```

Adapters take a `Fetcher` rather than calling `fetch`, so every parser and every
scaling decision is tested against recorded fixtures with no network involved.

## Why sentiment is not here

News and text-analysis APIs were considered for the `social_conversation` and
`editorial_assessment` signals. Entity extraction is in scope; **sentiment
scoring as an Index input is not.**

These look like one category of tool and are two kinds of claim:

- *"This article mentions Rick Ross"* — a countable fact, checkable against the
  source URL by anyone.
- *"This article is 0.62 negative about Rick Ross"* — a proprietary model's
  judgement about a real, named, living person.

If sentiment becomes a weighted input, a real artist's chart position is being
moved by a black box, and the transparency claim now rests on something nobody
can audit, including us. It is the same hazard as the manipulation flags, which
are already guarded so that no anomaly indicator renders beside a real artist's
name.

Sentiment belongs in editorial triage — telling the desk what to look at today.
The Index runs on countable facts.

## The common-word guard

Several real hip-hop names are ordinary English words: **Future**, **Common**,
**Nas**, **Drake**. A naive matcher promotes "the future of the label" into chart
movement for an identifiable person.

`resolveArtist` therefore fails toward dropping the observation. A name on the
corroboration list is only attributed when the surrounding text carries an
independent music cue, or an external identifier resolves it outright. An
ambiguous mention is worth nothing; a wrong one is worth less than nothing.

Two things learned building it, both caught by tests rather than by reading:

- **Weak cues are worse than no cues.** An early draft accepted "label" as
  evidence, so *"the future of the label"* corroborated itself. Cues are now
  strict, and the test that caught it is still there.
- **Substring matching is a trap.** `includes("rap")` also matches "wrapped",
  "rapport" and "therapy". Cues match on word boundaries.

## Scaling, and why it is recorded

Upstreams report in incompatible units — an event count of 0–40, a play count in
the millions. The engine wants 0–100. Each observation records the mapping used
(`passthrough`, `linear`, `log10`) alongside the raw upstream figure, so the
audit page can show the arithmetic rather than asking anyone to trust it.

`log10` is the default for counts because streaming and attendance figures are
power-law distributed; a linear map would flatten everyone below the top act.

Where several observations back one signal, they are **averaged, not maxed**.
Taking the max would let a single outlying source set an artist's position —
precisely the single-source dominance the engine's own fraud detector exists to
flag.

## Missing signals stay missing

`SignalBundle` is `Partial<Record<SignalKey, number>>` and that partiality is
load-bearing. A signal we did not observe is absent, never zero and never
guessed. `MIN_SIGNALS_FOR_PUBLICATION = 6` already refuses to publish a score
built on too few signals, so an honest gap is handled correctly downstream.

This is what makes an incremental launch possible: wire six real signals, leave
the rest dark, and the confidence scoring handles the partial coverage. The
simulated-data banner comes down signal by signal rather than all at once.

## Snapshots — what makes "transparent" provable

An automated pipeline with no record of its inputs is just a faster black box.

`scoreEntry` is pure: the same signals, profile, source registry and timestamp
always produce the same score. So `freezeSnapshot` records all four behind a
published chart, and `replaySnapshot` recomputes it and compares. `/trending/audit`
runs that check on every request and reports the result, including failure.

The source registry is frozen too, because the engine only counts signals from a
`connected` source — which sources were live is part of the arithmetic.

Editorial overrides are frozen with everything else, so removing one from the
record breaks the replay. A human intervention is part of the published result
and cannot be quietly dropped from the story.

**The digest is change-detection, not tamper-evidence.** `fnv1a64` is fast and
dependency-free and will catch accidental alteration. It will not stop deliberate
alteration. Before snapshots are published as an audit record, swap in SHA-256 —
it is computed over `stableStringify` output, so the hash function is the only
thing that changes.

## Sourced facts

The artist directory asserted only a name and a city, because those were the two
things that could be stated without inventing anything. `SourcedFact<T>` lifts
that constraint honestly: every field carries its own URL and retrieval time,
and `fact()` is the only constructor and returns `null` without a citation.

`mergeSheets` takes sheets in order of trust — MusicBrainz before TheAudioDB,
because MusicBrainz is editorially curated and its identifiers are what
everything else joins on.

## What is not done

- **No live source is connected.** The adapters are written and fixture-tested,
  but this session's egress policy blocks MusicBrainz, Bandsintown, TheAudioDB
  and Wikidata, so no parser has met a real response. Verify each against a live
  payload before enabling it in production. The parsers tolerate missing fields
  rather than assuming any are present, which limits the damage if a shape has
  drifted.
- **`EVENT_COUNT_REF_MAX` is a placeholder.** It sets where an event count maps
  to 100. Revisit it after a week of real ingest — and record the change, because
  it moves every score.
- **Nothing is persisted.** `runIngest` returns a report; storage is the caller's
  problem, which keeps the layer testable end to end.
- **The audit page freezes an empty observation list**, because there is nothing
  to freeze yet. It says so on the page rather than implying otherwise.
