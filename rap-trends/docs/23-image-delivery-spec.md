# RAP TRENDS — image delivery specification

For the POLARIS desk and anyone else filing images to raptrends.com.

This is a short document on purpose. Two sections: the technical spec, and the provenance
record. The second one is the part that actually stops stories from being pulled.

## 1. Technical spec

| | Requirement |
|---|---|
| **Aspect ratio** | **16:9**, tolerance ±2%. Everything on the site is a 16:9 card. |
| **Minimum size** | **1600 × 900** |
| **Preferred size** | **2400 × 1350** |
| **Maximum file size** | **400 KB** after conversion. Send the original if it is bigger; we convert. |
| **Formats** | JPEG (quality 80–85), PNG, or WebP. PNG only for flat-colour graphics. |
| **Colour space** | sRGB. Not Adobe RGB, not P3 — they shift on the web. |
| **Filename** | The article slug: `camron-pulls-up-to-the-keffe-d-trial.jpg` |

**Framing.** Cards crop. Keep the subject inside the centre 80% of the frame both ways, and
faces inside the middle third horizontally. Anything at the edge will be cut on some layout.

**Nothing burned into the image.** No headline, no caption, no lower third, no date stamp, no
social handles. The site renders all of that in live text, so burned-in text is duplicated,
untranslatable, unreadable to screen readers, and wrong the moment a headline is edited.

**No third-party bug, watermark or channel ident.** This is not a style rule. A rival
broadcaster's mark means we are publishing footage we have no rights to. Five of the first ten
video assets carried one — Apple Music, MTV, an NBC affiliate, Law&Crime, a YouTube overlay —
and all five had to be pulled from the public site.

A **POLARIS** bug is fine. It identifies who filed the material. But note the trap: a POLARIS
bug on the *same frame* as another broadcaster's bug means POLARIS re-cut someone else's feed.
The partner mark tells you who published the edit, not who owns the footage.

**Cropping a bug out does not clear the rights.** It only hides the evidence.

## 2. Provenance record — required with every image

Every image needs these five fields. An image without them cannot be published, no matter how
good it is.

| Field | Example |
|---|---|
| **Who shot it** | "POLARIS field team, Las Vegas" / "Court pool camera" / "Getty" |
| **Where it came from** | "Filed direct from the courtroom" / "Frame grab from the Law&Crime feed" |
| **Date and place** | "Las Vegas, 27 August 2026" |
| **Licence** | "POLARIS original, cleared" / "Licensed, Getty #12345" / "Not cleared" |
| **People shown** | Names of anyone identifiable, and whether a release exists where one is needed |

"I got it off the stream" is a complete and useful answer. It is not a problem to say so — it
is a problem to *not* say so and have it discovered after publication.

## 3. Photographs versus illustrations

The site distinguishes these, and they carry different credit lines.

**Photograph** — a real image of a real event. Runs with a plain factual caption naming what it
shows. This is what we want for news, always.

**Illustration** — the non-depictive editorial artwork the site currently uses where no
photograph exists: empty courtrooms, unattended microphones, studio interiors. Always runs with
*"Illustration. Not a photograph of the events described."*

**Never generate a photorealistic image of a real person.** On a story about an active
prosecution, a synthetic image of someone named in it functions as fabricated evidence
regardless of the caption. If we have no photograph, we run the illustration and say so.

Generated imagery also invents text on any surface that could hold it. Of seventeen images
generated for the site, four were rejected for fake broadcaster names on microphone flags, a
legible-looking legal document, an invented building sign, and a fabricated record label. A
fifth was rejected for a human arm at the edge of frame. Every generated image gets looked at
and zoomed into before it ships.

## 4. Where to put them

Drop files in the shared **Images** folder, named to match the article slug, with the provenance
fields in the article document alongside the copy.

One image per article is enough. If a story needs a gallery, say so and we will build one — do
not send fifteen files and expect the right one to be picked.

## 5. What we do with a file that misses the spec

We publish it anyway if the story needs it, at whatever quality it arrives, and we record the
shortfall against the asset. Nothing is silently upscaled — an 800px image stretched to 2400px
looks worse than an 800px image shown small, and pretending it is high resolution helps nobody.

`src/lib/image-spec.ts` checks these rules mechanically. The first supplied photograph,
`cam.png`, is 704 × 657 — roughly 1:1 and well under the minimum — so it runs cropped to 16:9 at
native resolution with the shortfall recorded.
