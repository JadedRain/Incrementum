import { showFetchError } from "./toastBridge";

const MAX_ERROR_MESSAGE_LENGTH = 240;

const clamp = (message: string): string => {
    const trimmed = message.trim();
    if (trimmed.length <= MAX_ERROR_MESSAGE_LENGTH) {
        return trimmed;
    }
    return `${trimmed.slice(0, MAX_ERROR_MESSAGE_LENGTH)}...`;
};

const isHtml = (text: string): boolean => {
    const sample = text.trim().slice(0, 300).toLowerCase();
    return sample.startsWith("<!doctype html") || sample.startsWith("<html") || /<[^>]+>/.test(sample);
};

const extractJsonMessage = (data: unknown): string | null => {
    if (!data || typeof data !== "object") return null;
    const candidate = data as Record<string, unknown>;

    for (const key of ["error", "detail", "message"]) {
        const value = candidate[key];
        if (typeof value === "string" && value.trim()) {
            return clamp(value);
        }
    }

    return null;
};

const readErrorDetails = async (response: Response): Promise<string> => {
    const contentType = response.headers.get("content-type") || "";

    try {
        if (contentType.includes("application/json")) {
            const data = await response.json();
            return extractJsonMessage(data) || "";
        }

        const text = await response.text();
        if (!text || isHtml(text)) return "";
        return clamp(text.replace(/\s+/g, " "));
    } catch {
        return "";
    }
};

export async function fetchWrapper(func: () => Promise<Response>): Promise<Response> {
    try {
        const response = await func();
        if (!response.ok) {
            const statusLabel = `HTTP ${response.status}${response.statusText ? ` ${response.statusText}` : ""}`;
            const details = await readErrorDetails(response);

            throw new Error(details ? `${statusLabel}: ${details}` : statusLabel);
        }
        return response;
    } catch (error) {
        showFetchError(`Fetch error: ${(error as Error).message}`);
        throw error;
    }
}

export function apiString(endpoint: string): URL {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return new URL(`${base}${endpoint}`);
}