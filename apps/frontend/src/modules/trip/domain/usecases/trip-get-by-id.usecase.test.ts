import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripGetByIdUseCase } from "@trip/domain/usecases/trip-get-by-id.usecase";

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

describe("TripGetByIdUseCase", () => {
    it("should return Ok with the trip when found", async () => {
        const trip = createMockTrip();
        const repo = makeMockRepo({ getById: vi.fn(() => okAsync(trip)) });
        const useCase = new TripGetByIdUseCase(repo);

        const result = await useCase.execute(trip.id);

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().id).toBe(trip.id);
    });

    it("should return Err when trip is not found", async () => {
        const repo = makeMockRepo({
            getById: vi.fn(() => errAsync(new FallbackError("not found"))),
        });
        const useCase = new TripGetByIdUseCase(repo);

        const result = await useCase.execute("non-existing-id");

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });
});
