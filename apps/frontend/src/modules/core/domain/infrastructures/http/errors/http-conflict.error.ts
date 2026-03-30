import { HttpFailedRequestError } from "./http-error";

export class HttpConflictError extends HttpFailedRequestError {
    constructor(data?: unknown) {
        super(409, "Conflict", data);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
