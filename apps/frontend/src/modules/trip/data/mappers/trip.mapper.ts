import type { Result } from "neverthrow";

import { FallbackError } from "@core/domain/errors/fallback.error";
import type { WanderlustError } from "@core/domain/errors/wanderlust.error";

import type { TripDto } from "@trip/data/dto/trip.dto";
import { Trip } from "@trip/domain/models/trip.model";

export class TripMapper {
    static toDomain(dto: TripDto): Result<Trip, WanderlustError> {
        return Trip.create(dto).mapErr(
            (error) => new FallbackError(error.message),
        );
    }
}
