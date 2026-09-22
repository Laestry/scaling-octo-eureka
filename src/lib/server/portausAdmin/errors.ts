/** Any non-2xx answer from Portaus, with the parsed body kept for logging and for API responses. */
export class PortausError extends Error {
    constructor(
        message: string,
        public readonly status: number,
        public readonly path: string,
        public readonly body: unknown
    ) {
        super(message);
        this.name = 'PortausError';
    }

    /** Portaus puts its human message under `message` or `error`; fall back to the raw body. */
    get detail(): string {
        const b: any = this.body;
        if (b && typeof b === 'object') return String(b.message ?? b.error ?? JSON.stringify(b));
        return String(b ?? '');
    }
}

/** calculate() came back fine but at least one line has stock or product validation errors. */
export class OrderValidationError extends Error {
    constructor(
        public readonly lines: Array<{
            puid: string | null;
            productId: number | null;
            name: string | null;
            requested: number;
            quantityLeft: number;
            reason: 'InsufficientQuantity' | 'UnknownProduct';
            messages: string[];
        }>
    ) {
        super('Some order lines are not available in the requested quantity');
        this.name = 'OrderValidationError';
    }
}
