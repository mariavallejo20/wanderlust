import { Layout } from "antd";
import type { FC } from "react";
import { Outlet } from "react-router";

import { AppHeader } from "../app-header/app-header.component";

export const AppLayout: FC = () => {
    return (
        <Layout className="tw:min-h-screen">
            <AppHeader />
            <Layout.Content className="tw:flex-1">
                <Outlet />
            </Layout.Content>
        </Layout>
    );
};
