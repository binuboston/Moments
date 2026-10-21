import { expect, test, type Page } from "@playwright/test";
import { createInvitation, waitForDraft } from "./helpers";

/** Opens the header search: the inline field on wider screens, the full-screen sheet on phones. */
async function openSearch(page: Page, isMobile: boolean) {
  if (isMobile) {
    await page.getByTestId("search-trigger").click();
    const input = page.getByTestId("search-sheet-input");
    await expect(input).toBeFocused();
    return input;
  }
  const input = page.getByTestId("search");
  await input.click();
  return input;
}

test("signed out: finds a template and opens it from the keyboard; remembers the search", async ({ page, isMobile }) => {
  await page.goto("/");
  const box = await openSearch(page, isMobile);
  await box.fill("kaly");
  await expect(page.getByRole("option", { name: /Kalyanam/ }).first()).toBeVisible();
  await box.press("ArrowDown");
  await expect(box).toHaveAttribute("aria-activedescendant", /.+/);
  await box.press("Enter");
  await expect(page).toHaveURL(/\/templates\/kalyanam$/);

  const again = await openSearch(page, isMobile);
  await expect(again).toHaveValue("");
  await expect(page.getByRole("option", { name: "kaly" })).toBeVisible();
});

test("Enter without choosing shows every result on the search page", async ({ page, isMobile }) => {
  await page.goto("/");
  const box = await openSearch(page, isMobile);
  await box.fill("griha pravesh");
  await box.press("Enter");
  await expect(page).toHaveURL(/\/search\?q=griha(\+|%20)pravesh$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("griha pravesh");
  await expect(page.getByRole("heading", { name: /^Templates/ })).toBeVisible();
  await expect(page.getByRole("heading", { name: /^Occasions/ })).toBeVisible();
  await page.getByTestId("search-result-occasion:housewarming").click();
  await expect(page).toHaveURL(/category=housewarming/);
});

test("keyboard shortcut opens search from anywhere", async ({ page, isMobile }) => {
  await page.goto("/templates");
  await page.locator("body").press("/");
  await expect(page.getByTestId(isMobile ? "search-sheet-input" : "search")).toBeFocused();
  await page.keyboard.press("Escape");
});

test("a guest finds their own draft by the name typed into it; inner pages have no search of their own", async ({ page, isMobile }) => {
  const name = `Zara${Date.now().toString(36)}`;
  const id = await createInvitation(page, "birthday", "confetti-pop");
  await page.getByLabel("Who's celebrating?").fill(name);
  await waitForDraft(page, id, (d) => (d.content as { celebrantName?: string }).celebrantName, name);

  await page.goto("/invitations");
  await expect(page.locator('input[type="search"]')).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveCount(isMobile ? 0 : 1);

  const box = await openSearch(page, isMobile);
  await box.fill(name.toLowerCase());
  const mine = page.getByTestId(`search-option-invitation:${id}`);
  await expect(mine).toBeVisible();
  await mine.click();
  await expect(page).toHaveURL(new RegExp(`/invitations/${id}/edit`));
});
