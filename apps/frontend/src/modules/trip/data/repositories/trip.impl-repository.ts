import { inject, injectable } from "inversify";
import { Result, type ResultAsync } from "neverthrow";

import type { WanderlustError } from "@core/domain/errors/wanderlust.error";

import { TripRemoteDatasource } from "@trip/data/datasources/trip-remote.datasource";
import { TripMapper } from "@trip/data/mappers/trip.mapper";
import type { Trip, TripInputProps } from "@trip/domain/models/trip.model";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripTypes } from "@trip/trip-types.di";

@injectable()
export class TripImplRepository implements TripRepository {
    constructor(
        @inject(TripTypes.TripDatasource)
        private readonly datasource: TripRemoteDatasource,
    ) {}

    getAll(): ResultAsync<Trip[], WanderlustError> {
        return this.datasource
            .getAll()
            .andThen((dtos) =>
                Result.combine(dtos.map((dto) => TripMapper.toDomain(dto))),
            );
    }

    getById(id: string): ResultAsync<Trip, WanderlustError> {
        return this.datasource
            .getById(id)
            .andThen((dto) => TripMapper.toDomain(dto));
    }

    create(props: TripInputProps): ResultAsync<Trip, WanderlustError> {
        return this.datasource
            .create(props)
            .andThen((dto) => TripMapper.toDomain(dto));
    }

    update(
        id: string,
        props: Partial<TripInputProps>,
    ): ResultAsync<Trip, WanderlustError> {
        return this.datasource
            .update(id, props)
            .andThen((dto) => TripMapper.toDomain(dto));
    }

    delete(id: string): ResultAsync<void, WanderlustError> {
        return this.datasource.delete(id);
    }
}
