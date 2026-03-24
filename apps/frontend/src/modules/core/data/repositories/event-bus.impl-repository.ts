import { injectable } from "inversify";
import { type Observable, Subject } from "rxjs";

import { EventBus } from "@core/domain/models/event-bus.model";
import type { EventBusRepository } from "@core/domain/repositories/event-bus.repository";

@injectable()
export class EventBusImplRepository implements EventBusRepository {
    private readonly subject = new Subject<EventBus>();

    get bus(): Observable<EventBus> {
        return this.subject.asObservable();
    }

    emit(event: EventBus): void {
        this.subject.next(event);
    }
}
