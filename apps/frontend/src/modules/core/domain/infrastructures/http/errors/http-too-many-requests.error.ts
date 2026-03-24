import { HttpFailedRequestError } from "./http-error";

export class HttpTooManyRequestsError extends HttpFailedRequestError {
    constructor(data?: unknown) {
        super(429, "Too Many Requests", data);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
