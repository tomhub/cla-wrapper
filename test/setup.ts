import { TextEncoder, TextDecoder } from "util";

// Ensure wrapper points at localhost for tests
global.cdiscLibraryUrl = "http://localhost:4000/api";

// Polyfill localStorage for MSW CookieStore
Object.defineProperty(globalThis, "localStorage", {
  value: {
    getItem: () => null,
    setItem: () => { },
    removeItem: () => { },
    clear: () => { },
    key: () => null,
    length: 0,
  },
  writable: true,
});

import { setupServer } from "msw/node";
import { handlers } from "./msw-handlers";

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
