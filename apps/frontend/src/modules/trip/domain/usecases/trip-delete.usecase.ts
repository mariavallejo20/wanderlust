import type { ResultAsync } from "neverthrow";

import type { WanderlustError } from "@core/domain/errors/wanderlust.error";

import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripTypes } from "@trip/trip-types.di";

import { inject, injectable } from "inversify";

@injectable()
export class TripDeleteUseCase {
    constructor(
        @inject(TripTypes.TripRepository)
        private readonly repo: TripRepository,
    ) {}

    execute(id: string): ResultAsync<void, WanderlustError> {
        return this.repo.delete(id);
    }
}
