import type { UserConfig } from "vite";
import checker from "vite-plugin-checker";

const localConfig: UserConfig = {
    plugins: [
        checker({
            typescript: true,
            eslint: {
                useFlatConfig: true,
                lintCommand: 'eslint "./src/**/*.{ts,tsx}"',
            },
            stylelint: {
                lintCommand: 'stylelint "./src/**/*.{css,scss}"',
            },
            overlay: {
                initialIsOpen: "error",
            },
        }),
    ],
    server: {
        watch: {
            usePolling: true,
            ignored: ["**/coverage/**", "**/html/**"],
        },
        strictPort: true,
        host: "0.0.0.0",
        proxy: {
            "/api": {
                target:
                    process.env.VITE_PROXY_TARGET || "http://localhost:3000",
                changeOrigin: true,
            },
        },
    },
};

export default localConfig;
