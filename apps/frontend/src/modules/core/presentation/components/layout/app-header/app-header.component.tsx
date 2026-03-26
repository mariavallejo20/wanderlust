import { Layout, Typography } from "antd";
import type { FC } from "react";

import { designTokens } from "@wanderlust/styles/design-tokens";

import { LanguageSelector } from "../language-selector/language-selector.component";

export const AppHeader: FC = () => {
    return (
        <Layout.Header
            style={{ background: designTokens.color.primary }}
            className="tw:flex tw:items-center tw:justify-between tw:px-6"
        >
            <Typography.Text
                strong
                className="tw:text-white tw:text-xl"
            >
                Wanderlust
            </Typography.Text>
            <LanguageSelector />
        </Layout.Header>
    );
};
