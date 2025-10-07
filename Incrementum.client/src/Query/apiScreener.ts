import type { CustomScreener } from "../Types/ScreenerTypes";

const API_BASE = "http://localhost:8000"; // backend host + port

export const fetchCustomScreener = async (id: string, user: string | null) => {
  const res = await fetch(`${API_BASE}/screeners/custom/${id}/`, {
    headers: {
      "X-User-Id": user ?? "",
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Failed to fetch screener: ${res.statusText}`);
  return res.json();
};