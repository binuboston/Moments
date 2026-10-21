import { defineConfig } from "@playwright/test";
import base from "./playwright.config";

/** Opt-in visual regression for templates (see tests/visual/templates.visual.ts). */
export default defineConfig({
  ...base,
  testDir: "./tests/visual",
  testMatch: "**/*.visual.ts",
  snapshotPathTemplate: "{testDir}/__screenshots__/{projectName}/{arg}{ext}",
  timeout: 120_000,
});
