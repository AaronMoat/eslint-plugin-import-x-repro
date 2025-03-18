import globals from "globals";
import js from "@eslint/js";
import eslintPluginImportX from "eslint-plugin-import-x";

export default [
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: globals.node,
    },
  },
  js.configs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
];
