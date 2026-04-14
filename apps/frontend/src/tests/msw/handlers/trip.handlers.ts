import { HttpResponse, http, type HttpHandler } from "msw";

import type { TripDto } from "@trip/data/dto/trip.dto";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

export function createTripDtoFixture(overrides?: Partial<TripDto>): TripDto {
    return {
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
}

export const tripHandlers: HttpHandler[] = [
    http.get(`${API_BASE}/trips`, () => {
        return HttpResponse.json([createTripDtoFixture()]);
    }),

    http.get(`${API_BASE}/trips/:id`, ({ params }) => {
        return HttpResponse.json(
            createTripDtoFixture({ id: params.id as string }),
        );
    }),

    http.post(`${API_BASE}/trips`, async ({ request }) => {
        const body = (await request.json()) as Partial<TripDto>;
        const now = new Date().toISOString();
        const created = createTripDtoFixture({
            ...body,
            id: crypto.randomUUID(),
            createdAt: now,
            updatedAt: now,
        });
        return HttpResponse.json(created, { status: 201 });
    }),

    http.put(`${API_BASE}/trips/:id`, async ({ params, request }) => {
        const body = (await request.json()) as Partial<TripDto>;
        const updated = createTripDtoFixture({
            ...body,
            id: params.id as string,
            updatedAt: new Date().toISOString(),
        });
        return HttpResponse.json(updated);
    }),

    http.delete(`${API_BASE}/trips/:id`, () => {
        return new HttpResponse(null, { status: 204 });
    }),
];
