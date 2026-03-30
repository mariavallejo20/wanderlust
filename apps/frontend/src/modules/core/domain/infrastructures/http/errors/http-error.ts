import { WanderlustError } from "../../../errors/wanderlust.error";

export class HttpRejectedRequestError extends WanderlustError {
    constructor(message: string = "Network error") {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}

export class HttpFailedRequestError<T = unknown> extends WanderlustError {
    readonly status: number;
    readonly statusText: string;
    readonly data: T | undefined;

    constructor(status: number, statusText: string, data?: T) {
        super(`HTTP ${status}: ${statusText}`);
        Object.setPrototypeOf(this, new.target.prototype);
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }
}
