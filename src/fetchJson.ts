/**
 * Minimal, well-typed fetch wrapper for Node 18+ (native fetch).
 * - Throws a descriptive error for non-2xx responses.
 * - Parses JSON and preserves typing for callers.
 */

export type FetchOptions = Omit<RequestInit, "body"> & {
  json?: unknown;
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

export async function fetchJson<T = unknown>(url: string, opts: FetchOptions = {}): Promise<T> {
  const { json, headers, ...rest } = opts;
  const init: RequestInit = {
    ...rest,
    headers: {
      "accept": "application/json",
      ...(json ? { "content-type": "application/json" } : {}),
      ...(headers ?? {})
    },
    body: json ? JSON.stringify(json) : undefined
  };

  const res = await fetch(url, init);
  const text = await res.text();

  if (!res.ok) {
    // try to include JSON body if present
    let parsed: unknown = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    throw new FetchError(`Request failed: ${res.status} ${res.statusText}`, res.status, typeof parsed === "string" ? parsed : JSON.stringify(parsed));
  }

  if (!text) {
    // empty body
    return undefined as unknown as T;
  }

  try {
    return JSON.parse(text) as T;
  } catch (err) {
    // not JSON — return raw text as unknown
    return text as unknown as T;
  }
}
