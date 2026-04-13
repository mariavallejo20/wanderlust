import { DiModuleBuilder } from "@di/builder/di-module-builder";

import { TripCreateUseCase } from "@trip/domain/usecases/trip-create.usecase";
import { TripDeleteUseCase } from "@trip/domain/usecases/trip-delete.usecase";
import { TripGetByIdUseCase } from "@trip/domain/usecases/trip-get-by-id.usecase";
import { TripUpdateUseCase } from "@trip/domain/usecases/trip-update.usecase";
import { TripsGetAllUseCase } from "@trip/domain/usecases/trips-get-all.usecase";
import { TripTypes } from "@trip/trip-types.di";

const tripModule = new DiModuleBuilder("trip")
    .registerSubModules((_bind) => ({
        useCases: {
            register: (bind) => {
                bind(TripTypes.TripsGetAllUseCase).to(TripsGetAllUseCase);
                bind(TripTypes.TripGetByIdUseCase).to(TripGetByIdUseCase);
                bind(TripTypes.TripCreateUseCase).to(TripCreateUseCase);
                bind(TripTypes.TripUpdateUseCase).to(TripUpdateUseCase);
                bind(TripTypes.TripDeleteUseCase).to(TripDeleteUseCase);
            },
        },
    }))
    .registerModule();

export { tripModule };
