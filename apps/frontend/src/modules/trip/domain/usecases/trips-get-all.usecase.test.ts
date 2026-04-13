import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripsGetAllUseCase } from "@trip/domain/usecases/trips-get-all.usecase";

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
    it("should return Ok with a list of trips on success", async () => {
        const trip = createMockTrip();
        const repo = makeMockRepo({ getAll: vi.fn(() => okAsync([trip])) });
        const useCase = new TripsGetAllUseCase(repo);

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toHaveLength(1);
    });

    it("should return Ok with an empty list when there are no trips", async () => {
        const repo = makeMockRepo({ getAll: vi.fn(() => okAsync([])) });
        const useCase = new TripsGetAllUseCase(repo);

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toHaveLength(0);
    });

    it("should return Err when repo returns an error", async () => {
        const repo = makeMockRepo({
            getAll: vi.fn(() => errAsync(new FallbackError("fetch failed"))),
        });
        const useCase = new TripsGetAllUseCase(repo);

        const result = await useCase.execute();

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });
});
