import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    coverage: {
      provider: "c8",
      reporter: ["text", "lcov"],
      lines: 80,
      functions: 80,
      branches: 70,
      statements: 80,
    },
  },
});
