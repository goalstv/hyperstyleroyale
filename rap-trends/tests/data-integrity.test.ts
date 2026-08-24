import { describe, expect, it } from "vitest";
import { ARTISTS } from "@/data/artists";
import { CHART_ENTRIES, NEXT_UP_ENTRIES } from "@/data/chart";
import { CITIES } from "@/data/cities";
import { ARTICLES } from "@/data/articles";
import { SHOWS, EPISODES } from "@/data/shows";
import { MEDIA_ASSETS, RIGHTS_WINDOWS } from "@/data/media";
import { AFFILIATE_PACKAGES, ENDPOINTS, SYNDICATED_FORMATS } from "@/data/distribution";
import { CAMPAIGNS, SPONSOR_OPPORTUNITIES, SUBMISSION_PLANS } from "@/data/monetization";
import { DRIVE_SYNC } from "@/data/ops";
import { INDEX_SOURCES } from "@/data/index-sources";
import { ROLE_PERMISSIONS, can, isStaffRole, permissionsFor } from "@/lib/roles";
import { DEFAULT_PROFILE } from "@/lib/index-engine";

/**
 * These are the guarantees the brief makes to anyone looking at the product:
 * the dataset is complete, it is honestly labelled, and the commercial firewall
 * is real rather than decorative.
 */

describe("dataset completeness", () => {
  it("ships at least the required sample volumes", () => {
    expect(ARTISTS.length).toBeGreaterThanOrEqual(20);
    expect(CHART_ENTRIES.length).toBeGreaterThanOrEqual(10);
    expect(SHOWS.length).toBeGreaterThanOrEqual(8);
    expect(CITIES.length).toBeGreaterThanOrEqual(5);
    expect(ARTICLES.length).toBeGreaterThanOrEqual(10);
    expect(SPONSOR_OPPORTUNITIES.length).toBeGreaterThanOrEqual(5);
    expect(AFFILIATE_PACKAGES.length).toBeGreaterThanOrEqual(3);
    expect(SUBMISSION_PLANS.length).toBeGreaterThanOrEqual(3);
  });

  it("keeps identifiers unique across every collection", () => {
    const collections: [string, { id: string }[]][] = [
      ["artists", ARTISTS], ["chart", CHART_ENTRIES], ["next up", NEXT_UP_ENTRIES],
      ["cities", CITIES], ["articles", ARTICLES], ["shows", SHOWS], ["episodes", EPISODES],
      ["assets", MEDIA_ASSETS], ["rights", RIGHTS_WINDOWS], ["endpoints", ENDPOINTS],
      ["campaigns", CAMPAIGNS], ["formats", SYNDICATED_FORMATS], ["drive", DRIVE_SYNC],
    ];
    for (const [name, rows] of collections) {
      expect(new Set(rows.map((r) => r.id)).size, `${name} has duplicate ids`).toBe(rows.length);
    }
  });

  it("keeps slugs unique and URL-safe", () => {
    for (const rows of [ARTISTS, CITIES, SHOWS, ARTICLES]) {
      const slugs = rows.map((r) => (r as { slug: string }).slug);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const slug of slugs) expect(slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it("resolves every foreign key", () => {
    const artistIds = new Set(ARTISTS.map((a) => a.id));
    const cityIds = new Set(CITIES.map((c) => c.id));
    const showIds = new Set(SHOWS.map((s) => s.id));
    const assetIds = new Set(MEDIA_ASSETS.map((a) => a.id));

    for (const entry of [...CHART_ENTRIES, ...NEXT_UP_ENTRIES]) {
      expect(artistIds.has(entry.artistId), `${entry.id} artist`).toBe(true);
      expect(cityIds.has(entry.cityId), `${entry.id} city`).toBe(true);
    }
    for (const artist of ARTISTS) expect(cityIds.has(artist.cityId), `${artist.id} city`).toBe(true);
    for (const article of ARTICLES) {
      for (const id of article.artistIds) expect(artistIds.has(id), `${article.id} artist ${id}`).toBe(true);
      for (const id of article.cityIds) expect(cityIds.has(id), `${article.id} city ${id}`).toBe(true);
      for (const id of article.relatedAssetIds) expect(assetIds.has(id), `${article.id} asset ${id}`).toBe(true);
    }
    for (const episode of EPISODES) {
      expect(showIds.has(episode.showId)).toBe(true);
      expect(assetIds.has(episode.assetId)).toBe(true);
    }
    for (const w of RIGHTS_WINDOWS) expect(assetIds.has(w.assetId), `rights ${w.id}`).toBe(true);
  });

  it("links every explicit asset that has a clean variant to a real asset", () => {
    const ids = new Set(MEDIA_ASSETS.map((a) => a.id));
    for (const asset of MEDIA_ASSETS) {
      if (asset.cleanVersionAssetId) {
        expect(ids.has(asset.cleanVersionAssetId), `${asset.id} clean variant`).toBe(true);
      }
    }
  });
});

describe("data is never passed off as verified", () => {
  it("labels every seeded record as demonstration data", () => {
    const provenanced = [...ARTISTS, ...CHART_ENTRIES, ...NEXT_UP_ENTRIES, ...CITIES, ...ARTICLES, ...SHOWS, ...MEDIA_ASSETS];
    for (const row of provenanced) {
      expect(row.provenance, `${(row as { id: string }).id} is not labelled`).toBe("demo");
    }
  });

  it("does not claim any executed carriage agreement", () => {
    for (const endpoint of ENDPOINTS) {
      if (["cable", "ota", "fast"].includes(endpoint.platform)) {
        expect(["prospect", "provisioning", "paused"], `${endpoint.id} claims carriage`).toContain(endpoint.status);
      }
    }
  });
});

describe("the Index cannot be gamed by configuration", () => {
  it("keeps the weight profile summing to one", () => {
    const total = Object.values(DEFAULT_PROFILE.weights).reduce((s, w) => s + w, 0);
    expect(total).toBeCloseTo(1, 5);
  });

  it("declares a legal basis for every source", () => {
    for (const source of INDEX_SOURCES) {
      expect(source.authorization).toBeTruthy();
      expect(source.provider.length).toBeGreaterThan(0);
    }
  });

  it("keeps at least one source honestly marked as unlicensed", () => {
    // The seed deliberately includes a signal we have not contracted for, so the
    // "excluded, not estimated" behaviour is visible on the public methodology page.
    expect(INDEX_SOURCES.some((s) => s.status !== "connected")).toBe(true);
  });

  it("has a weight defined for every signal the profile scores", () => {
    for (const key of Object.keys(DEFAULT_PROFILE.weights)) {
      expect(INDEX_SOURCES.some((s) => s.key === key), `no source for ${key}`).toBe(true);
    }
  });
});

describe("the commercial firewall", () => {
  it("states on every plan that editorial is not for sale", () => {
    for (const plan of SUBMISSION_PLANS) {
      expect(plan.editorialGuarantee.length).toBeGreaterThan(20);
      expect(plan.editorialGuarantee.toLowerCase()).toMatch(/not buy|never|same editors|separate/);
    }
  });

  it("gives no commercial role any editorial write permission", () => {
    for (const role of ["ad_sponsorship_manager", "affiliate_manager", "analytics_viewer"] as const) {
      expect(can([role], "newsroom.write")).toBe(false);
      expect(can([role], "newsroom.publish")).toBe(false);
      expect(can([role], "newsroom.approve")).toBe(false);
    }
  });
});

describe("role model", () => {
  it("keeps the journalist role away from air, rights, and revenue", () => {
    const forbidden = [
      "schedule.write", "channel.control", "channel.emergency", "distribution.write",
      "ads.write", "rights.write", "users.manage", "newsroom.publish", "newsroom.approve",
    ] as const;
    for (const permission of forbidden) {
      expect(can(["journalist"], permission), `journalist should not have ${permission}`).toBe(false);
    }
  });

  it("gives the journalist exactly what reporting needs", () => {
    expect(permissionsFor(["journalist"])).toEqual(
      new Set(["os.view", "newsroom.read", "newsroom.write", "media.read", "analytics.read"]),
    );
  });

  it("gives the founder every permission", () => {
    const all = new Set(Object.values(ROLE_PERMISSIONS).flat());
    expect(permissionsFor(["founder_admin"]).size).toBe(all.size);
  });

  it("keeps audience-facing roles out of the console entirely", () => {
    for (const role of ["artist", "affiliate", "member"] as const) {
      expect(isStaffRole(role)).toBe(false);
      expect(can([role], "os.view")).toBe(false);
    }
  });

  it("unions permissions across multiple roles", () => {
    const combined = permissionsFor(["journalist", "social_producer"]);
    expect(combined.has("newsroom.write")).toBe(true);
    expect(combined.has("distribution.read")).toBe(true);
    expect(combined.has("channel.control")).toBe(false);
  });

  it("requires master-control rights for the emergency override", () => {
    expect(can(["master_control"], "channel.emergency")).toBe(true);
    expect(can(["programming_director"], "channel.emergency")).toBe(false);
    expect(can(["editor_in_chief"], "channel.emergency")).toBe(false);
  });
});

describe("Google Drive ingestion", () => {
  it("marks a re-uploaded file as a duplicate rather than importing it twice", () => {
    const duplicate = DRIVE_SYNC.find((r) => r.status === "duplicate");
    expect(duplicate).toBeDefined();
    const original = DRIVE_SYNC.find(
      (r) => r.id !== duplicate!.id && r.matchedArticleId === duplicate!.matchedArticleId && r.status !== "duplicate",
    );
    expect(original, "a duplicate must reference an original").toBeDefined();
  });

  it("preserves the original Drive link on every record", () => {
    for (const record of DRIVE_SYNC) {
      expect(record.driveLink).toMatch(/^https:\/\/drive\.google\.com\//);
    }
  });

  it("never treats an AI suggestion as applied metadata", () => {
    for (const record of DRIVE_SYNC) {
      if (!record.aiSuggestions) continue;
      // A suggestion must be attached to a record awaiting a human, never to a
      // finished one — nothing publishes off the back of a suggestion.
      expect(["imported", "matched", "detected"]).toContain(record.status);
    }
  });
});
