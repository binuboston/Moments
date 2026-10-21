import { expect, test } from "@playwright/test";
import { createInvitation } from "./helpers";

test("the invitations list: status dots, filter chips and a create tile", async ({ page }) => {
  await createInvitation(page, "birthday", "balloon-bash");
  await page.goto("/invitations");

  // Status is a dot without text, still named for assistive tech (and shown as a tooltip).
  await expect(page.getByRole("img", { name: "Draft" }).first()).toBeVisible();
  await expect(page.getByTestId("create-tile")).toBeVisible();

  // Chips filter in place; the create tile only leads lists where a new draft would appear.
  await page.getByTestId("filter-published").click();
  await expect(page.getByTestId("filter-published")).toHaveAttribute("aria-selected", "true");
  await expect(page.getByText("Nothing here yet")).toBeVisible();
  await expect(page.getByTestId("create-tile")).toHaveCount(0);

  await page.getByTestId("filter-all").click();
  await page.getByTestId("create-tile").click();
  await expect(page).toHaveURL(/\/invitations\/new/);
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
