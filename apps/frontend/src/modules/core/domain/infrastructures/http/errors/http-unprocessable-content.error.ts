import { HttpFailedRequestError } from "./http-error";

export class HttpUnprocessableContentError<
    T = unknown,
> extends HttpFailedRequestError<T> {
    constructor(data?: T) {
        super(422, "Unprocessable Content", data);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
