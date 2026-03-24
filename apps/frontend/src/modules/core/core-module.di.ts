import { DiModuleBuilder } from "@di/builder/di-module-builder";

import { CoreTypes } from "./core-types.di";
import { WanderlustApiClient } from "./data/infrastructures/api/wanderlust-api-client";
import { AxiosHttp } from "./data/infrastructures/http/axios-http";
import { SessionStorage } from "./data/infrastructures/session-storage/session-storage";
import { EventBusImplRepository } from "./data/repositories/event-bus.impl-repository";

const coreModule = new DiModuleBuilder("core")
    .registerSubModules((_bind) => ({
        infrastructure: {
            register: (bind) => {
                bind(CoreTypes.HttpFactory).to(AxiosHttp).inSingletonScope();
                bind(CoreTypes.WanderlustApiClient)
                    .to(WanderlustApiClient)
                    .inSingletonScope();
                bind(CoreTypes.SessionStorage)
                    .to(SessionStorage)
                    .inSingletonScope();
            },
        },
        repositories: {
            register: (bind) => {
                bind(CoreTypes.EventBusRepository)
                    .to(EventBusImplRepository)
                    .inSingletonScope();
            },
        },
    }))
    .registerModule();

export { coreModule };
