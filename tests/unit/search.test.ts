import { describe, expect, it } from "vitest";
import type { SearchContext } from "@/features/search/provider";
import { dbTokens } from "@/features/search/provider";
import { actionsProvider } from "@/features/search/providers/actions";
import { helpProvider } from "@/features/search/providers/help";
import { pagesProvider } from "@/features/search/providers/pages";
import { fieldScore, highlightParts, normalize, parseQuery, scoreFields } from "@/features/search/score";
import { SEARCH_GROUPS } from "@/features/search/types";
import { ROUTES, routes } from "@/lib/routes";

const signedOut: SearchContext = { user: null, supabase: null };
const account: SearchContext = { user: { id: "u1", isGuest: false }, supabase: null };

describe("search scoring", () => {
  it("normalises case, accents and spacing", () => {
    expect(normalize("  Café   DÉCOR ")).toBe("cafe decor");
    expect(parseQuery("Griha  Pravesh").tokens).toEqual(["griha", "pravesh"]);
  });

  it("ranks exact over prefix over word start over substring", () => {
    const q = parseQuery("gala");
    const exact = fieldScore(q, "Gala");
    const prefix = fieldScore(q, "Gala night");
    const word = fieldScore(q, "Golden Gala");
    const inner = fieldScore(q, "Megalady");
    expect(exact).toBeGreaterThan(prefix);
    expect(prefix).toBeGreaterThan(word);
    expect(word).toBeGreaterThan(inner);
    expect(inner).toBeGreaterThan(0);
    expect(fieldScore(q, "Wedding")).toBe(0);
  });

  it("matches multi-word queries in any order", () => {
    expect(fieldScore(parseQuery("rohan aisha"), "Aisha & Rohan")).toBeGreaterThan(0);
  });

  it("weights fields", () => {
    const q = parseQuery("garden");
    expect(scoreFields(q, [{ value: "Garden party", weight: 1 }])).toBeGreaterThan(scoreFields(q, [{ value: "Garden party", weight: 0.5 }]));
  });

  it("highlights the first match, case-insensitively", () => {
    expect(highlightParts("Golden Gala", "gal")).toEqual([
      { text: "Golden ", match: false },
      { text: "Gal", match: true },
      { text: "a", match: false },
    ]);
    expect(highlightParts("Golden", "")).toEqual([{ text: "Golden", match: false }]);
  });

  it("strips database wildcards from query words", () => {
    expect(dbTokens(parseQuery("50% off_now aisha"))).toEqual(["50", "offnow", "aisha"]);
  });
});

describe("search providers", () => {
  it("help finds answers from the help centre content", async () => {
    const results = await helpProvider.search(parseQuery("whatsapp"), signedOut);
    expect(results[0]).toMatchObject({ group: "help", href: routes.helpSection("sharing") });
  });

  it("actions understand occasion synonyms", async () => {
    const results = await actionsProvider.search(parseQuery("griha pravesh"), signedOut);
    expect(results.map((r) => r.href)).toContain(routes.newInvitation({ category: "housewarming" }));
  });

  it("account actions depend on who is searching", async () => {
    const out = await actionsProvider.search(parseQuery("log in"), signedOut);
    expect(out.map((r) => r.href)).toContain(ROUTES.login);
    const settings = await actionsProvider.search(parseQuery("password"), account);
    expect(settings.map((r) => r.href)).toContain(ROUTES.security);
    expect((await actionsProvider.search(parseQuery("password"), signedOut)).map((r) => r.href)).not.toContain(ROUTES.security);
  });

  it("pages come from the navigation", async () => {
    const results = await pagesProvider.search(parseQuery("pricing"), signedOut);
    expect(results[0]?.href).toBe(ROUTES.pricing);
  });

  it("results carry known groups and stable ids", async () => {
    const all = [...(await helpProvider.search(parseQuery("rsvp"), account)), ...(await pagesProvider.search(parseQuery("help"), account))];
    for (const r of all) expect(SEARCH_GROUPS).toContain(r.group);
    expect(new Set(all.map((r) => r.id)).size).toBe(all.length);
  });
});
