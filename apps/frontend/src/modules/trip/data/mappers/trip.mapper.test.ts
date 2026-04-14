import { describe, expect, it } from "vitest";

import { FallbackError } from "@core/domain/errors/fallback.error";

import type { TripDto } from "@trip/data/dto/trip.dto";
import { TripMapper } from "@trip/data/mappers/trip.mapper";

const validDto: TripDto = {
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

describe("TripMapper", () => {
    it("should return Ok<Trip> for a valid DTO", () => {
        const result = TripMapper.toDomain(validDto);

        expect(result.isOk()).toBe(true);
        const trip = result._unsafeUnwrap();
        expect(trip.id).toBe(validDto.id);
        expect(trip.title).toBe(validDto.title);
        expect(trip.destination).toBe(validDto.destination);
        expect(trip.startDate).toBe(validDto.startDate);
        expect(trip.endDate).toBe(validDto.endDate);
        expect(trip.status).toBe(validDto.status);
        expect(trip.currency).toBe(validDto.currency);
    });

    it("should preserve optional fields when present", () => {
        const dto: TripDto = {
            ...validDto,
            description: "Una semana en la ciudad eterna",
            coverImage: "https://example.com/roma.jpg",
            tags: ["arte", "gastronomia"],
        };

        const result = TripMapper.toDomain(dto);

        expect(result.isOk()).toBe(true);
        const trip = result._unsafeUnwrap();
        expect(trip.description).toBe(dto.description);
        expect(trip.coverImage).toBe(dto.coverImage);
        expect(trip.tags).toEqual(dto.tags);
    });

    it("should return Err<FallbackError> when endDate < startDate", () => {
        const dto: TripDto = {
            ...validDto,
            startDate: "2026-04-22",
            endDate: "2026-04-15",
        };

        const result = TripMapper.toDomain(dto);

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });

    it("should return Err<FallbackError> for a DTO with an invalid UUID", () => {
        const dto: TripDto = { ...validDto, id: "not-a-uuid" };

        const result = TripMapper.toDomain(dto);

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof FallbackError);
    });
});
