import { describe, expect, it } from "vitest";
import { accountView } from "@/lib/auth/account-actions";
import { hidesTabBar, isFocusedFlow, createFlowPath, isNavActive, needsAccount, PRIMARY_NAV, primaryNav, ROUTES, routes } from "@/lib/routes";

const keys = (v: ReturnType<typeof accountView>) => [v.primary?.key, ...v.actions.map((a) => a.key)].filter(Boolean);

describe("account model (one source for desktop and phone menus)", () => {
  it("signed out: create an invitation, log in or sign up (no guest wording)", () => {
    const v = accountView(null);
    expect(v.identity).toBeNull();
    expect(keys(v)).toEqual(["start", "login", "signup"]);
    expect([v.primary, ...v.actions].map((a) => a?.label).join(" ")).not.toMatch(/guest|no account/i);
  });

  it("account holder: upgrade on free, settings, admin only for admins, sign-out last", () => {
    const free = accountView({ name: "Aisha Khan", email: "a@example.test", role: "user", plan: "free" });
    expect(free.identity).toMatchObject({ title: "Aisha Khan", avatar: { kind: "initials", text: "AK" }, plan: "free" });
    expect(keys(free)).toEqual(["upgrade", "app", "settings", "signOut"]);
    const admin = accountView({ name: "", email: "x@example.test", role: "admin", plan: "pro" });
    expect(keys(admin)).toEqual(["app", "settings", "admin", "signOut"]);
  });
});

describe("routes", () => {
  it("builds paths with parameters", () => {
    expect(routes.editInvitation("abc")).toBe("/invitations/abc/edit");
    expect(routes.newInvitation({ template: "eternal-grace" })).toBe("/create?template=eternal-grace");
    expect(routes.newInvitation()).toBe(ROUTES.newInvitation);
    expect(routes.login("/settings")).toBe("/login?next=%2Fsettings");
    expect(routes.newInvitation({ category: "wedding", template: "kalyanam", key: "k" })).toBe("/create?category=wedding&template=kalyanam&key=k");
    expect(routes.invitation("aisha-rohan")).toBe("/e/aisha-rohan");
    // Browsing designs is Home's Create flow; design pages keep /templates/{slug}.
    expect(routes.browse()).toBe("/");
    expect(routes.browse({ category: "wedding", template: "kalyanam" })).toBe("/?category=wedding&template=kalyanam");
    expect(routes.demo("kalyanam", "wedding")).toBe("/demo/kalyanam?occasion=wedding");
    expect(routes.demo("kalyanam")).toBe("/demo/kalyanam");
    expect(routes.template("kalyanam")).toBe("/templates/kalyanam");
    expect(PRIMARY_NAV.map((n) => n.key)).toEqual(["home", "create", "invitations"]);
  });

  it("shows each audience only the navigation it can use", () => {
    const keys = (a: Parameters<typeof primaryNav>[0]) => primaryNav(a).map((n) => n.key);
    expect(keys("account")).toEqual(["home", "create", "invitations"]);
    expect(keys("visitor")).toEqual(["login"]);
    expect(keys("unknown")).toEqual([]);
    expect(primaryNav("visitor")[0].tabsOnly).toBe(true);
    const [home, create, invitations] = primaryNav("account");
    expect(isNavActive(ROUTES.home, home)).toBe(true);
    expect(isNavActive(ROUTES.home, create)).toBe(false);
    expect(isNavActive(ROUTES.newInvitation, create)).toBe(true);
    expect(isNavActive(`${ROUTES.invitations}/x/edit`, invitations)).toBe(true);
  });

  it("puts the Create flow on Home for visitors and on /create for account holders", () => {
    expect(createFlowPath("visitor")).toBe("/");
    expect(createFlowPath("visitor", "category=wedding")).toBe("/?category=wedding");
    expect(createFlowPath("account", "category=wedding&key=k")).toBe("/create?category=wedding&key=k");
  });

  it("classifies app paths and focused flows", () => {
    // Home and the wizard are open to everyone; invitations, the editor and settings need an account.
    expect(ROUTES.app).toBe(ROUTES.home);
    expect(needsAccount(ROUTES.home)).toBe(false);
    expect(needsAccount(`${ROUTES.newInvitation}?template=x`)).toBe(false);
    expect(needsAccount(ROUTES.templates)).toBe(false);
    expect(ROUTES.newInvitation).toBe("/create");
    expect(needsAccount(ROUTES.invitations)).toBe(true);
    expect(needsAccount(routes.editInvitation("abc"))).toBe(true);
    expect(needsAccount(`${ROUTES.settings}#security`)).toBe(true);
    expect(isFocusedFlow(routes.editInvitation("abc"))).toBe(true);
    expect(isFocusedFlow(ROUTES.invitations)).toBe(false);
    // Only the editor replaces the phone tab bar; the wizard is the Create tab and keeps it.
    expect(hidesTabBar(routes.editInvitation("abc"))).toBe(true);
    expect(hidesTabBar(ROUTES.newInvitation)).toBe(false);
    expect(hidesTabBar(ROUTES.invitations)).toBe(false);
  });
});
