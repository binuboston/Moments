import { expect, test } from "@playwright/test";
import { createInvitation, openStep, waitForDraft } from "./helpers";

type Content = { startsAt?: string; endsAt?: string };

test("the editor is one step at a time, with a calendar and time picker", async ({ page }) => {
  const id = await createInvitation(page, "wedding", "eternal-grace");

  // Opens on the first step, with every step reachable from the bar.
  await expect(page.getByTestId("editor-step-names")).toBeVisible();
  await expect(page.getByTestId("step-extras")).toBeVisible();
  await page.getByLabel("Partner one", { exact: true }).fill("Aisha");
  await page.getByLabel("Partner two", { exact: true }).fill("Rohan");
  await expect(page.getByTestId("names-preview")).toContainText("Aisha & Rohan");

  // ⌘/Ctrl+Enter moves to the next step.
  await page.keyboard.press("ControlOrMeta+Enter");
  await expect(page.getByTestId("editor-step-when")).toBeVisible();
  await expect(page.getByRole("heading", { name: "When is it?" })).toBeFocused();

  // Quick pick a date, then a time from the list.
  await page.getByTestId("content-startsAt-trigger").click();
  await page.getByRole("button", { name: /^Next Saturday/ }).click();
  await page.getByRole("option", { name: "7:30 pm" }).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(page.getByTestId("content-startsAt-trigger")).toContainText("7:30 pm");
  await waitForDraft(page, id, (d) => ((d.content as Content).startsAt ?? "").includes("T19:30"), true);

  // Keyboard: arrows move through the month, Enter picks the day.
  await page.getByTestId("content-startsAt-trigger").click();
  const selected = page.locator('[role="gridcell"][aria-selected="true"] button');
  const before = await selected.getAttribute("data-date");
  await selected.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(selected).not.toHaveAttribute("data-date", before!);
  await page.keyboard.press("Escape");

  // End time from a duration chip; the summary reads naturally.
  await page.getByRole("button", { name: /3 h/ }).first().click();
  await waitForDraft(page, id, (d) => ((d.content as Content).endsAt ?? "").includes("T22:30"), true);
  await expect(page.getByText(/7:30 pm – 10:30 pm/)).toBeVisible();

  // Next walks on; Back returns; optional steps can be skipped.
  await page.getByTestId("step-next").click();
  await expect(page.getByTestId("editor-step-where")).toBeVisible();
  await page.getByTestId("step-back").click();
  await expect(page.getByTestId("editor-step-when")).toBeVisible();
  await openStep(page, "schedule");
  await page.getByRole("button", { name: "Skip" }).click();
  await expect(page.getByTestId("editor-step-photos")).toBeVisible();

  // The last step leads to publishing.
  await openStep(page, "extras");
  await page.getByTestId("step-review").click();
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThanOrEqual(1);
});
