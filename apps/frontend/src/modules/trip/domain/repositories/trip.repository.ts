import type { ResultAsync } from "neverthrow";

import type { WanderlustError } from "@core/domain/errors/wanderlust.error";

import type { Trip, TripInputProps } from "@trip/domain/models/trip.model";

export interface TripRepository {
    getAll(): ResultAsync<Trip[], WanderlustError>;
    getById(id: string): ResultAsync<Trip, WanderlustError>;
    create(props: TripInputProps): ResultAsync<Trip, WanderlustError>;
    update(
        id: string,
        props: Partial<TripInputProps>,
    ): ResultAsync<Trip, WanderlustError>;
    delete(id: string): ResultAsync<void, WanderlustError>;
}
