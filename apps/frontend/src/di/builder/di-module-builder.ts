import { ContainerModule, type interfaces } from "inversify";

import type { DiSubmodule } from "./di-submodule";

type SubModuleFactory = (bind: interfaces.Bind) => Record<string, DiSubmodule>;

export class DiModuleBuilder {
    private readonly moduleName: string;
    private factory: SubModuleFactory | undefined;

    constructor(moduleName: string) {
        this.moduleName = moduleName;
    }

    registerSubModules(factory: SubModuleFactory): this {
        this.factory = factory;
        return this;
    }

    registerModule(): ContainerModule {
        return new ContainerModule((options) => {
            if (!this.factory) {
                return;
            }

            const submodules = this.factory(options.bind);

            for (const submodule of Object.values(submodules)) {
                submodule.register(options.bind);
            }
        });
    }
}
