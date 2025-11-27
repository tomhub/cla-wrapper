import { http, HttpResponse } from "msw";

export const handlers = [
  http.get("http://localhost:4000/api/mdr/lastupdated", () => {
    return HttpResponse.json({ overall: "2025-11-26T00:00:00Z" });
  }),

  http.get("http://localhost:4000/api/mdr/products", () => {
    return HttpResponse.json({
      _links: {
        adam: { href: "/mdr/products/adam" },
        sdtm: { href: "/mdr/products/sdtm" },
        cdash: { href: "/mdr/products/cdash" },
      },
    });
  }),

  // Search endpoint
  http.get("http://localhost:4000/api/mdr/search", ({ request }) => {
    const url = new URL(request.url);
    const q = url.searchParams.get("q") ?? "";
    const scopes = Object.fromEntries(url.searchParams.entries());
    const pageSize = Number(url.searchParams.get("pageSize") ?? 10);

    // Simple search snapshot
    if (q === "PARAMTYP") {
      return HttpResponse.json({
        hits: [
          {
            rawHit: {
              id: "hit1",
              label: "Mock result",
              description: "PARAMTYP",
              "@score.score": 1,
            },
          },
        ],
        totalHits: 1,
        hasMore: false,
      });
    }

    // PARAM with multiple scopes
    if (q === "PARAM" && scopes.product?.includes("ADaMIG") && scopes.core === "Required") {
      return HttpResponse.json({
        hits: [
          {
            rawHit: {
              id: "param-1",
              label: "Parameter",
              _links: { self: { href: "/mdr/variables/param-1" } },
            },
          },
          {
            rawHit: {
              id: "param-2",
              label: "Parameter",
              _links: { self: { href: "/mdr/variables/param-2" } },
            },
          },
        ],
        totalHits: 2,
        hasMore: false,
      });
    }

    // PARAM loadAll
    if (q === "PARAM" && pageSize === 1) {
      const hits = Array.from({ length: 22 }, (_, i) => ({
        rawHit: {
          id: `param-${i}`,
          label: "Parameter",
          _links: { self: { href: `/mdr/variables/param-${i}` } },
        },
      }));
      return HttpResponse.json({ hits, totalHits: 22, hasMore: false });
    }

    // PARAM default
    if (q === "PARAM") {
      const hits = Array.from({ length: pageSize }, (_, i) => ({
        rawHit: {
          id: `param-${i}`,
          label: "Parameter",
          _links: { self: { href: `/mdr/variables/param-${i}` } },
        },
      }));
      return HttpResponse.json({ hits, totalHits: hits.length, hasMore: true });
    }

    // SDTM
    if (q === "LBTESTCD") {
      return HttpResponse.json({
        hits: [
          {
            rawHit: {
              id: "lbtestcd-1",
              label: "Lab Test or Examination Short Name",
              _links: { self: { href: "/mdr/variables/lbtestcd-1" } },
            },
          },
        ],
        totalHits: 1,
        hasMore: false,
      });
    }

    // CDASH
    if (q === "RACE") {
      return HttpResponse.json({
        hits: [
          {
            rawHit: {
              id: "race-1",
              label: "Race",
              _links: { self: { href: "/mdr/fields/race-1" } },
            },
          },
        ],
        totalHits: 1,
        hasMore: false,
      });
    }

    // Default
    return HttpResponse.json({
      hits: [
        {
          rawHit: {
            id: "hit1",
            label: "Mock result",
            description: q,
            _links: { self: { href: "/mdr/variables/hit1" } },
          },
        },
      ],
      totalHits: 1,
      hasMore: false,
    });
  }),

  // Linked resource endpoints
  http.get("http://localhost:4000/api/mdr/variables/:id", ({ params }) => {
    const { id } = params as { id: string };
    if (id.startsWith("param")) {
      return HttpResponse.json({ id, label: "Parameter" });
    }
    if (id.startsWith("lbtestcd")) {
      return HttpResponse.json({ id, label: "Lab Test or Examination Short Name" });
    }
    return HttpResponse.json({ id, label: "Mock Variable" });
  }),

  http.get("http://localhost:4000/api/mdr/fields/:id", ({ params }) => {
    const { id } = params as { id: string };
    if (id.startsWith("race")) {
      return HttpResponse.json({ id, prompt: "Race" });
    }
    return HttpResponse.json({ id, prompt: "Mock Field" });
  }),

  http.get("http://localhost:4000/api/mdr/search/scopes", () => {
    return HttpResponse.json({ scopes: ["type", "core", "product"] });
  }),

  http.get("http://localhost:4000/api/mdr/search/scopes/:name", ({ params }) => {
    const { name } = params as { name: string };
    if (name === "core") {
      return HttpResponse.json({ values: ["Required", "Permissible"] });
    }
    return HttpResponse.json({ values: [`mock-${name}-1`, `mock-${name}-2`] });
  }),

  // Full product
  http.get("http://localhost:4000/api/mdr/products/:id", ({ params }) => {
    const { id } = params as { id: string };
    return HttpResponse.json({
      id,
      name: id,
      toSimpleObject: () => ({ id, name: id }),
      itemGroups: {
        BDS: { name: "BDS", toSimpleObject: () => ({ name: "BDS" }) },
        DM: { name: "DM", toSimpleObject: () => ({ name: "DM" }) },
      },
      codeLists: {
        C81224: { id: "C81224", terms: ["Term1", "Term2"] },
        C81223: { id: "C81223", terms: ["TermA", "TermB"] },
      },
      dataClasses: {
        Events: { name: "Events" },
      },
      dataStructures: {
        ADSL: { name: "ADSL" },
      },
    });
  }),

  // ItemGroup endpoint
  http.get("http://localhost:4000/api/mdr/products/:id/itemGroups/:name", ({ params }) => {
    const { name } = params as { name: string };
    return HttpResponse.json({ name, toSimpleObject: () => ({ name }) });
  }),

  // CodeList endpoint
  http.get("http://localhost:4000/api/mdr/products/:id/codeLists/:codeId", ({ params }) => {
    const { codeId } = params as { codeId: string };
    return HttpResponse.json({ id: codeId, terms: ["MockTerm1", "MockTerm2"] });
  }),

  // Product classes
  http.get("http://localhost:4000/api/mdr/productClasses", () => {
    return HttpResponse.json({
      adam: { name: "adam" },
      sdtm: { name: "sdtm" },
      cdash: { name: "cdash" },
    });
  }),

  // Product groups
  http.get("http://localhost:4000/api/mdr/productGroups", () => {
    return HttpResponse.json({
      sdtmig: { name: "sdtmig" },
      adamig: { name: "adamig" },
      cdashig: { name: "cdashig" },
    });
  }),

];

