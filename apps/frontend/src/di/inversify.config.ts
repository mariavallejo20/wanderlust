import { Container } from "inversify";

import { coreModule } from "@core/core-module.di";

const container = new Container();

container.loadSync(coreModule);

export { container };
