/**
 * RAP TRENDS — the network boundary for ingestion.
 *
 * Every adapter takes a `Fetcher` rather than calling `fetch` itself, so the
 * parsing and scaling logic can be tested against recorded fixtures with no
 * network at all. It also means one place enforces the User-Agent and timeout
 * that several of these APIs require of well-behaved clients.
 */

import type { FetchEnvelope, Fetcher } from "./types";

/**
 * MusicBrainz in particular rejects clients that do not identify themselves,
 * and asks for contact details. Sending a real one is a condition of use, not
 * a courtesy.
 */
export const DEFAULT_USER_AGENT = "RapTrendsIndex/0.1 ( https://raptrends.com/contact )";

export interface HttpFetcherOptions {
  userAgent?: string;
  timeoutMs?: number;
  /**
   * Retries on 429 and 503 only. Defaults to 2.
   *
   * Added after a real run: MusicBrainz returned 503 for 7 of 20 lookups under
   * its rate limiter even at a 1.1s cadence, and every one of them succeeded on
   * a slower retry. Without this a third of the identity spine would go missing
   * for no reason other than impatience.
   */
  retries?: number;
  /** Base backoff in ms; doubles each attempt. */
  backoffMs?: number;
  /** Injectable so tests do not actually wait. */
  sleep?: (ms: number) => Promise<void>;
}

const RETRYABLE_STATUS = new Set([429, 503]);

export function httpFetcher(options: HttpFetcherOptions = {}): Fetcher {
  const userAgent = options.userAgent ?? DEFAULT_USER_AGENT;
  const timeoutMs = options.timeoutMs ?? 15_000;
  const retries = options.retries ?? 2;
  const backoffMs = options.backoffMs ?? 1_500;
  const sleep = options.sleep ?? ((ms: number) => new Promise<void>((r) => setTimeout(r, ms)));

  const attempt: Fetcher = async (url, init) => {
    const fetchedIso = new Date().toISOString();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const res = await fetch(url, {
        headers: { "user-agent": userAgent, accept: "application/json", ...(init?.headers ?? {}) },
        signal: controller.signal,
      });

      const text = await res.text();
      let body: unknown = null;
      try {
        body = text ? JSON.parse(text) : null;
      } catch {
        return {
          ok: false,
          status: res.status,
          url,
          body: null,
          fetchedIso,
          error: "Response was not JSON.",
        };
      }

      return { ok: res.ok, status: res.status, url, body, fetchedIso };
    } catch (err) {
      return {
        ok: false,
        status: 0,
        url,
        body: null,
        fetchedIso,
        error: err instanceof Error ? err.message : "Request failed.",
      };
    } finally {
      clearTimeout(timer);
    }
  };

  return async (url, init) => {
    let last = await attempt(url, init);
    for (let i = 0; i < retries && RETRYABLE_STATUS.has(last.status); i += 1) {
      await sleep(backoffMs * 2 ** i);
      last = await attempt(url, init);
    }
    return last;
  };
}

/**
 * A fetcher backed by recorded responses. Used by the tests, and useful in
 * development when an upstream is rate-limited.
 */
export function fixtureFetcher(
  fixtures: Record<string, unknown>,
  fetchedIso = "2026-09-18T00:00:00.000Z",
): Fetcher {
  return async (url) => {
    const key = Object.keys(fixtures).find((k) => url.startsWith(k) || url.includes(k));
    if (key === undefined) {
      const envelope: FetchEnvelope = {
        ok: false,
        status: 404,
        url,
        body: null,
        fetchedIso,
        error: `No fixture for ${url}`,
      };
      return envelope;
    }
    return { ok: true, status: 200, url, body: fixtures[key], fetchedIso };
  };
}
