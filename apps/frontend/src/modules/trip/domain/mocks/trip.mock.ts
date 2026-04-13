import type { TripInputProps } from "@trip/domain/models/trip.model";
import { Trip } from "@trip/domain/models/trip.model";

export const createMockTrip = (overrides?: Partial<TripInputProps>): Trip => {
    return Trip.create({
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
    })._unsafeUnwrap();
};
