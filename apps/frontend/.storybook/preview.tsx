import type { Decorator, Preview } from "@storybook/react-vite";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";

import i18n from "../src/i18n";
import { AntConfigProvider } from "../src/modules/core/presentation/context/ant-config.provider";

const withProviders: Decorator = (Story) => (
    <I18nextProvider i18n={i18n}>
        <AntConfigProvider>
            <MemoryRouter>
                <Story />
            </MemoryRouter>
        </AntConfigProvider>
    </I18nextProvider>
);

const preview: Preview = {
    decorators: [withProviders],
    parameters: {
        layout: "centered",
        backgrounds: { default: "light" },
    },
};

export default preview;
