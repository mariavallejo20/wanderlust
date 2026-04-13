import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import type { TripInputProps } from "@trip/domain/models/trip.model";
import { Trip } from "@trip/domain/models/trip.model";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripsGetAllUseCase } from "@trip/domain/usecases/trips-get-all.usecase";

const mockProps: TripInputProps = {
    id: "12345678-1234-4123-a123-123456789012",
    title: "Viaje a Roma",
    destination: "Italia",
    startDate: "2026-04-15",
    endDate: "2026-04-22",
    status: "DRAFT",
    currency: "EUR",
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

function makeMockRepo(overrides?: Partial<TripRepository>): TripRepository {
    return {
        getAll: vi.fn(),
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
        ...overrides,
    };
}

describe("TripsGetAllUseCase", () => {
    it("returns Ok with a list of trips", async () => {
        const trip = Trip.create(mockProps)._unsafeUnwrap();
        const repo = makeMockRepo({ getAll: vi.fn(() => okAsync([trip])) });
        const useCase = new TripsGetAllUseCase(repo);

        const result = await useCase.execute();

        expect(result).toBeOk();
        expect(result._unsafeUnwrap()).toHaveLength(1);
    });

    it("returns Ok with an empty array when repo has no trips", async () => {
        const repo = makeMockRepo({ getAll: vi.fn(() => okAsync([])) });
        const useCase = new TripsGetAllUseCase(repo);

        const result = await useCase.execute();

        expect(result).toBeOk();
        expect(result._unsafeUnwrap()).toEqual([]);
    });

    it("returns Err when repo returns an error", async () => {
        const repo = makeMockRepo({
            getAll: vi.fn(() => errAsync(new FallbackError("network error"))),
        });
        const useCase = new TripsGetAllUseCase(repo);

        const result = await useCase.execute();

        expect(result).toBeErr();
    });
});
