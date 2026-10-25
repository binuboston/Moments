import { describe, expect, it } from "vitest";
import { safeNextPath } from "@/features/auth/safe-next";
import { ROUTES } from "@/lib/routes";

/** What a browser would do with the returned value: it must stay on our origin. */
const resolvesOnSite = (path: string) => new URL(path, "https://invite.app").origin === "https://invite.app";

describe("safeNextPath", () => {
  it("keeps valid internal paths, with their query and hash", () => {
    expect(safeNextPath("/invitations")).toBe("/invitations");
    expect(safeNextPath("/invitations/abc/edit?publish=1")).toBe("/invitations/abc/edit?publish=1");
    expect(safeNextPath("/help#privacy")).toBe("/help#privacy");
    expect(safeNextPath("/templates?category=wedding&tier=free")).toBe("/templates?category=wedding&tier=free");
    expect(safeNextPath("/")).toBe("/");
  });

  it("normalises before returning (what is checked is what is followed)", () => {
    expect(safeNextPath("/a/../invitations")).toBe("/invitations");
    expect(safeNextPath("/invitations/./new")).toBe("/invitations/new");
  });

  it("rejects literal and decoded tabs, newlines and other control characters", () => {
    // searchParams.get() decodes %09 / %0A, so these are what callers receive.
    for (const v of ["/\t/evil.com", "/\n/evil.com", "/\r/evil.com", "/\t\t/evil.com", "/\u0000/evil.com", "/\u007f/evil.com", "/ok\n"]) {
      expect(safeNextPath(v), JSON.stringify(v)).toBe(ROUTES.app);
    }
  });

  it("keeps still-encoded control characters harmless (they stay in the path)", () => {
    const out = safeNextPath("/%09/evil.com");
    expect(resolvesOnSite(out)).toBe(true);
    expect(out.startsWith("//")).toBe(false);
  });

  it("rejects protocol-relative, backslash and dot-segment escapes", () => {
    for (const v of ["//evil.com", "///evil.com", "/\\evil.com", "\\\\evil.com", "/\\/evil.com", "/.//evil.com", "/..//evil.com", "/a/..//evil.com"]) {
      expect(safeNextPath(v), JSON.stringify(v)).toBe(ROUTES.app);
    }
  });

  it("rejects external and non-path URLs", () => {
    for (const v of ["https://evil.com", "http://evil.com/x", "javascript:alert(1)", "data:text/html,hi", "evil.com", "mailto:a@b.c", " /invitations", "?next=//evil.com", "#x"]) {
      expect(safeNextPath(v), JSON.stringify(v)).toBe(ROUTES.app);
    }
  });

  it("rejects auth, guest-bootstrap and API destinations (loops and replays)", () => {
    for (const v of ["/auth/callback?code=x", "/auth/confirm?token_hash=x", "/auth/signout", "/login", "/login?next=/x", "/signup", "/start?next=/x", "/api/guest/claim"]) {
      expect(safeNextPath(v), v).toBe(ROUTES.app);
    }
    // Prefix matching is by path segment, not by string.
    expect(safeNextPath("/loginhelp")).toBe("/loginhelp");
  });

  it("handles missing, empty, over-long and non-string values", () => {
    expect(safeNextPath(null)).toBe(ROUTES.app);
    expect(safeNextPath(undefined)).toBe(ROUTES.app);
    expect(safeNextPath("")).toBe(ROUTES.app);
    expect(safeNextPath(`/${"a".repeat(3000)}`)).toBe(ROUTES.app);
    expect(safeNextPath(42 as unknown as string)).toBe(ROUTES.app);
  });

  it("uses the caller's fallback", () => {
    expect(safeNextPath("//evil.com", ROUTES.invitations)).toBe(ROUTES.invitations);
  });

  it("never returns anything that leaves the site", () => {
    const nasty = ["/\t/evil.com", "//evil.com", "/\\evil.com", "/.//evil.com", "https://evil.com", "/%2F%2Fevil.com", "/%5Cevil.com", "/%09/evil.com", "/@evil.com", "/:@evil.com"];
    for (const v of nasty) expect(resolvesOnSite(safeNextPath(v)), v).toBe(true);
  });
});
