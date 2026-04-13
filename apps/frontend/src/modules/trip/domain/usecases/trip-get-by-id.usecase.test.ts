import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import type { TripInputProps } from "@trip/domain/models/trip.model";
import { Trip } from "@trip/domain/models/trip.model";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripGetByIdUseCase } from "@trip/domain/usecases/trip-get-by-id.usecase";

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

describe("TripGetByIdUseCase", () => {
    it("returns Ok with the trip when found", async () => {
        const trip = Trip.create(mockProps)._unsafeUnwrap();
        const repo = makeMockRepo({ getById: vi.fn(() => okAsync(trip)) });
        const useCase = new TripGetByIdUseCase(repo);

        const result = await useCase.execute(mockProps.id);

        expect(result).toBeOk();
        expect(result._unsafeUnwrap().id).toBe(mockProps.id);
    });

    it("returns Err when trip is not found", async () => {
        const repo = makeMockRepo({
            getById: vi.fn(() => errAsync(new FallbackError("not found"))),
        });
        const useCase = new TripGetByIdUseCase(repo);

        const result = await useCase.execute("non-existing-id");

        expect(result).toBeErr();
    });
});
