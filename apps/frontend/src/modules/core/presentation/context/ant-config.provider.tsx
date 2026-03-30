import { ConfigProvider } from "antd";
import type { Locale } from "antd/es/locale";
import en_GB from "antd/locale/en_GB";
import es_ES from "antd/locale/es_ES";
import type { FC, PropsWithChildren } from "react";
import { useTranslation } from "react-i18next";

import { antDesignTheme } from "./ant-design.theme";

const locales: Record<string, Locale> = {
    es: es_ES,
    en: en_GB,
};

export const AntConfigProvider: FC<PropsWithChildren> = ({ children }) => {
    const { i18n } = useTranslation();
    const locale = locales[i18n.language] ?? locales.es;

    return (
        <ConfigProvider
            locale={locale}
            theme={antDesignTheme}
        >
            {children}
        </ConfigProvider>
    );
};
