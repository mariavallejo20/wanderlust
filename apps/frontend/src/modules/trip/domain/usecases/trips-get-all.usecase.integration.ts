import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { container } from "@di/inversify.config";
import { createTripDtoFixture } from "@tests/msw/handlers/trip.handlers";
import { server } from "@tests/msw/server";

import type { TripsGetAllUseCase } from "@trip/domain/usecases/trips-get-all.usecase";
import { TripTypes } from "@trip/trip-types.di";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

describe("TripsGetAllUseCase - Integration", () => {
    let useCase: TripsGetAllUseCase;

    beforeEach(() => {
        container.snapshot();
        useCase = container.get<TripsGetAllUseCase>(
            TripTypes.TripsGetAllUseCase,
        );
    });

    afterEach(() => {
        container.restore();
    });

    it("should return Ok<Trip[]> when MSW returns a trip array", async () => {
        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        const trips = result._unsafeUnwrap();
        expect(trips).toHaveLength(1);
        expect(trips[0].id).toBe(createTripDtoFixture().id);
    });

    it("should return Ok with empty array when MSW returns empty list", async () => {
        server.use(http.get(`${API_BASE}/trips`, () => HttpResponse.json([])));

        const result = await useCase.execute();

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toHaveLength(0);
    });

    it("should return Err when the server responds with 500", async () => {
        server.use(
            http.get(`${API_BASE}/trips`, () =>
                HttpResponse.json({ error: "server error" }, { status: 500 }),
            ),
        );

        const result = await useCase.execute();

        expect(result.isErr()).toBe(true);
    });
});
