import { defineConfig, mergeConfig } from "vite";
import baseConfig from "./vite.config.base";
import localConfig from "./vite.config.local";
import prodConfig from "./vite.config.prod";

export default defineConfig(({ command }) => {
    if (command === "serve") {
        return mergeConfig(baseConfig, localConfig);
    }
    return mergeConfig(baseConfig, prodConfig);
});
