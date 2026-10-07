/**
 * Key art and social card composition.
 *
 * The problem this solves, stated plainly: the catalogue holds 1,019 assets and
 * roughly fifteen promo images, several of which are screen grabs rather than
 * designed art. Stories reach the site with a clean photograph and no cover
 * graphic, so the headline lives only in the page's HTML. Off the page — in a
 * feed, a carousel, an EPG tile — there is nothing to look at.
 *
 * The fix is a composition layer, not a change to what the desk files.
 * `docs/23-image-delivery-spec.md` requires source images to carry no burned-in
 * text, and that rule stands: a headline baked into an archival asset is wrong
 * the moment the headline is edited, invisible to screen readers, and
 * untranslatable. So the headline is composited into a *derived* asset instead,
 * computed from live text at export time and regenerated whenever the headline
 * changes.
 *
 * This module does the geometry and the validation. It does not rasterise.
 * It hands a renderer — sharp, Canva, Photoshop scripting, whatever runs the
 * job — a set of boxes and a type size that are known to fit, and it refuses
 * the combinations that would not.
 *
 * Everything here is pure. No I/O, no clock, no randomness.
 */

/* ----------------------------------------------------------------- formats */

export type SurfaceId =
  /** Site hero and EPG tile. */
  | "hero_16x9"
  /** Video card with a play affordance. */
  | "thumb_16x9"
  /** Square social post. */
  | "social_1x1"
  /** Portrait feed post, the highest-reach shape on most networks. */
  | "social_4x5"
  /** Full-bleed story / short-form vertical. */
  | "story_9x16";

export interface Surface {
  id: SurfaceId;
  width: number;
  height: number;
  /**
   * Fraction of the shortest edge kept clear of type on every side. Feed UI
   * overlays the bottom of a vertical post, so verticals reserve more.
   */
  marginRatio: number;
  /** Fraction of the height the headline block may occupy. */
  headlineBandRatio: number;
  /** Largest headline this surface should carry, in characters. */
  maxHeadlineChars: number;
}

/**
 * The five surfaces we actually publish. 16:9 matches the site's card grid
 * (doc 23); 1:1 and 4:5 are the feed shapes; 9:16 is story and short-form.
 */
export const SURFACES: Record<SurfaceId, Surface> = {
  hero_16x9: { id: "hero_16x9", width: 2400, height: 1350, marginRatio: 0.06, headlineBandRatio: 0.34, maxHeadlineChars: 90 },
  thumb_16x9: { id: "thumb_16x9", width: 1600, height: 900, marginRatio: 0.06, headlineBandRatio: 0.3, maxHeadlineChars: 70 },
  social_1x1: { id: "social_1x1", width: 1440, height: 1440, marginRatio: 0.08, headlineBandRatio: 0.32, maxHeadlineChars: 70 },
  social_4x5: { id: "social_4x5", width: 1440, height: 1800, marginRatio: 0.08, headlineBandRatio: 0.3, maxHeadlineChars: 80 },
  story_9x16: { id: "story_9x16", width: 1080, height: 1920, marginRatio: 0.09, headlineBandRatio: 0.26, maxHeadlineChars: 60 },
};

export const SURFACE_IDS = Object.keys(SURFACES) as SurfaceId[];

/* -------------------------------------------------------------- the lockup */

export interface Box {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Lockup {
  surface: Surface;
  /** Where the source photograph is drawn. Always full bleed. */
  image: Box;
  /**
   * Darkened gradient behind the type. Without it, headline contrast depends
   * on whatever happens to be in the lower third of the photograph, which is
   * not a thing we control.
   */
  scrim: Box;
  /** Where the headline sets. */
  headline: Box;
  /** Where the network mark sits. */
  logo: Box;
  /** Optional strand or section label above the headline. */
  eyebrow: Box;
  /** Type size for the headline, in pixels, that fits `headline`. */
  headlineSizePx: number;
  /** Lines the headline will occupy at that size. */
  headlineLines: number;
}

/** Headline type ramp as a fraction of surface height, largest first. */
const TYPE_RAMP = [0.085, 0.075, 0.066, 0.058, 0.051] as const;

/** Oswald at 600 weight sets at roughly this fraction of its size per glyph. */
const AVG_GLYPH_RATIO = 0.52;

const LINE_HEIGHT = 1.08;

/**
 * Longest line produced by greedy word wrapping at `charsPerLine`, plus the
 * number of lines. Greedy is what every renderer does, so measuring any other
 * way would under-report.
 */
export function wrapWidth(headline: string, charsPerLine: number): { lines: number; longest: number } {
  if (charsPerLine < 1) return { lines: 0, longest: 0 };
  const words = headline.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return { lines: 0, longest: 0 };

  let lines = 1;
  let current = 0;
  let longest = 0;

  for (const word of words) {
    const needed = current === 0 ? word.length : current + 1 + word.length;
    if (needed <= charsPerLine || current === 0) {
      current = needed;
    } else {
      longest = Math.max(longest, current);
      lines += 1;
      current = word.length;
    }
  }
  return { lines, longest: Math.max(longest, current) };
}

/**
 * Lay out one surface. Returns null when the headline cannot be set legibly at
 * any size on the ramp — the caller shortens it rather than shipping type too
 * small to read on a phone.
 */
export function layout(surfaceId: SurfaceId, headline: string, opts: { eyebrow?: boolean } = {}): Lockup | null {
  const surface = SURFACES[surfaceId];
  const trimmed = headline.trim();
  if (!trimmed) return null;
  if (trimmed.length > surface.maxHeadlineChars) return null;

  const shortEdge = Math.min(surface.width, surface.height);
  const margin = Math.round(shortEdge * surface.marginRatio);
  const contentWidth = surface.width - margin * 2;
  const bandHeight = Math.round(surface.height * surface.headlineBandRatio);

  const logoHeight = Math.round(shortEdge * 0.055);
  const logoWidth = Math.round(logoHeight * 4.2);
  const eyebrowHeight = opts.eyebrow ? Math.round(shortEdge * 0.03) : 0;
  const gap = Math.round(shortEdge * 0.018);

  // The headline gets what is left of the band once the mark, the eyebrow and
  // the gaps between them have taken their share.
  const headlineHeight = bandHeight - logoHeight - eyebrowHeight - gap * (opts.eyebrow ? 3 : 2);
  if (headlineHeight <= 0) return null;

  for (const ratio of TYPE_RAMP) {
    const sizePx = Math.round(surface.height * ratio);
    const charsPerLine = Math.floor(contentWidth / (sizePx * AVG_GLYPH_RATIO));
    if (charsPerLine < 8) continue;

    const { lines } = wrapWidth(trimmed, charsPerLine);
    if (lines === 0 || lines > 3) continue;

    const blockHeight = Math.round(sizePx * LINE_HEIGHT * lines);
    if (blockHeight > headlineHeight) continue;

    const bandTop = surface.height - margin - bandHeight;
    const logoY = bandTop;
    const eyebrowY = logoY + logoHeight + gap;
    const headlineY = eyebrowY + eyebrowHeight + (opts.eyebrow ? gap : 0);

    return {
      surface,
      image: { x: 0, y: 0, width: surface.width, height: surface.height },
      // The scrim starts above the band so the gradient has room to ramp
      // rather than appearing as a hard edge across the picture.
      scrim: {
        x: 0,
        y: Math.max(0, bandTop - Math.round(surface.height * 0.12)),
        width: surface.width,
        height: surface.height - Math.max(0, bandTop - Math.round(surface.height * 0.12)),
      },
      headline: { x: margin, y: headlineY, width: contentWidth, height: blockHeight },
      logo: { x: margin, y: logoY, width: logoWidth, height: logoHeight },
      eyebrow: { x: margin, y: eyebrowY, width: contentWidth, height: eyebrowHeight },
      headlineSizePx: sizePx,
      headlineLines: lines,
    };
  }

  return null;
}

/* ------------------------------------------------------------- the job spec */

export interface KeyArtRequest {
  /** Internal content ID. Never used as a title. */
  contentId: string;
  headline: string;
  eyebrow?: string;
  /** Source image path. Must already satisfy doc 23. */
  sourceImage: string;
  /** Whether the underlying asset is cleared for public display. */
  publiclyEligible: boolean;
}

export interface KeyArtPlan {
  contentId: string;
  surfaces: Array<{ id: SurfaceId; lockup: Lockup }>;
  /** Surfaces the headline would not fit, with the reason. */
  rejected: Array<{ id: SurfaceId; reason: string }>;
  /** Set when nothing may be produced at all. */
  blocked?: string;
  /**
   * Always true. Composited cards carry the network mark and a headline, so
   * they read as published output and go to a human before they go out.
   */
  requiresHumanReview: true;
}

/**
 * Plan the full set of derived cards for one story.
 *
 * Fails closed in two directions. An asset that is not publicly eligible
 * produces nothing — key art is a public artefact, and generating a shareable
 * card for gated footage would route around the rights gate rather than
 * respect it. And a headline that will not set legibly is reported, not
 * shrunk until it technically fits.
 */
export function planKeyArt(request: KeyArtRequest, surfaces: SurfaceId[] = SURFACE_IDS): KeyArtPlan {
  const plan: KeyArtPlan = {
    contentId: request.contentId,
    surfaces: [],
    rejected: [],
    requiresHumanReview: true,
  };

  if (!request.publiclyEligible) {
    plan.blocked = "Asset is not cleared for public display. No shareable card is produced.";
    return plan;
  }
  if (!request.sourceImage) {
    plan.blocked = "No source image. Key art is never generated from nothing.";
    return plan;
  }
  if (!request.headline.trim()) {
    plan.blocked = "No headline. A filename is not a headline and is never used as one.";
    return plan;
  }

  for (const id of surfaces) {
    const lockup = layout(id, request.headline, { eyebrow: Boolean(request.eyebrow) });
    if (lockup) {
      plan.surfaces.push({ id, lockup });
    } else {
      const max = SURFACES[id].maxHeadlineChars;
      plan.rejected.push({
        id,
        reason:
          request.headline.trim().length > max
            ? `Headline is ${request.headline.trim().length} characters; ${id} takes ${max}.`
            : `Headline will not set in three lines or fewer on ${id}.`,
      });
    }
  }

  return plan;
}
