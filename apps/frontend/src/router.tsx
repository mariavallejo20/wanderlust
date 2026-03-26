import {
    createBrowserRouter,
    createRoutesFromElements,
    Route,
} from "react-router";

import { dashboardRouter } from "@dashboard/dashboard.router";

import { AppLayout } from "@core/presentation/components/layout/app-layout/app-layout.component";

export const router = createBrowserRouter(
    createRoutesFromElements(
        <Route element={<AppLayout />}>
            {dashboardRouter}
            <Route
                path="*"
                lazy={async () => {
                    const { NotFoundPage } =
                        await import("@core/presentation/pages/not-found/not-found-page");
                    return { Component: NotFoundPage };
                }}
            />
        </Route>,
    ),
);
