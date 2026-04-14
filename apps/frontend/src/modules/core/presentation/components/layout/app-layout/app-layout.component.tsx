import type { FC } from "react";
import { Outlet } from "react-router";

import {
    WlLayout,
    WlLayoutContent,
} from "@core/presentation/components/layout/wl-layout/wl-layout.component";

import { AppHeader } from "../app-header/app-header.component";

export const AppLayout: FC = () => {
    return (
        <WlLayout className="tw:min-h-screen">
            <AppHeader />
            <WlLayoutContent className="tw:flex-1 tw:overflow-auto">
                <Outlet />
            </WlLayoutContent>
        </WlLayout>
    );
};
