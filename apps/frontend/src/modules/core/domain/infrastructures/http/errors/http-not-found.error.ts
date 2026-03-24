import { HttpFailedRequestError } from "./http-error";

export class HttpNotFoundError extends HttpFailedRequestError {
    constructor(data?: unknown) {
        super(404, "Not Found", data);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
