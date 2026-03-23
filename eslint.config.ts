import eslint from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginZod from "eslint-plugin-zod";
import tseslint from "typescript-eslint";

export const baseConfig = [
    {
        ignores: [
            "node_modules/",
            "dist/",
            "build/",
            "coverage/",
            ".pnpm-store/",
            "*.tsbuildinfo",
            ".storybook/",
            "storybook-static/",
            "openspec/",
            "CLAUDE.md",
            "AGENTS.md",
        ],
    },
    {
        linterOptions: {
            reportUnusedDisableDirectives: "error" as const,
        },
    },
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
    pluginZod.configs.recommended,
    {
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                    caughtErrorsIgnorePattern: "^_",
                },
            ],
        },
    },
    eslintConfigPrettier,
];

export default baseConfig;
