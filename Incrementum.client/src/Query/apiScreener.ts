import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export const fetchCustomScreener = async (id: string, user: string | null) => {
  const res = await fetchWrapper(()=>fetch(apiString(`/screeners/custom/${id}/`), {
    headers: {
      "X-User-Id": user ?? "",
      "Content-Type": "application/json",
    },
  }));
  if (!res.ok) throw new Error(`Failed to fetch screener: ${res.statusText}`);
  return res.json();
};