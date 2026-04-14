import { inject, injectable } from "inversify";
import { type ResultAsync } from "neverthrow";

import { CoreTypes } from "@core/core-types.di";
import type { WanderlustApiClient } from "@core/data/infrastructures/api/wanderlust-api-client";
import type { WanderlustError } from "@core/domain/errors/wanderlust.error";

import type { TripDto } from "@trip/data/dto/trip.dto";
import type { TripInputProps } from "@trip/domain/models/trip.model";

@injectable()
export class TripRemoteDatasource {
    static readonly BASE_PATH = "/trips";

    constructor(
        @inject(CoreTypes.WanderlustApiClient)
        private readonly apiClient: WanderlustApiClient,
    ) {}

    getAll(): ResultAsync<TripDto[], WanderlustError> {
        return this.apiClient.http
            .get<TripDto[]>(TripRemoteDatasource.BASE_PATH)
            .map((r) => r.data);
    }

    getById(id: string): ResultAsync<TripDto, WanderlustError> {
        return this.apiClient.http
            .get<TripDto>(`${TripRemoteDatasource.BASE_PATH}/${id}`)
            .map((r) => r.data);
    }

    create(props: TripInputProps): ResultAsync<TripDto, WanderlustError> {
        return this.apiClient.http
            .post<TripDto>(TripRemoteDatasource.BASE_PATH, props)
            .map((r) => r.data);
    }

    update(
        id: string,
        props: Partial<TripInputProps>,
    ): ResultAsync<TripDto, WanderlustError> {
        return this.apiClient.http
            .put<TripDto>(`${TripRemoteDatasource.BASE_PATH}/${id}`, props)
            .map((r) => r.data);
    }

    delete(id: string): ResultAsync<void, WanderlustError> {
        return this.apiClient.http
            .delete<void>(`${TripRemoteDatasource.BASE_PATH}/${id}`)
            .map(() => undefined);
    }
}
