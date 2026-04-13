import { describe, expect, test } from "vitest";

import { createMockTrip } from "@trip/domain/mocks/trip.mock";
import type { TripInputProps } from "@trip/domain/models/trip.model";
import { Trip, TripStatusSchema } from "@trip/domain/models/trip.model";

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

describe("Trip model", () => {
    describe("factory method", () => {
        test("should create a valid Trip with all required fields", () => {
            const trip = createMockTrip();

            expect(trip.id).toBe("12345678-1234-4123-a123-123456789012");
            expect(trip.title).toBe("Viaje a Roma");
            expect(trip.destination).toBe("Italia");
            expect(trip.status).toBe("DRAFT");
            expect(trip.currency).toBe("EUR");
        });

        test("should reject Trip with empty title", () => {
            const result = Trip.create({ ...mockProps, title: "" });

            expect(result.isErr()).toBe(true);
        });

        test("should reject Trip with invalid UUID", () => {
            const result = Trip.create({ ...mockProps, id: "not-a-uuid" });

            expect(result.isErr()).toBe(true);
        });

        test("should reject Trip when endDate is before startDate", () => {
            const result = Trip.create({
                ...mockProps,
                startDate: "2026-04-22",
                endDate: "2026-04-15",
            });

            expect(result.isErr()).toBe(true);
        });

        test("should accept Trip when endDate equals startDate", () => {
            const result = Trip.create({
                ...mockProps,
                startDate: "2026-04-15",
                endDate: "2026-04-15",
            });

            expect(result.isOk()).toBe(true);
        });
    });

    describe("TripStatusSchema", () => {
        test("should accept all valid statuses", () => {
            const statuses = ["DRAFT", "UPCOMING", "IN_PROGRESS", "COMPLETED"];

            for (const status of statuses) {
                expect(TripStatusSchema.safeParse(status).success).toBe(true);
            }
        });

        test("should reject invalid status", () => {
            expect(TripStatusSchema.safeParse("ACTIVE").success).toBe(false);
        });
    });

    describe("computed properties", () => {
        test("should return 1 for durationInDays when start equals end", () => {
            const trip = createMockTrip({
                startDate: "2026-04-15",
                endDate: "2026-04-15",
            });

            expect(trip.durationInDays).toBe(1);
        });

        test("should calculate durationInDays correctly for a multi-day trip", () => {
            const trip = createMockTrip({
                startDate: "2026-04-01",
                endDate: "2026-04-07",
            });

            expect(trip.durationInDays).toBe(7);
        });

        test("should return true for isActive when status is IN_PROGRESS", () => {
            const trip = createMockTrip({ status: "IN_PROGRESS" });

            expect(trip.isActive).toBe(true);
        });

        test("should return false for isActive when status is not IN_PROGRESS", () => {
            const trip = createMockTrip({ status: "DRAFT" });

            expect(trip.isActive).toBe(false);
        });

        test("should return true for isDraft when status is DRAFT", () => {
            const trip = createMockTrip({ status: "DRAFT" });

            expect(trip.isDraft).toBe(true);
        });

        test("should return false for isDraft when status is not DRAFT", () => {
            const trip = createMockTrip({ status: "UPCOMING" });

            expect(trip.isDraft).toBe(false);
        });

        test("should return true for isPast when status is COMPLETED", () => {
            const trip = createMockTrip({ status: "COMPLETED" });

            expect(trip.isPast).toBe(true);
        });

        test("should return false for isPast when status is not COMPLETED", () => {
            const trip = createMockTrip({ status: "IN_PROGRESS" });

            expect(trip.isPast).toBe(false);
        });
    });

    describe("validate", () => {
        test("should return Ok with validated props on valid input", () => {
            const result = Trip.validate(mockProps);

            expect(result.isOk()).toBe(true);
        });

        test("should return Err on invalid input", () => {
            const result = Trip.validate({ ...mockProps, destination: "" });

            expect(result.isErr()).toBe(true);
        });
    });

    describe("toCreateProps", () => {
        test("should return props that can recreate the same Trip", () => {
            const trip = createMockTrip();
            const props = trip.toCreateProps();
            const recreated = Trip.create(props)._unsafeUnwrap();

            expect(recreated.id).toBe(trip.id);
            expect(recreated.title).toBe(trip.title);
            expect(recreated.destination).toBe(trip.destination);
            expect(recreated.status).toBe(trip.status);
        });
    });
});
