import { createHash, createHmac, randomUUID } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { expect, test, type Page } from "@playwright/test";
import { admin } from "./admin";
import { chooseOccasion, logOut, openAccount, PASSWORD, signUp, signUpInGate } from "./helpers";

/**
 * Creating needs an account: anyone can pick an occasion and a design, and
 * "Continue" asks them to sign up or log in, keeping the choice. Exactly one
 * draft is made, however the person gets back.
 */
test.describe.configure({ mode: "serial" });

const EDITOR = /\/invitations\/([0-9a-f-]{36})\/edit/;

async function chooseDesign(page: Page) {
  await page.goto("/create");
  await chooseOccasion(page, "birthday");
  await page.getByTestId("template-confetti-pop").click();
}

async function draftCount(page: Page) {
  return ((await (await page.request.get("/api/invitations")).json()) as { total: number }).total;
}

async function openedDraft(page: Page) {
  await page.waitForURL(EDITOR, { timeout: 30_000 });
  const id = page.url().match(EDITOR)![1];
  const draft = (await (await page.request.get(`/api/invitations/${id}`)).json()) as { templateKey: string; categorySlug: string };
  return { id, draft };
}

test("signed out: choosing a design is open; Continue asks for an account, then opens that design", async ({ page, isMobile }) => {
  await chooseDesign(page);
  await page.getByTestId("create-invitation").click();
  const gate = page.getByTestId("account-gate");
  await expect(gate).toBeVisible();
  await expect(gate).toContainText(/Confetti Pop/);
  // Nothing exists yet, and nothing says "guest".
  expect((await page.request.get("/api/invitations")).status()).toBe(401);
  await expect(page.locator("body")).not.toContainText(/guest mode|as a guest|no account needed/i);

  await signUpInGate(page, "create-signup");
  const { draft } = await openedDraft(page);
  expect(draft).toMatchObject({ templateKey: "confetti-pop", categorySlug: "birthday" });
  expect(await draftCount(page)).toBe(1);
  await page.goto("/");
  await expect((await openAccount(page, isMobile)).getByText(/guest/i)).toHaveCount(0);
});

test("an existing account logs in from the dialog and continues with the chosen design", async ({ page }) => {
  const { email } = await signUp(page, "create-login");
  await logOut(page);

  await chooseDesign(page);
  await page.getByTestId("create-invitation").click();
  const gate = page.getByTestId("account-gate");
  await gate.getByTestId("gate-login").click();
  await gate.getByLabel("Email").fill(email);
  await gate.getByLabel("Password", { exact: true }).fill(PASSWORD);
  await gate.getByRole("button", { name: "Log in" }).click();
  const { draft } = await openedDraft(page);
  expect(draft.templateKey).toBe("confetti-pop");
  expect(await draftCount(page)).toBe(1);
});

test("one key, one draft: double clicks, parallel requests and returning to the wizard never duplicate", async ({ page }) => {
  await signUp(page, "create-once");
  await chooseDesign(page);
  await page.getByTestId("create-invitation").dblclick();
  const { id } = await openedDraft(page);

  const key = randomUUID();
  const body = { categorySlug: "birthday", templateSlug: "confetti-pop", creationKey: key };
  const [a, b] = await Promise.all([page.request.post("/api/invitations", { data: body }), page.request.post("/api/invitations", { data: body })]);
  const [ja, jb] = [(await a.json()) as { id: string }, (await b.json()) as { id: string }];
  expect(ja.id).toBe(jb.id);

  // Coming back to a wizard URL with that key (refresh, Back, a second email click) reopens the same draft.
  await page.goto(`/create?category=birthday&template=confetti-pop&key=${key}`);
  await page.waitForURL(new RegExp(`/invitations/${ja.id}/edit`), { timeout: 30_000 });
  expect(await draftCount(page)).toBe(2);
  expect(ja.id).not.toBe(id);
});

test("old /invitations/new links keep the choice and the draft key, for visitors and account holders", async ({ page }) => {
  const key = randomUUID();
  const query = `category=birthday&template=confetti-pop&key=${key}`;
  // Signed out: the flow opens on Home (the visitor's address for it) with the design chosen.
  await page.goto(`/invitations/new?${query}`);
  await expect(page).toHaveURL(new RegExp(`/\\?${query}$`));
  await expect(page.getByTestId("template-confetti-pop")).toHaveAttribute("aria-pressed", "true");
  // Signed in: the same old link resumes and opens that draft.
  await signUp(page, "old-link");
  await page.goto(`/invitations/new?${query}`);
  const { draft } = await openedDraft(page);
  expect(draft.templateKey).toBe("confetti-pop");
});

test("signed out, account pages ask to log in and come back", async ({ page }) => {
  for (const path of ["/invitations", "/settings", `/invitations/${randomUUID()}/edit`]) {
    await page.goto(path);
    await expect(page).toHaveURL(new RegExp(`/login\\?next=${encodeURIComponent(path).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`), { timeout: 30_000 });
  }
  const res = await page.request.post("/api/invitations", { data: { categorySlug: "birthday", templateSlug: "confetti-pop" } });
  expect(res.status()).toBe(401);
});

/** Legacy guests (retired guest mode): drafts and photos left in this browser move to the account at sign-in. */
test("a draft left by an earlier guest session moves to the account, photos included", async ({ page, context, baseURL }) => {
  const anon = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
  const { data: signedIn } = await anon.auth.signInAnonymously();
  const guestId = signedIn.user!.id;
  const [{ data: template }, { data: category }] = await Promise.all([
    admin.from("templates").select("id").eq("slug", "confetti-pop").single(),
    admin.from("event_categories").select("id").eq("slug", "birthday").single(),
  ]);
  const { data: inv } = await admin
    .from("invitations")
    .insert({ owner_id: guestId, template_id: template!.id, category_id: category!.id, slug: `legacy-${Date.now().toString(36)}`, content: {}, status: "draft" })
    .select("id")
    .single();
  const { data: media } = await admin
    .from("invitation_media")
    .insert({ invitation_id: inv!.id, owner_id: guestId, storage_path: `${inv!.id}/${randomUUID()}.jpg`, kind: "gallery", mime_type: "image/jpeg", size_bytes: 1000, is_uploaded: true })
    .select("id")
    .single();

  // The browser still holds the old guest marker (same format as lib/auth/guest.ts).
  const key = createHash("sha256").update(`mirth-guest-claim:${process.env.SUPABASE_SERVICE_ROLE_KEY}`).digest();
  const payload = Buffer.from(JSON.stringify({ sub: guestId, exp: Date.now() + 3_600_000 })).toString("base64url");
  const token = `${payload}.${createHmac("sha256", key).update(payload).digest("base64url")}`;
  await context.addCookies([{ name: "mirth_guest", value: token, url: baseURL! }]);

  await signUp(page, "legacy-claim");

  await expect.poll(async () => (await page.request.get(`/api/invitations/${inv!.id}`)).status(), { timeout: 15_000 }).toBe(200);
  const { data: photo } = await admin.from("invitation_media").select("owner_id").eq("id", media!.id).maybeSingle();
  expect(photo).not.toBeNull();
  const { data: guest } = await admin.auth.admin.getUserById(guestId);
  expect(guest.user).toBeNull();
});
