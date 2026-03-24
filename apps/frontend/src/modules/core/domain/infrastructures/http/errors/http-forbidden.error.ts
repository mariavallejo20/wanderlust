import { HttpFailedRequestError } from "./http-error";

export class HttpForbiddenError extends HttpFailedRequestError {
    constructor(data?: unknown) {
        super(403, "Forbidden", data);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
