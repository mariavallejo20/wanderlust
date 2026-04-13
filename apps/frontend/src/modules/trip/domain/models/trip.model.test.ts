import { describe, expect, it } from "vitest";

import type { TripInputProps } from "@trip/domain/models/trip.model";
import { Trip, TripStatusSchema } from "@trip/domain/models/trip.model";

const createMockTrip = (overrides?: Partial<TripInputProps>): Trip => {
    const props: TripInputProps = {
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
        ...overrides,
    };
    return Trip.create(props)._unsafeUnwrap();
};

describe("Trip.create()", () => {
    it("returns Ok with a valid Trip instance for valid props", () => {
        const result = Trip.create({
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
        });
        expect(result).toBeOk();
        expect(result._unsafeUnwrap().title).toBe("Viaje a Roma");
    });

    it("returns Err when title is empty", () => {
        const result = Trip.create({
            id: "12345678-1234-4123-a123-123456789012",
            title: "",
            destination: "Italia",
            startDate: "2026-04-15",
            endDate: "2026-04-22",
            status: "DRAFT",
            currency: "EUR",
            tags: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
        expect(result).toBeErr();
        expect(
            result
                ._unsafeUnwrapErr()
                .issues.some((i) => i.path.includes("title")),
        ).toBe(true);
    });

    it("returns Err when id is not a valid UUID", () => {
        const result = Trip.create({
            id: "not-a-uuid",
            title: "Viaje a Roma",
            destination: "Italia",
            startDate: "2026-04-15",
            endDate: "2026-04-22",
            status: "DRAFT",
            currency: "EUR",
            tags: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
        expect(result).toBeErr();
        expect(
            result._unsafeUnwrapErr().issues.some((i) => i.path.includes("id")),
        ).toBe(true);
    });

    it("returns Err on endDate path when endDate < startDate", () => {
        const result = Trip.create({
            id: "12345678-1234-4123-a123-123456789012",
            title: "Viaje a Roma",
            destination: "Italia",
            startDate: "2026-04-22",
            endDate: "2026-04-15",
            status: "DRAFT",
            currency: "EUR",
            tags: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
        expect(result).toBeErr();
        expect(
            result
                ._unsafeUnwrapErr()
                .issues.some((i) => i.path.includes("endDate")),
        ).toBe(true);
    });

    it("returns Ok when endDate equals startDate", () => {
        const result = Trip.create({
            id: "12345678-1234-4123-a123-123456789012",
            title: "Viaje a Roma",
            destination: "Italia",
            startDate: "2026-04-15",
            endDate: "2026-04-15",
            status: "DRAFT",
            currency: "EUR",
            tags: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
        expect(result).toBeOk();
    });
});

describe("TripStatusSchema", () => {
    it.each(["DRAFT", "UPCOMING", "IN_PROGRESS", "COMPLETED"])(
        "accepts valid status: %s",
        (status) => {
            expect(TripStatusSchema.safeParse(status).success).toBe(true);
        },
    );

    it("rejects unknown status value", () => {
        expect(TripStatusSchema.safeParse("ACTIVE").success).toBe(false);
    });
});

describe("Trip computed properties", () => {
    it("durationInDays is 1 for a single-day trip", () => {
        const trip = createMockTrip({
            startDate: "2026-04-15",
            endDate: "2026-04-15",
        });
        expect(trip.durationInDays).toBe(1);
    });

    it("durationInDays is 7 for a 7-day trip", () => {
        const trip = createMockTrip({
            startDate: "2026-04-01",
            endDate: "2026-04-07",
        });
        expect(trip.durationInDays).toBe(7);
    });

    it("isActive is true only for IN_PROGRESS status", () => {
        const trip = createMockTrip({ status: "IN_PROGRESS" });
        expect(trip.isActive).toBe(true);
        expect(trip.isPast).toBe(false);
        expect(trip.isDraft).toBe(false);
    });

    it("isDraft is true only for DRAFT status", () => {
        const trip = createMockTrip({ status: "DRAFT" });
        expect(trip.isDraft).toBe(true);
        expect(trip.isActive).toBe(false);
        expect(trip.isPast).toBe(false);
    });

    it("isPast is true only for COMPLETED status", () => {
        const trip = createMockTrip({ status: "COMPLETED" });
        expect(trip.isPast).toBe(true);
        expect(trip.isActive).toBe(false);
        expect(trip.isDraft).toBe(false);
    });
});

describe("Trip.validate()", () => {
    it("returns Ok with parsed props for valid input", () => {
        const result = Trip.validate({
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
        });
        expect(result).toBeOk();
        expect(result._unsafeUnwrap().title).toBe("Viaje a Roma");
    });

    it("returns Err for invalid input", () => {
        const result = Trip.validate({
            id: "12345678-1234-4123-a123-123456789012",
            title: "Viaje a Roma",
            destination: "",
            startDate: "2026-04-15",
            endDate: "2026-04-22",
            status: "DRAFT",
            currency: "EUR",
            tags: [],
            createdAt: "2026-01-01T00:00:00.000Z",
            updatedAt: "2026-01-01T00:00:00.000Z",
        });
        expect(result).toBeErr();
    });
});

describe("Trip.toCreateProps()", () => {
    it("returns props that can recreate the same trip", () => {
        const trip = createMockTrip();
        const props = trip.toCreateProps();
        const recreated = Trip.create(props)._unsafeUnwrap();
        expect(recreated.id).toBe(trip.id);
        expect(recreated.title).toBe(trip.title);
        expect(recreated.status).toBe(trip.status);
    });
});
