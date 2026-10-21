import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // next/font/google is a build-time transform; stub it for component and unit tests.
      "next/font/google": path.resolve(__dirname, "tests/mocks/next-font-google.ts"),
      "server-only": path.resolve(__dirname, "tests/mocks/server-only.ts"),
      "@": path.resolve(__dirname, "."),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/component/**/*.test.{ts,tsx}"],
    exclude: ["tests/e2e/**", "tests/rls/**", "node_modules/**"],
    css: false,
  },
});
