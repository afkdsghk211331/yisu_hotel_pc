import js from "@eslint/js";
import globals from "globals";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default [
  // 忽略构建产物
  { ignores: ["dist/**", "node_modules/**"] },

  js.configs.recommended,
  ...tseslint.configs.recommended,

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    plugins: {
      react,
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      // React Hooks 规则
      ...reactHooks.configs.recommended.rules,

      // Vite HMR：只允许导出组件/常量，避免热更新失效
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],

      // TS 项目里这条常见：允许未使用变量以 _ 开头
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // React 17+ 不需要显式 import React
      "react/react-in-jsx-scope": "off",
    },
  },

  // 关闭与 Prettier 冲突的 ESLint 规则（关键）
  prettierConfig,
];
