import type { KnipConfig } from "knip";

const config: KnipConfig = {
    workspaces: {
        ".": {
            ignoreDependencies: [
                "concurrently",
                "validate-branch-name",
                "@commitlint/types",
                "dotenv",
            ],
        },
        "apps/frontend": {
            entry: [
                "src/main.tsx",
                "src/**/*.stories.tsx",
                "src/tests/utils/index.ts",
                ".storybook/main.ts",
                ".storybook/preview.tsx",
            ],
            project: ["src/**/*.{ts,tsx}"],
            ignoreDependencies: [
                "tailwindcss",
                "vite-plugin-checker",
                "globals",
                "eslint-plugin-storybook",
                "playwright",
                "@testing-library/react",
                "@testing-library/user-event",
                "@total-typescript/ts-reset",
                "@types/luxon",
                "@vitest/browser",
                "@vitest/coverage-v8",
                "jsdom",
                "@wanderlust/@types/resources",
            ],
        },
    },
    ignore: ["validate-branch-name.config.ts"],
};

export default config;
