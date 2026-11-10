import { expect, type Page } from "@playwright/test";

export function uniqueEmail(label: string) {
  return `e2e-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}@example.test`;
}

export const PASSWORD = "Passw0rd!e2e-test";

/** Signs up through the UI. Local Supabase has email confirmations disabled, so this logs in immediately. */
export async function signUp(page: Page, label: string) {
  const email = uniqueEmail(label);
  await page.goto("/signup");
  await page.getByLabel("Full name").fill(`E2E ${label}`);
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await page.getByRole("button", { name: "Create account" }).click();
  // Signing up lands on home (the app's index).
  await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
  return { email, password: PASSWORD };
}

export async function logIn(page: Page, email: string, password = PASSWORD) {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
}

export async function logOut(page: Page) {
  await page.goto("/settings");
  await page.getByRole("button", { name: "Log out", exact: true }).click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
}

/** Picks the occasion in the Create flow (weddings show by default): the select on phones, the chips on wider screens. */
export async function chooseOccasion(page: Page, slug: string) {
  const select = page.getByTestId("occasion-select");
  // Wait for whichever picker this screen size shows before deciding.
  await page.locator('[data-testid="occasion-select"]:visible, [data-testid^="occasion-chip-"]:visible').first().waitFor({ timeout: 30_000 });
  if (await select.isVisible()) {
    await select.click();
    await page.getByTestId(`occasion-option-${slug}`).click();
    await expect(select).toHaveAttribute("data-state", "closed");
  } else {
    await page.getByTestId(`occasion-chip-${slug}`).click();
    await expect(page.getByTestId(`occasion-chip-${slug}`)).toHaveAttribute("aria-checked", "true");
  }
}

/** The occasion currently chosen in the Create flow (whichever picker is showing). */
export function currentOccasion(page: Page, isMobile: boolean) {
  return isMobile ? page.getByTestId("occasion-select") : page.getByRole("radiogroup", { name: "Occasion" }).getByRole("radio", { checked: true });
}

/** Signs up in the wizard's account dialog (shown to signed-out visitors at "Continue"). */
export async function signUpInGate(page: Page, label: string) {
  const gate = page.getByTestId("account-gate");
  const email = uniqueEmail(label);
  await gate.getByLabel("Full name").fill(`E2E ${label}`);
  await gate.getByLabel("Email").fill(email);
  await gate.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await gate.getByRole("button", { name: "Create account" }).click();
  return email;
}

/** Creates a draft through the wizard and returns its id. Signed out, it signs up in the account dialog on the way. */
export async function createInvitation(page: Page, category: string, templateSlug: string) {
  await page.goto("/create");
  await chooseOccasion(page, category);
  await page.getByTestId(`template-${templateSlug}`).click();
  await page.getByTestId("create-invitation").click();
  const editor = page.waitForURL(/\/invitations\/[0-9a-f-]{36}\/edit/, { timeout: 30_000 }).then(() => "editor" as const, () => null);
  const gate = page.getByTestId("account-gate").waitFor({ timeout: 30_000 }).then(() => "gate" as const, () => null);
  if ((await Promise.race([editor, gate])) === "gate") await signUpInGate(page, "creator");
  await page.waitForURL(/\/invitations\/[0-9a-f-]{36}\/edit/, { timeout: 30_000 });
  const id = page.url().match(/invitations\/([0-9a-f-]{36})\/edit/)![1];
  return id;
}

/** Polls the owner API until the predicate holds, which proves autosave reached the server. */
export async function waitForDraft<T>(page: Page, id: string, pick: (draft: Record<string, unknown>) => T, expected: T) {
  await expect
    .poll(
      async () => {
        const res = await page.request.get(`/api/invitations/${id}`);
        if (!res.ok()) return undefined;
        return pick((await res.json()) as Record<string, unknown>);
      },
      { timeout: 20_000, intervals: [500, 1000] },
    )
    .toEqual(expected);
}

/** Shows a step of the invitation editor (names, when, where, words, schedule, photos, design, music, extras). */
export async function openStep(page: Page, step: string) {
  await page.getByTestId(`step-${step}`).click();
  await expect(page.getByTestId(`editor-step-${step}`)).toBeVisible();
}

/**
 * Opens the account area and returns it: the top-bar menu on wider screens,
 * the tab bar's Menu sheet on phones (the top bar has no account menu there).
 */
export async function openAccount(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByRole("button", { name: "Open menu" }).click();
    return page.getByRole("dialog", { name: "Menu" });
  }
  await page.getByRole("button", { name: "Account menu" }).click();
  return page.getByRole("menu");
}

const MAILPIT = process.env.MAILPIT_URL ?? "http://127.0.0.1:54324";

/**
 * The newest link in the newest local email (Supabase's Mailpit) to `to`
 * whose href matches `match`. Polls, because email delivery is asynchronous.
 */
export async function emailLink(to: string, match: RegExp, { after = 0 }: { after?: number } = {}): Promise<string> {
  for (let i = 0; i < 40; i++) {
    const search = await fetch(`${MAILPIT}/api/v1/search?query=${encodeURIComponent(`to:"${to}"`)}`).then((r) => r.json() as Promise<{ messages: { ID: string; Created: string }[] }>);
    const latest = search.messages?.filter((m) => new Date(m.Created).getTime() >= after).sort((a, b) => b.Created.localeCompare(a.Created))[0];
    if (latest) {
      const message = await fetch(`${MAILPIT}/api/v1/message/${latest.ID}`).then((r) => r.json() as Promise<{ HTML: string }>);
      const href = [...message.HTML.matchAll(/href="([^"]+)"/g)].map((m) => m[1].replace(/&amp;/g, "&")).find((h) => match.test(h));
      if (href) return href;
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`No email to ${to} with a link matching ${match}`);
}

