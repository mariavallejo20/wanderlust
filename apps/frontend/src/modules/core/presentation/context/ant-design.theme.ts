import type { ThemeConfig } from "antd";

import { designTokens } from "@wanderlust/styles/design-tokens";

const { color, font, radius, control, shadow } = designTokens;

export const antDesignTheme: ThemeConfig = {
    token: {
        colorPrimary: color.primary,
        colorSuccess: color.success,
        colorError: color.error,
        colorWarning: color.warning,
        colorInfo: color.primary,
        colorLink: color.primary,
        colorText: color.text,
        colorTextSecondary: color.textSecondary,
        colorTextTertiary: color.textTertiary,
        colorBgContainer: color.bgContainer,
        colorBgLayout: color.bgLayout,
        colorBorder: color.border,
        colorBorderSecondary: color.borderSecondary,
        fontFamily: font.wanderlust,
        fontSize: font.sizeSm,
        fontSizeHeading1: font.size2xl,
        fontSizeHeading2: font.sizeXl,
        fontSizeHeading3: font.sizeLg,
        fontSizeHeading4: font.sizeBase,
        fontSizeHeading5: font.sizeSm,
        borderRadius: radius.default,
        borderRadiusLG: radius.lg,
        borderRadiusSM: radius.sm,
        controlHeight: control.height,
        controlHeightLG: control.heightLg,
        controlHeightSM: control.heightSm,
        boxShadow: shadow.sm,
        boxShadowSecondary: shadow.md,
    },
    components: {
        Button: {
            fontFamily: font.wanderlust,
            fontWeight: 600,
            primaryShadow: "none",
        },
        Input: {
            activeShadow: "none",
            activeBorderColor: color.primary,
        },
        Select: {
            fontFamily: font.wanderlust,
        },
        Modal: {
            titleFontSize: font.sizeLg,
            fontFamily: font.wanderlust,
        },
        Form: {
            verticalLabelPadding: "0 0 4px",
            labelFontSize: font.sizeSm,
        },
        Card: {
            borderRadiusLG: radius.default,
        },
    },
};
