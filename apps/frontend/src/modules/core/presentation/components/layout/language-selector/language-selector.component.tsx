import { Select } from "antd";
import type { FC } from "react";
import { useTranslation } from "react-i18next";

const languageOptions = [
    { value: "es", label: "ES" },
    { value: "en", label: "EN" },
];

export const LanguageSelector: FC = () => {
    const { i18n } = useTranslation();

    return (
        <Select
            value={i18n.language}
            options={languageOptions}
            onChange={(lng) => i18n.changeLanguage(lng)}
            variant="borderless"
            style={{ color: "white", width: 70 }}
        />
    );
};
