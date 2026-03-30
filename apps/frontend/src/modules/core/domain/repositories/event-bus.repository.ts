import type { Observable } from "rxjs";

import type { EventBus } from "../models/event-bus.model";

export interface EventBusRepository {
    emit(event: EventBus): void;
    bus: Observable<EventBus>;
}
