import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export interface CreatePotentialPayload {
  stock_symbol: string;
  purchase_date: string;
  quantity: string | number;
  purchase_price?: string | number;
  screener?: number | null;
}

export interface UpdatePotentialPayload {
  purchase_date?: string;
  quantity?: string | number;
  purchase_price?: string | number;
  screener?: number | null;
}

export async function createUserStockPotential(
  data: CreatePotentialPayload,
  apiKey: string
) {
  // Filter out undefined values
  const payload = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  const res = await fetchWrapper(() =>
    fetch(apiString(`/api/user-stock-potentials/`), {
      method: "POST",
      headers: {
        "X-User-Id": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  );
  return res.json();
}

export async function updateUserStockPotential(
  potentialId: number,
  data: UpdatePotentialPayload,
  apiKey: string
) {
  // Filter out undefined values
  const payload = Object.fromEntries(
    Object.entries(data).filter(([_, value]) => value !== undefined)
  );

  const res = await fetchWrapper(() =>
    fetch(apiString(`/api/user-stock-potentials/${potentialId}/`), {
      method: "PUT",
      headers: {
        "X-User-Id": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    })
  );
  return res.json();
}

export async function deleteUserStockPotential(
  potentialId: number,
  apiKey: string
) {
  await fetchWrapper(() =>
    fetch(apiString(`/api/user-stock-potentials/${potentialId}/`), {
      method: "DELETE",
      headers: {
        "X-User-Id": apiKey,
      },
    })
  );
}
