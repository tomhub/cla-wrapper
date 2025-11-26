/**
 * Strict-safe client implementation.
 * Uses typed request/response shapes and explicit returns.
 */

import { fetchJson, FetchError } from "./fetchJson.js";
import type { LibraryItem, SearchResult } from "./types.js";

export type ClientOptions = {
  baseUrl: string;
  apiKey?: string;
  defaultHeaders?: Record<string, string>;
};

export class CLAClient {
  private baseUrl: string;
  private apiKey?: string;
  private defaultHeaders: Record<string, string>;

  constructor(opts: ClientOptions) {
    if (!opts?.baseUrl) throw new TypeError("baseUrl is required");
    this.baseUrl = opts.baseUrl.replace(/\/+$/, "");
    this.apiKey = opts.apiKey;
    this.defaultHeaders = opts.defaultHeaders ?? {};
  }

  private buildUrl(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, "")}`;
  }

  private buildHeaders(
    headers?: Record<string, string>,
  ): Record<string, string> {
    return {
      ...this.defaultHeaders,
      ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      ...(headers ?? {}),
    };
  }

  public async get<T = unknown>(
    path: string,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal },
  ): Promise<T> {
    const url = this.buildUrl(path);
    try {
      return await fetchJson<T>(url, {
        method: "GET",
        headers: this.buildHeaders(opts?.headers),
        signal: opts?.signal,
      });
    } catch (err) {
      if (err instanceof FetchError) throw err;
      throw new Error(`GET ${url} failed: ${(err as Error).message}`);
    }
  }

  public async post<T = unknown, B = unknown>(
    path: string,
    body: B,
    opts?: { headers?: Record<string, string>; signal?: AbortSignal },
  ): Promise<T> {
    const url = this.buildUrl(path);
    try {
      return await fetchJson<T>(url, {
        method: "POST",
        json: body as any,
        headers: this.buildHeaders(opts?.headers),
        signal: opts?.signal,
      });
    } catch (err) {
      if (err instanceof FetchError) throw err;
      throw new Error(`POST ${url} failed: ${(err as Error).message}`);
    }
  }

  public async getLibraryItem(id: string): Promise<LibraryItem> {
    if (!id) throw new TypeError("id is required");
    const res = await this.get<LibraryItem>(
      `/library/${encodeURIComponent(id)}`,
    );
    // runtime guard
    if (!res || typeof (res as any).id !== "string") {
      throw new Error("Invalid library item response");
    }
    return res;
  }

  public async searchLibrary(query: string): Promise<SearchResult> {
    const q = new URLSearchParams({ q: query ?? "" });
    const res = await this.get<SearchResult>(`/library?${q.toString()}`);
    if (!res || !Array.isArray(res.results)) {
      throw new Error("Invalid search response");
    }
    return res;
  }
}

export default CLAClient;
