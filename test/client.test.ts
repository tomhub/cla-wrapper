import { http } from "msw";
import { setupServer } from "msw/node";
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { CLAClient } from "../src/client";
import type { LibraryItem, SearchResult } from "../src/types";

const server = setupServer(
  http.get("https://api.test/library/:id", ({ params }) => {
    const { id } = params as { id: string };
    if (id === "notfound") {
      return new Response(JSON.stringify({ error: "Not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }
    const payload: LibraryItem = { id, name: "Test Item" };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),

  http.get("https://api.test/library", ({ request }) => {
    const q = new URL(request.url).searchParams.get("q") ?? "";
    const payload: SearchResult = {
      results: [{ id: "1", name: "r1", description: q }],
      total: 1,
    };
    return new Response(JSON.stringify(payload), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }),
);

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("CLAClient typed", () => {
  const client = new CLAClient({ baseUrl: "https://api.test", apiKey: "abc" });

  it("fetches a library item", async () => {
    const item = await client.getLibraryItem("123");
    expect(item.id).toBe("123");
    expect(item.name).toBe("Test Item");
  });

  it("returns 404 as an error", async () => {
    await expect(client.getLibraryItem("notfound")).rejects.toThrow();
  });

  it("searches library", async () => {
    const res = await client.searchLibrary("hello");
    expect(res.results[0].description).toBe("hello");
    expect(res.total).toBe(1);
  });
});
