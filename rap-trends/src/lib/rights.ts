import type {
  MediaAsset,
  Platform,
  RestrictedCategory,
  RightType,
  RightsWindow,
} from "./types";

/**
 * Rights gate.
 *
 * Nothing leaves RAP TRENDS without passing through here. The gate is designed
 * to fail closed: a missing rights record is treated as "not cleared", never as
 * "probably fine".
 */

export const RIGHT_LABELS: Record<RightType, string> = {
  master_recording: "Master recording licence",
  publishing: "Music publishing",
  music_video_exhibition: "Music-video exhibition",
  synchronization: "Synchronization",
  public_performance: "Public performance",
  digital_performance: "Digital performance",
  mechanical: "Mechanical",
  archival_footage: "Archival footage",
  ugc_license: "User-generated content licence",
};

/** Which rights each destination class actually requires. */
export const PLATFORM_REQUIREMENTS: Record<Platform, RightType[]> = {
  web: ["master_recording", "publishing", "digital_performance"],
  ios: ["master_recording", "publishing", "digital_performance"],
  android: ["master_recording", "publishing", "digital_performance"],
  ctv_app: ["master_recording", "publishing", "digital_performance", "music_video_exhibition"],
  fast: ["master_recording", "publishing", "music_video_exhibition", "public_performance"],
  cable: ["master_recording", "publishing", "music_video_exhibition", "public_performance"],
  ota: ["master_recording", "publishing", "music_video_exhibition", "public_performance"],
  vmvpd: ["master_recording", "publishing", "music_video_exhibition", "public_performance"],
  youtube: ["master_recording", "publishing", "synchronization"],
  social: ["master_recording", "publishing", "synchronization"],
  podcast: ["master_recording", "publishing", "mechanical"],
  radio_affiliate: ["master_recording", "publishing", "public_performance"],
  internet_radio: ["master_recording", "publishing", "digital_performance"],
};

/** Destinations that must carry captions to be compliant. */
export const CAPTION_REQUIRED: Platform[] = ["fast", "cable", "ota", "vmvpd", "ctv_app", "web"];

/** Destinations where the clean feed is the only acceptable variant. */
export const CLEAN_ONLY: Platform[] = ["ota", "cable", "radio_affiliate"];

export interface EligibilityInput {
  asset: MediaAsset;
  window: RightsWindow | undefined;
  platform: Platform;
  territory: string;
  atIso: string;
}

export interface EligibilityResult {
  eligible: boolean;
  blockers: string[];
  warnings: string[];
  missingRights: RightType[];
  expiresIso: string | null;
  /** Days until the licence lapses; negative means already lapsed. */
  daysRemaining: number | null;
}

export function checkEligibility(input: EligibilityInput): EligibilityResult {
  const { asset, window, platform, territory, atIso } = input;
  const blockers: string[] = [];
  const warnings: string[] = [];
  let missingRights: RightType[] = [];

  if (!window) {
    return {
      eligible: false,
      blockers: [`No rights record on file for "${asset.title}". Delivery is blocked.`],
      warnings: [],
      missingRights: PLATFORM_REQUIREMENTS[platform],
      expiresIso: null,
      daysRemaining: null,
    };
  }

  const required = PLATFORM_REQUIREMENTS[platform];
  missingRights = required.filter((r) => !window.cleared.includes(r));
  if (missingRights.length > 0) {
    blockers.push(
      `Missing ${missingRights.map((r) => RIGHT_LABELS[r]).join(", ")} for ${platform.toUpperCase()}.`,
    );
  }

  if (!window.platforms.includes(platform)) {
    blockers.push(`The licence does not grant ${platform.toUpperCase()} as an authorized platform.`);
  }

  const worldwide = window.territories.includes("WORLDWIDE");
  if (!worldwide && !window.territories.includes(territory)) {
    blockers.push(`Territory ${territory} is outside the licensed territories (${window.territories.join(", ")}).`);
  }

  const at = Date.parse(atIso);
  if (at < Date.parse(window.startIso)) {
    blockers.push(`Licence window has not opened (starts ${window.startIso.slice(0, 10)}).`);
  }
  let daysRemaining: number | null = null;
  if (window.endIso) {
    daysRemaining = Math.floor((Date.parse(window.endIso) - at) / 86_400_000);
    if (at > Date.parse(window.endIso)) {
      blockers.push(`Licence expired ${window.endIso.slice(0, 10)}.`);
    } else if (daysRemaining <= 30) {
      warnings.push(`Licence expires in ${daysRemaining} day${daysRemaining === 1 ? "" : "s"}.`);
    }
  }

  if (CAPTION_REQUIRED.includes(platform)) {
    if (asset.captionStatus === "none") {
      blockers.push("Captions are required on this platform and none exist.");
    } else if (asset.captionStatus === "auto_draft") {
      blockers.push("Captions are AI-drafted and have not been reviewed by a human. Review before delivery.");
    }
  }

  if (CLEAN_ONLY.includes(platform) && asset.explicit && !asset.cleanVersionAssetId) {
    blockers.push(`${platform.toUpperCase()} requires a clean version and none is linked to this asset.`);
  }

  if (asset.qcStatus === "failed") blockers.push("Asset failed quality control.");
  if (asset.qcStatus === "pending") warnings.push("Quality control has not completed.");

  if (!window.talentReleaseOnFile && (asset.type === "interview" || asset.type === "performance")) {
    blockers.push("Talent release is not on file for an interview or performance asset.");
  }

  if (asset.publishStatus === "taken_down") blockers.push("Asset is under an active takedown.");

  return {
    eligible: blockers.length === 0,
    blockers,
    warnings,
    missingRights,
    expiresIso: window.endIso,
    daysRemaining,
  };
}

/** Ad categories that may never run inside a given asset, per its rights record. */
export function adRestrictionsFor(window: RightsWindow | undefined): RestrictedCategory[] {
  return window?.adRestrictions ?? [];
}

export function expiringSoon(windows: RightsWindow[], atIso: string, days = 45): RightsWindow[] {
  const at = Date.parse(atIso);
  return windows
    .filter((w) => w.endIso !== null)
    .filter((w) => {
      const remaining = (Date.parse(w.endIso as string) - at) / 86_400_000;
      return remaining >= 0 && remaining <= days;
    })
    .sort((a, b) => Date.parse(a.endIso as string) - Date.parse(b.endIso as string));
}
