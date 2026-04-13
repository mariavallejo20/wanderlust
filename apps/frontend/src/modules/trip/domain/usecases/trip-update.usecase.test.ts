import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripUpdateUseCase } from "@trip/domain/usecases/trip-update.usecase";

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

describe("TripUpdateUseCase", () => {
    it("should return Ok with the updated trip on success", async () => {
        const updatedTrip = createMockTrip({ title: "Roma actualizado" });
        const repo = makeMockRepo({
            update: vi.fn(() => okAsync(updatedTrip)),
        });
        const useCase = new TripUpdateUseCase(repo);

        const result = await useCase.execute(updatedTrip.id, {
            title: "Roma actualizado",
        });

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().title).toBe("Roma actualizado");
    });

    it("should return Err when trip is not found", async () => {
        const repo = makeMockRepo({
            update: vi.fn(() => errAsync(new FallbackError("not found"))),
        });
        const useCase = new TripUpdateUseCase(repo);

        const result = await useCase.execute("non-existing-id", {
            title: "Test",
        });

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });
});
