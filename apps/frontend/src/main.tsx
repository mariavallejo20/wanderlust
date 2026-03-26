import "reflect-metadata";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./di/inversify.config";
import "./i18n";
import "./styles/tailwind.css";

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <App />
    </StrictMode>,
);
