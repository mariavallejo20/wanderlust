import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { HttpUnprocessableContentError } from "@core/domain/infrastructures/http/errors/http-unprocessable-content.error";
import { container } from "@di/inversify.config";
import { server } from "@tests/msw/server";

import type { TripInputProps } from "@trip/domain/models/trip.model";
import type { TripCreateUseCase } from "@trip/domain/usecases/trip-create.usecase";
import { TripTypes } from "@trip/trip-types.di";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;

const validProps: TripInputProps = {
    id: "aaaaaaaa-aaaa-4aaa-aaaa-aaaaaaaaaaaa",
    title: "Viaje a Lisboa",
    destination: "Portugal",
    startDate: "2026-06-01",
    endDate: "2026-06-07",
    status: "DRAFT",
    currency: "EUR",
    tags: [],
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("TripCreateUseCase - Integration", () => {
    let useCase: TripCreateUseCase;

    beforeEach(() => {
        container.snapshot();
        useCase = container.get<TripCreateUseCase>(TripTypes.TripCreateUseCase);
    });

    afterEach(() => {
        container.restore();
    });

    it("should return Ok<Trip> with the created trip on success", async () => {
        const result = await useCase.execute(validProps);

        expect(result.isOk()).toBe(true);
        const trip = result._unsafeUnwrap();
        expect(trip.title).toBe(validProps.title);
        expect(trip.destination).toBe(validProps.destination);
    });

    it("should return Err when the server responds with 422", async () => {
        server.use(
            http.post(`${API_BASE}/trips`, () =>
                HttpResponse.json(
                    { error: "unprocessable content" },
                    { status: 422 },
                ),
            ),
        );

        const result = await useCase.execute(validProps);

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof HttpUnprocessableContentError);
    });
});
