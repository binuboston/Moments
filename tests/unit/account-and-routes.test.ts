import { describe, expect, it } from "vitest";
import { accountView } from "@/lib/auth/account-actions";
import { hidesTabBar, isAppPath, isFocusedFlow, ROUTES, routes } from "@/lib/routes";

const keys = (v: ReturnType<typeof accountView>) => [v.primary?.key, ...v.actions.map((a) => a.key)].filter(Boolean);

describe("account model (one source for desktop and phone menus)", () => {
  it("signed out: start as a guest, log in or sign up", () => {
    const v = accountView(null);
    expect(v.identity).toBeNull();
    expect(keys(v)).toEqual(["start", "login", "signup"]);
  });

  it("guest: identified as a guest, offered an account, never sign-out", () => {
    const v = accountView({ name: "", email: "", role: "user", plan: "free", isGuest: true });
    expect(v.identity?.title).toBe("Guest");
    expect(keys(v)).toEqual(["signup", "app", "login"]);
    expect(keys(v)).not.toContain("signOut");
  });

  it("account holder: upgrade on free, settings, admin only for admins, sign-out last", () => {
    const free = accountView({ name: "Aisha Khan", email: "a@example.test", role: "user", plan: "free", isGuest: false });
    expect(free.identity).toMatchObject({ title: "Aisha Khan", avatar: { kind: "initials", text: "AK" }, plan: "free" });
    expect(keys(free)).toEqual(["upgrade", "app", "settings", "signOut"]);
    const admin = accountView({ name: "", email: "x@example.test", role: "admin", plan: "pro", isGuest: false });
    expect(keys(admin)).toEqual(["app", "settings", "admin", "signOut"]);
  });
});

describe("routes", () => {
  it("builds paths with parameters", () => {
    expect(routes.editInvitation("abc")).toBe("/invitations/abc/edit");
    expect(routes.newInvitation({ template: "eternal-grace" })).toBe("/invitations/new?template=eternal-grace");
    expect(routes.newInvitation()).toBe(ROUTES.newInvitation);
    expect(routes.login("/settings")).toBe("/login?next=%2Fsettings");
    expect(routes.start()).toBe("/start?next=%2F");
    expect(routes.invitation("aisha-rohan")).toBe("/e/aisha-rohan");
  });

  it("classifies app paths and focused flows", () => {
    // Home is the index and needs no session; invitations and settings do.
    expect(ROUTES.app).toBe(ROUTES.home);
    expect(isAppPath(ROUTES.home)).toBe(false);
    expect(isAppPath(ROUTES.invitations)).toBe(true);
    expect(isAppPath(ROUTES.settings)).toBe(true);
    expect(isAppPath(`${ROUTES.newInvitation}?template=x`)).toBe(true);
    expect(isAppPath(ROUTES.templates)).toBe(false);
    expect(isFocusedFlow(routes.editInvitation("abc"))).toBe(true);
    expect(isFocusedFlow(ROUTES.invitations)).toBe(false);
    // Only the editor replaces the phone tab bar; the wizard is the Create tab and keeps it.
    expect(hidesTabBar(routes.editInvitation("abc"))).toBe(true);
    expect(hidesTabBar(ROUTES.newInvitation)).toBe(false);
    expect(hidesTabBar(ROUTES.invitations)).toBe(false);
  });
});
