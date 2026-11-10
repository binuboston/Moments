import { expect, test } from "@playwright/test";
import { chooseOccasion, createInvitation, currentOccasion, signUp } from "./helpers";

/**
 * Signed out, Home is the Create flow: wedding designs straight away (the
 * primary occasion), an occasion select to switch, Preview on every design,
 * then Continue. Preview's "Use this design" comes back with the design
 * selected. Signed in, Home is the dashboard and creating is the Create tab.
 */

test("signed out, Home opens on wedding designs; the occasion picker switches them, with Preview on each", async ({ page, isMobile }) => {
  await page.goto("/");
  // Phones pick from a select; wider screens from chips (the other one is hidden).
  await expect(page.getByTestId("occasion-select")).toBeVisible({ visible: isMobile });
  await expect(page.getByTestId("occasion-chip-wedding")).toBeVisible({ visible: !isMobile });
  await expect(currentOccasion(page, isMobile)).toContainText("Wedding");
  await expect(page.getByTestId("template-eternal-grace")).toBeVisible();
  await expect(page.getByTestId("template-confetti-pop")).toHaveCount(0);
  await expect(page.getByTestId("preview-eternal-grace")).toHaveAttribute("href", "/demo/eternal-grace?occasion=wedding");

  await chooseOccasion(page, "birthday");
  await expect(page).toHaveURL(/\/\?category=birthday$/);
  await expect(currentOccasion(page, isMobile)).toContainText("Birthday");
  await expect(page.getByTestId("template-confetti-pop")).toBeVisible();
  await expect(page.getByTestId("template-eternal-grace")).toHaveCount(0);
  await expect(page.getByTestId("preview-confetti-pop")).toHaveAttribute("href", "/demo/confetti-pop?occasion=birthday");

  // The selection is kept in the URL, so a refresh keeps it.
  await page.getByTestId("template-confetti-pop").click();
  await expect(page).toHaveURL(/\/\?category=birthday&template=confetti-pop$/);
  await page.reload();
  await expect(page.getByTestId("template-confetti-pop")).toHaveAttribute("aria-pressed", "true");
});

test("Preview opens the demo; Use this design comes back with it selected, and Continue asks for an account", async ({ page }) => {
  await page.goto("/?category=birthday");
  await page.getByTestId("preview-confetti-pop").click();
  await expect(page).toHaveURL(/\/demo\/confetti-pop\?occasion=birthday$/);

  await page.getByTestId("demo-use").click();
  await expect(page).toHaveURL(/\/\?category=birthday&template=confetti-pop$/);
  await expect(page.getByTestId("template-confetti-pop")).toHaveAttribute("aria-pressed", "true");
  await page.getByTestId("create-invitation").click();
  await expect(page.getByTestId("account-gate")).toBeVisible();
});

test("signed in, Home is your dashboard; creating happens in the Create tab", async ({ page }) => {
  await signUp(page, "home-dashboard");
  // No invitations yet: a clear first step, and no occasion picker on Home.
  await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
  await expect(page.getByText("Create your first invitation")).toBeVisible();
  await expect(page.getByTestId("occasion-select")).toHaveCount(0);
  await expect(page.getByRole("radiogroup", { name: "Occasion" })).toHaveCount(0);

  await createInvitation(page, "birthday", "confetti-pop");
  await page.goto("/");
  await expect(page.getByRole("link", { name: /see all 1/i })).toBeVisible();
  await expect(page.getByTestId("occasion-select")).toHaveCount(0);
  await expect(page.getByRole("radiogroup", { name: "Occasion" })).toHaveCount(0);
  await page.getByTestId("home-create").click();
  await expect(page).toHaveURL(/\/create$/);
  await expect(page.getByTestId("template-eternal-grace")).toBeVisible();

  // Occasion links (search, sitemap, old /templates) continue in the Create tab, keeping the choice.
  await page.goto("/?category=wedding&template=eternal-grace");
  await expect(page).toHaveURL(/\/create\?category=wedding&template=eternal-grace$/);
  await expect(page.getByTestId("template-eternal-grace")).toHaveAttribute("aria-pressed", "true");
});

test("navigation: visitors get only Log in (phones); account holders get Home, Create and Invitations", async ({ page, isMobile }) => {
  await page.goto("/");
  const primary = page.getByRole("navigation", { name: "Primary" });
  for (const name of ["Templates", "Home", "Create", "Invitations"]) await expect(primary.getByRole("link", { name })).toHaveCount(0);
  if (isMobile) {
    await expect(primary.locator("ul > li")).toHaveCount(2);
    await primary.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL(/\/login/);
  }

  await signUp(page, "nav-tabs");
  for (const name of ["Home", "Create", "Invitations"]) await expect(primary.getByRole("link", { name })).toBeVisible();
  await expect(primary.getByRole("link", { name: "Log in" })).toHaveCount(0);
  if (isMobile) await expect(primary.locator("ul > li")).toHaveCount(4);
});
