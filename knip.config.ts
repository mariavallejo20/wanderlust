import type { KnipConfig } from "knip";

const config: KnipConfig = {
    workspaces: {
        "apps/frontend": {
            entry: ["src/main.tsx"],
            project: ["src/**/*.{ts,tsx}"],
            ignoreDependencies: [
                "@tailwindcss/vite",
                "tailwindcss",
                "@vitejs/plugin-react-swc",
                "vite-plugin-checker",
                "vite-plugin-svgr",
                "globals",
            ],
        },
    },
    ignore: ["validate-branch-name.config.ts"],
};

export default config;
