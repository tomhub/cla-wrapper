/**
 * Shared domain types for the CLA wrapper.
 * Add or extend these as the API surface grows.
 */

export interface LibraryItem {
  id: string;
  name: string;
  description?: string;
  [key: string]: unknown;
}

export interface SearchResult {
  results: LibraryItem[];
  total?: number;
  [key: string]: unknown;
}

export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonObject
  | JsonValue[];
export interface JsonObject {
  [key: string]: JsonValue;
}
