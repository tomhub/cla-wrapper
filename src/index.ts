/**
 * Public entrypoint for the package.
 * Drop-in replacement: export the client and helper types.
 */

export { CLAClient } from "./client.js";
export type { ClientOptions } from "./client.js";
export { fetchJson, FetchError } from "./fetchJson.js";
export type { LibraryItem, SearchResult } from "./types.js";
