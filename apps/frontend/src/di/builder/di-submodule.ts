import type { interfaces } from "inversify";

export interface DiSubmodule {
    register(bind: interfaces.Bind): void;
}
