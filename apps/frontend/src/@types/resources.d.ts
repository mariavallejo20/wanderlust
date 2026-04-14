import type common from "../../public/locales/en/common.json";
import type dashboard from "../../public/locales/en/dashboard.json";
import type validation from "../../public/locales/en/validation.json";

interface Resources {
    common: typeof common;
    dashboard: typeof dashboard;
    validation: typeof validation;
}

export default Resources;
