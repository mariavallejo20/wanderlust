import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripDeleteUseCase } from "@trip/domain/usecases/trip-delete.usecase";

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

describe("TripDeleteUseCase", () => {
    it("should return Ok when trip is deleted successfully", async () => {
        const repo = makeMockRepo({ delete: vi.fn(() => okAsync(undefined)) });
        const useCase = new TripDeleteUseCase(repo);

        const result = await useCase.execute(
            "12345678-1234-4123-a123-123456789012",
        );

        expect(result.isOk()).toBe(true);
    });

    it("should return Err when trip is not found", async () => {
        const repo = makeMockRepo({
            delete: vi.fn(() => errAsync(new FallbackError("not found"))),
        });
        const useCase = new TripDeleteUseCase(repo);

        const result = await useCase.execute("non-existing-id");

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });
});
