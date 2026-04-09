import toast from "react-hot-toast";

export async function fetchWrapper(func: () => Promise<Response>): Promise<Response> {
    try {
        const response = await func();
        if (!response.ok) {
            let details = '';
            try {
                const text = await response.clone().text();
                if (text) {
                    details = ` - ${text}`;
                }
            } catch {
                details = '';
            }
            throw new Error(`HTTP error! status: ${response.status}${details}`);
        }   
        return response;
    } catch (error) {
        toast.error(`Fetch error: ${(error as Error).message}`);
        throw error;
    }
}

export function apiString(endpoint: string): URL {
    const base = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";
    return new URL(`${base}${endpoint}`);
}