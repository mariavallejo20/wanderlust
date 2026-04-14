import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { HttpNotFoundError } from "@core/domain/infrastructures/http/errors/http-not-found.error";
import { container } from "@di/inversify.config";
import { createTripDtoFixture } from "@tests/msw/handlers/trip.handlers";
import { server } from "@tests/msw/server";

import type { TripUpdateUseCase } from "@trip/domain/usecases/trip-update.usecase";
import { TripTypes } from "@trip/trip-types.di";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const FIXTURE_ID = createTripDtoFixture().id;

describe("TripUpdateUseCase - Integration", () => {
    let useCase: TripUpdateUseCase;

    beforeEach(() => {
        container.snapshot();
        useCase = container.get<TripUpdateUseCase>(TripTypes.TripUpdateUseCase);
    });

    afterEach(() => {
        container.restore();
    });

    it("should return Ok<Trip> with the updated field", async () => {
        server.use(
            http.put(`${API_BASE}/trips/:id`, async ({ request, params }) => {
                const body = (await request.json()) as Record<string, unknown>;
                return HttpResponse.json(
                    createTripDtoFixture({
                        id: params.id as string,
                        title: body.title as string,
                    }),
                );
            }),
        );

        const result = await useCase.execute(FIXTURE_ID, {
            title: "Viaje actualizado",
        });

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap().title).toBe("Viaje actualizado");
    });

    it("should return Err<HttpNotFoundError> when the server responds with 404", async () => {
        server.use(
            http.put(`${API_BASE}/trips/:id`, () =>
                HttpResponse.json({ error: "not found" }, { status: 404 }),
            ),
        );

        const result = await useCase.execute("non-existing-id", {
            title: "x",
        });

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof HttpNotFoundError);
    });
});
