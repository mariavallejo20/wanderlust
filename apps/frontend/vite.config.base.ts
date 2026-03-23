import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import type { UserConfig } from "vite";
import svgr from "vite-plugin-svgr";
import tsconfigPaths from "vite-tsconfig-paths";

const baseConfig: UserConfig = {
    plugins: [
        react({ tsDecorators: true }),
        tsconfigPaths(),
        svgr(),
        tailwindcss(),
    ],
    build: {
        target: "ES2023",
    },
    css: {
        preprocessorOptions: {
            scss: {
                api: "modern-compiler",
            },
        },
    },
};

export default baseConfig;
