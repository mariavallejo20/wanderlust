import { Route } from "react-router";

export const dashboardRouter = (
    <Route
        index
        lazy={async () => {
            const { DashboardPage } =
                await import("@dashboard/presentation/pages/dashboard/dashboard-page");
            return { Component: DashboardPage };
        }}
    />
);
