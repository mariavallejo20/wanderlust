import "reflect-metadata";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./di/inversify.config";
import "./i18n";
import "./styles/tailwind.css";

async function enableMocking() {
    if (import.meta.env.VITE_USE_MSW !== "true") return;
    const { worker } = await import("./tests/msw/browser");
    return worker.start({ onUnhandledRequest: "bypass" });
}

enableMocking().then(() => {
    createRoot(document.getElementById("root")!).render(
        <StrictMode>
            <App />
        </StrictMode>,
    );
});
