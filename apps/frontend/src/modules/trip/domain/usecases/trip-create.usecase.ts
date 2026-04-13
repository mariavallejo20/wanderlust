import type { ResultAsync } from "neverthrow";

import type { WanderlustError } from "@core/domain/errors/wanderlust.error";

import type { Trip, TripInputProps } from "@trip/domain/models/trip.model";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripTypes } from "@trip/trip-types.di";

import { inject, injectable } from "inversify";

@injectable()
export class TripCreateUseCase {
    constructor(
        @inject(TripTypes.TripRepository)
        private readonly repo: TripRepository,
    ) {}

    execute(props: TripInputProps): ResultAsync<Trip, WanderlustError> {
        return this.repo.create(props);
    }
}
