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
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 30_000 });
}

/** Creates a draft through the wizard and returns its id. */
export async function createInvitation(page: Page, category: string, templateSlug: string) {
  await page.goto("/invitations/new");
  await page.getByTestId(`category-${category}`).click();
  await page.getByTestId(`template-${templateSlug}`).click();
  await page.getByTestId("create-invitation").click();
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
