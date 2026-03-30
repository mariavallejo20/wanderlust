import { injectable } from "inversify";
import { Subscription } from "rxjs";

@injectable()
export abstract class BaseViewModel {
    private readonly subscriptions: Subscription[] = [];

    protected addSub(subscription: Subscription): void {
        this.subscriptions.push(subscription);
    }

    async didMount(): Promise<void> {
        // Override in subclasses
    }

    willUnmount(): void {
        for (const subscription of this.subscriptions) {
            subscription.unsubscribe();
        }
        this.subscriptions.length = 0;
    }
}
