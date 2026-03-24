import { inject, injectable } from "inversify";

import { HttpUnauthorizedError } from "@core/domain/infrastructures/http/errors/http-unauthorized.error";
import type { Http, HttpFactory } from "@core/domain/infrastructures/http/http";
import { UnauthorizedEventBus } from "@core/domain/models/event-bus.model";
import type { EventBusRepository } from "@core/domain/repositories/event-bus.repository";

import { CoreTypes } from "@core/core-types.di";

@injectable()
export class WanderlustApiClient {
    readonly http: Http;

    constructor(
        @inject(CoreTypes.HttpFactory) httpFactory: HttpFactory,
        @inject(CoreTypes.EventBusRepository)
        eventBusRepository: EventBusRepository,
    ) {
        this.http = httpFactory.create({
            baseUrl: import.meta.env.VITE_API_BASE_URL as string,
            onResponseRejected: (error) => {
                if (error instanceof HttpUnauthorizedError) {
                    eventBusRepository.emit(new UnauthorizedEventBus());
                }
            },
        });
    }
}
