// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",

    // Run setup files before tests (e.g. polyfills, mocks)
    setupFiles: ["./test/setup.ts"],

    // Coverage configuration
    coverage: {
      provider: "c8", // or 'v8' if you prefer native
      reporter: ["text", "lcov", "html"], // add HTML for CI artifacts
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
      exclude: ["test/**", "node_modules/**"], // exclude non-source files
    },

    // Performance tweaks
    include: ["src/**/*.test.{ts,tsx}"], // explicit test file glob
    watch: false, // disable watch mode in CI
  },
});
