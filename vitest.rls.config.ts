import { defineConfig } from "vitest/config";
import path from "node:path";

// Runs against a live (local) Supabase stack. See docs/SETUP.md.
export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environment: "node",
    globals: true,
    include: ["tests/rls/**/*.test.ts"],
    setupFiles: ["./tests/rls/setup.ts"],
    testTimeout: 30_000,
    hookTimeout: 60_000,
    fileParallelism: false,
  },
});
