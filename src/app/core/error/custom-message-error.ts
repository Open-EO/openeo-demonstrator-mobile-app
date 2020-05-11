export class CustomMessageError extends Error {
    constructor(message: string) {
        super(message);
        Object.setPrototypeOf(this, CustomMessageError.prototype);
    }
}
