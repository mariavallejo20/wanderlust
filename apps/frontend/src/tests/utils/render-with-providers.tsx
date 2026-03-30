import { render, type RenderOptions } from "@testing-library/react";
import { type ReactElement, type ReactNode } from "react";
import { I18nextProvider } from "react-i18next";
import { MemoryRouter } from "react-router";

import { AntConfigProvider } from "@core/presentation/context/ant-config.provider";
import i18n from "../../i18n";

function AllProviders({ children }: { children: ReactNode }) {
    return (
        <I18nextProvider i18n={i18n}>
            <AntConfigProvider>
                <MemoryRouter>{children}</MemoryRouter>
            </AntConfigProvider>
        </I18nextProvider>
    );
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
    return render(ui, { wrapper: AllProviders, ...options });
}
