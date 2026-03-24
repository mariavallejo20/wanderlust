import type { DiType } from "./di-type";

export interface DiTypes {
    datasources?: DiType;
    infrastructure?: DiType;
    repositories?: DiType;
    mappers?: DiType;
    useCases?: DiType;
    viewModels?: DiType;
    stores?: DiType;
}
