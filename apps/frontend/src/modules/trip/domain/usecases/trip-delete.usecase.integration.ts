import { http, HttpResponse } from "msw";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { HttpNotFoundError } from "@core/domain/infrastructures/http/errors/http-not-found.error";
import { container } from "@di/inversify.config";
import { createTripDtoFixture } from "@tests/msw/handlers/trip.handlers";
import { server } from "@tests/msw/server";

import type { TripDeleteUseCase } from "@trip/domain/usecases/trip-delete.usecase";
import { TripTypes } from "@trip/trip-types.di";

const API_BASE = import.meta.env.VITE_API_BASE_URL as string;
const FIXTURE_ID = createTripDtoFixture().id;

describe("TripDeleteUseCase - Integration", () => {
    let useCase: TripDeleteUseCase;

    beforeEach(() => {
        container.snapshot();
        useCase = container.get<TripDeleteUseCase>(TripTypes.TripDeleteUseCase);
    });

    afterEach(() => {
        container.restore();
    });

    it("should return Ok<void> when the server responds with 204", async () => {
        const result = await useCase.execute(FIXTURE_ID);

        expect(result.isOk()).toBe(true);
        expect(result._unsafeUnwrap()).toBeUndefined();
    });

    it("should return Err<HttpNotFoundError> when the server responds with 404", async () => {
        server.use(
            http.delete(`${API_BASE}/trips/:id`, () =>
                HttpResponse.json({ error: "not found" }, { status: 404 }),
            ),
        );

        const result = await useCase.execute("non-existing-id");

        expect(result.isErr()).toBe(true);
        const error = result._unsafeUnwrapErr();
        expect.assert(error instanceof HttpNotFoundError);
    });
});
