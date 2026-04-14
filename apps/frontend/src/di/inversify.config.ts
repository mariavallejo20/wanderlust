import { Container } from "inversify";

import { coreModule } from "@core/core-module.di";
import { dashboardModule } from "@dashboard/dashboard-module.di";
import { tripModule } from "@trip/trip-module.di";

const container = new Container();

container.loadSync(coreModule, tripModule, dashboardModule);

export { container };
