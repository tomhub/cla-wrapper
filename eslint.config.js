// eslint.config.js
import parser from "@typescript-eslint/parser";
import pluginTs from "@typescript-eslint/eslint-plugin";
import pluginImport from "eslint-plugin-import";
import pluginPrettier from "eslint-plugin-prettier";

export default [
  {
    ignores: ["dist/**", "node_modules/**", "**/*.d.ts"],
  },
  {
    files: ["src/**/*.ts", "test/**/*.ts"],
    languageOptions: {
      parser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: "module",
        project: "./tsconfig.eslint.json",
      },
    },
    plugins: {
      "@typescript-eslint": pluginTs,
      import: pluginImport,
      prettier: pluginPrettier,
    },
    rules: {
      "@typescript-eslint/explicit-module-boundary-types": "off",
      "import/no-unresolved": "off",
      "prettier/prettier": "error",
    },
  },
];
