import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripCreateUseCase } from "@trip/domain/usecases/trip-create.usecase";

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

describe("TripCreateUseCase", () => {
    it("should return Ok with the created trip on success", async () => {
        const trip = createMockTrip();
        const repo = makeMockRepo({ create: vi.fn(() => okAsync(trip)) });
        const useCase = new TripCreateUseCase(repo);

        const result = await useCase.execute(trip.toCreateProps());

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().title).toBe("Viaje a Roma");
    });

    it("should return Err when repo returns an error", async () => {
        const trip = createMockTrip();
        const repo = makeMockRepo({
            create: vi.fn(() => errAsync(new FallbackError("create failed"))),
        });
        const useCase = new TripCreateUseCase(repo);

        const result = await useCase.execute(trip.toCreateProps());

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });
});
