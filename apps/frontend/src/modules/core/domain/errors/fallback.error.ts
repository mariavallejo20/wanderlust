import { WanderlustError } from "./wanderlust.error";

export class FallbackError extends WanderlustError {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
