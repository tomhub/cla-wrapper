/**
 * Strict-safe fetch wrapper.
 * - Uses native fetch (Node 18+).
 * - Returns typed JSON or throws FetchError.
 */

import type { JsonValue } from "./types.js";

export type FetchOptions = Omit<RequestInit, "body"> & {
  json?: JsonValue;
  timeoutMs?: number;
};

export class FetchError extends Error {
  public status: number;
  public body: string | null;

  constructor(message: string, status: number, body: string | null = null) {
    super(message);
    this.name = "FetchError";
    this.status = status;
    this.body = body;
  }
}

function isAbortError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    (err as any).name === "AbortError"
  );
}

export async function fetchJson<T = unknown>(
  url: string,
  opts: FetchOptions = {},
): Promise<T> {
  const { json, headers, timeoutMs, signal, ...rest } = opts;

  const controller = new AbortController();
  const combinedSignal = (() => {
    if (!signal) return controller.signal;
    if (signal.aborted) {
      controller.abort();
      return controller.signal;
    }
    const onAbort = () => controller.abort();
    signal.addEventListener("abort", onAbort, { once: true });
    return controller.signal;
  })();

  let timeoutId: ReturnType<typeof setTimeout> | undefined;
  if (typeof timeoutMs === "number" && timeoutMs > 0) {
    timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  }

  const init: RequestInit = {
    ...rest,
    method: rest.method ?? (json ? "POST" : "GET"),
    headers: {
      accept: "application/json",
      ...(json ? { "content-type": "application/json" } : {}),
      ...(headers ?? {}),
    },
    body: json ? JSON.stringify(json) : undefined,
    signal: combinedSignal,
  };

  try {
    const res = await fetch(url, init);
    const text = await res.text();

    if (!res.ok) {
      let parsedBody: string | null = null;
      try {
        parsedBody = text ? JSON.stringify(JSON.parse(text)) : null;
      } catch {
        parsedBody = text || null;
      }
      throw new FetchError(
        `Request failed: ${res.status} ${res.statusText}`,
        res.status,
        parsedBody,
      );
    }

    if (!text) {
      return undefined as unknown as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return text as unknown as T;
    }
  } catch (err: unknown) {
    if (isAbortError(err)) {
      throw new Error("Request aborted");
    }
    throw err;
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}
