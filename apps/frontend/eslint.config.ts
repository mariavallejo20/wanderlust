import pluginVitest from "@vitest/eslint-plugin";
import reactHooks from "eslint-plugin-react-hooks";
import { baseConfig } from "../../eslint.config.ts";

export default [
    {
        ignores: [
            "eslint.config.*",
            "vite.config.*",
            "lint-staged.config.*",
            "playwright.config.*",
            "stylelint.config.*",
            "vitest.config.*",
            "public/mockServiceWorker.js",
            "public/locales/**",
        ],
    },
    ...baseConfig,
    ...reactHooks.configs["flat/recommended"],
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
            },
        },
        rules: {
            "no-console": "warn",
        },
    },
    {
        files: ["src/**/*.{test,integration,browser}.{ts,tsx}"],
        plugins: { vitest: pluginVitest },
        rules: {
            ...pluginVitest.configs.recommended.rules,
            "vitest/no-disabled-tests": "warn",
            "vitest/expect-expect": "error",
        },
        settings: { vitest: { typecheck: true } },
    },
];
