import { defineConfig } from "vitest/config";
import baseConfig from "./vite.config.base";

export default defineConfig({
    ...baseConfig,
    test: {
        projects: [
            {
                extends: true,
                test: {
                    name: "unit",
                    include: ["src/**/*.test.{ts,tsx}"],
                    environment: "jsdom",
                    setupFiles: ["src/tests/setup/vitest-setup.ts"],
                    globals: true,
                },
            },
            {
                extends: true,
                test: {
                    name: "integration",
                    include: ["src/**/*.integration.{ts,tsx}"],
                    environment: "jsdom",
                    setupFiles: ["src/tests/setup/vitest-setup.ts"],
                    globals: true,
                    testTimeout: 30_000,
                    hookTimeout: 30_000,
                },
            },
        ],
        coverage: {
            provider: "v8",
            include: ["src/**/*.{ts,tsx}"],
            exclude: [
                "src/tests/**",
                "src/**/*.stories.tsx",
                "src/**/*.mock.ts",
                "src/**/*.di.ts",
                "src/di/**",
                "src/main.tsx",
                "src/router.tsx",
                "src/i18n.ts",
            ],
            thresholds: {
                lines: 70,
                functions: 70,
                statements: 70,
                branches: 60,
            },
            reporter: ["text", "lcov", "html"],
        },
    },
});
