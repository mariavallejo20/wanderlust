import cssRaw from "./design-tokens.css?raw";

function parseVar(name: string): string {
    const re = new RegExp(`${name}:\\s*([\\s\\S]+?)\\s*;`);
    const match = cssRaw.match(re);
    if (!match)
        throw new Error(
            `Design token "${name}" not found in design-tokens.css`,
        );
    return match[1].replace(/\s+/g, " ").trim();
}

function parseNum(name: string): number {
    return parseInt(parseVar(name), 10);
}

export const designTokens = {
    color: {
        primary: parseVar("--color-primary"),
        primaryLight: parseVar("--color-primary-light"),
        success: parseVar("--color-success"),
        error: parseVar("--color-error"),
        warning: parseVar("--color-warning"),
        text: parseVar("--color-text"),
        textSecondary: parseVar("--color-text-secondary"),
        textTertiary: parseVar("--color-text-tertiary"),
        bgContainer: parseVar("--color-bg-container"),
        bgLayout: parseVar("--color-bg-layout"),
        border: parseVar("--color-border"),
        borderSecondary: parseVar("--color-border-secondary"),
    },
    font: {
        wanderlust: parseVar("--font-wanderlust"),
        sizeSm: parseNum("--font-size-sm"),
        sizeBase: parseNum("--font-size-base"),
        sizeLg: parseNum("--font-size-lg"),
        sizeXl: parseNum("--font-size-xl"),
        size2xl: parseNum("--font-size-2xl"),
    },
    radius: {
        default: parseNum("--radius-default"),
        lg: parseNum("--radius-lg"),
        sm: parseNum("--radius-sm"),
    },
    control: {
        height: parseNum("--control-height"),
        heightLg: parseNum("--control-height-lg"),
        heightSm: parseNum("--control-height-sm"),
    },
    shadow: {
        sm: parseVar("--shadow-sm"),
        md: parseVar("--shadow-md"),
    },
} as const;
