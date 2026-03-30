import type { FC } from "react";

import { WlTypographyText } from "@core/presentation/components/general/typography/wl-typography.component";
import { WlLayoutHeader } from "@core/presentation/components/layout/wl-layout/wl-layout.component";
import { designTokens } from "@wanderlust/styles/design-tokens";

import { LanguageSelector } from "../language-selector/language-selector.component";

export const AppHeader: FC = () => {
    return (
        <WlLayoutHeader
            style={{ background: designTokens.color.primary }}
            className="tw:flex tw:items-center tw:justify-between tw:px-6"
        >
            <WlTypographyText
                strong
                className="tw:text-white tw:text-xl"
            >
                Wanderlust
            </WlTypographyText>
            <LanguageSelector />
        </WlLayoutHeader>
    );
};
