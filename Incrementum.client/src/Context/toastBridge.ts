type ErrorHandler = (message: string) => void;

let _handler: ErrorHandler | null = null;

export function registerFetchErrorHandler(handler: ErrorHandler): () => void {
    _handler = handler;
    return () => {
        _handler = null;
    };
}

export function showFetchError(message: string): void {
    _handler?.(message);
}
