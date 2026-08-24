/**
 * Network clock.
 *
 * Demonstration data is anchored to the current day so the prototype always
 * reads as a live network, while remaining deterministic within a single render.
 * Production replaces this with the playout system's clock.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Midnight tonight in the network timezone, expressed in UTC. */
export function startOfNetworkDay(offsetDays = 0): Date {
  const now = new Date();
  const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 4, 0, 0));
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d;
}

export function addSeconds(date: Date, seconds: number): Date {
  return new Date(date.getTime() + seconds * 1000);
}

export function daysAgoIso(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

export function minutesAgoIso(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function daysAheadIso(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}
