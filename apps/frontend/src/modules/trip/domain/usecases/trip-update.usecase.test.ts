import { errAsync, okAsync } from "neverthrow";
import { describe, expect, it, vi } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import type { TripInputProps } from "@trip/domain/models/trip.model";
import { Trip } from "@trip/domain/models/trip.model";
import type { TripRepository } from "@trip/domain/repositories/trip.repository";
import { TripUpdateUseCase } from "@trip/domain/usecases/trip-update.usecase";

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

describe("TripUpdateUseCase", () => {
    it("returns Ok with the updated trip on success", async () => {
        const updatedTrip = Trip.create({
            ...mockProps,
            title: "Roma actualizado",
        })._unsafeUnwrap();
        const repo = makeMockRepo({
            update: vi.fn(() => okAsync(updatedTrip)),
        });
        const useCase = new TripUpdateUseCase(repo);

        const result = await useCase.execute(mockProps.id, {
            title: "Roma actualizado",
        });

        expect(result).toBeOk();
        expect(result._unsafeUnwrap().title).toBe("Roma actualizado");
    });

    it("returns Err when trip is not found", async () => {
        const repo = makeMockRepo({
            update: vi.fn(() => errAsync(new FallbackError("not found"))),
        });
        const useCase = new TripUpdateUseCase(repo);

        const result = await useCase.execute("non-existing-id", {
            title: "Test",
        });

        expect(result).toBeErr();
    });
});
