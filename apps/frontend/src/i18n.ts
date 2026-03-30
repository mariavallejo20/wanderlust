import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";
import { initReactI18next } from "react-i18next";

const localeFiles = import.meta.glob("/public/locales/es/*.json");
const namespaces = Object.keys(localeFiles).map((path) =>
    path.replace("/public/locales/es/", "").replace(".json", ""),
);

i18n.use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        fallbackLng: "en",
        supportedLngs: ["es", "en"],
        defaultNS: "common",
        ns: namespaces,
        detection: {
            order: ["querystring", "localStorage", "navigator"],
            lookupQuerystring: "lng",
            lookupLocalStorage: "i18nextLng",
            caches: ["localStorage"],
        },
        backend: {
            loadPath: "/locales/{{lng}}/{{ns}}.json",
        },
        interpolation: {
            escapeValue: false,
        },
    });

export default i18n;
