import { DiModuleBuilder } from "@di/builder/di-module-builder";

import { DashboardTypes } from "@dashboard/dashboard-types.di";
import { DashboardPageViewModel } from "@dashboard/presentation/pages/dashboard/dashboard-page.viewmodel";

const dashboardModule = new DiModuleBuilder("dashboard")
    .registerSubModules((_bind) => ({
        viewModels: {
            register: (bind) => {
                bind(DashboardTypes.DashboardPageViewModel).to(
                    DashboardPageViewModel,
                );
            },
        },
    }))
    .registerModule();

export { dashboardModule };
