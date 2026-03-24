import { HttpFailedRequestError } from "./http-error";

export class HttpUnauthorizedError extends HttpFailedRequestError {
    constructor(data?: unknown) {
        super(401, "Unauthorized", data);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
