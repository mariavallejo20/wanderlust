/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_BASE_URL: string;
    readonly VITE_USE_MSW: string;
    readonly VITE_APP_STAGE: string;
    readonly VITE_MAP_TILE_URL: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
