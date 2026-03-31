import { apiString, fetchWrapper } from "../Context/FetchingHelper";
import type { DatabaseScreenerFilter } from "../Context/DatabaseScreenerTypes";

export class ScreenerFetchError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ScreenerFetchError";
    this.status = status;
  }
}

export const fetchCustomScreenerShareToken = async (
  screenerId: number,
  apiKey: string | null
) => {
  const res = await fetchWrapper(() =>
    fetch(apiString(`/screeners/custom/${screenerId}/share/`), {
      headers: {
        "X-User-Id": apiKey ?? "",
        "Content-Type": "application/json",
      },
    })
  );

  return {
    ok: res.ok,
    data: res.ok ? await res.json() : null,
    error: res.ok ? null : await res.text(),
  };
};

export const fetchSharedCustomScreener = async (token: string) => {
  const res = await fetch(apiString(`/screeners/shared/${encodeURIComponent(token)}/`), {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (res.ok) {
    return res.json();
  }

  let message = "Failed to fetch screener";
  try {
    const data = await res.json();
    if (data?.error) message = String(data.error);
  } catch {
    const text = await res.text();
    if (text) message = text;
  }

  throw new ScreenerFetchError(res.status, message);
};

export const fetchCustomScreener = async (id: string, user: string | null) => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (user) {
    headers["X-User-Id"] = user;
  }

  const res = await fetch(apiString(`/screeners/custom/${id}/`), {
    headers,
  });

  if (res.ok) {
    return res.json();
  }

  let message = "Failed to fetch screener";
  try {
    const data = await res.json();
    if (data?.error) message = String(data.error);
  } catch {
    const text = await res.text();
    if (text) message = text;
  }

  throw new ScreenerFetchError(res.status, message);
};

export const createCustomScreener = async (
  name: string,
  filters: DatabaseScreenerFilter[],
  apiKey: string | null
) => {
  const numericFilters = filters.filter(f => f.filter_type === 'numeric').map(f => ({
    operand: f.operand,
    operator: f.operator,
    value: f.value,
  }));

  const categoricalFilters = filters.filter(f => f.filter_type === 'categoric' || f.filter_type === 'categorical').map(f => ({
    operand: f.operand,
    operator: f.operator,
    value: f.value,
  }));

  const res = await fetchWrapper(()=>fetch(apiString('/screeners/custom/'), {
    method: 'POST',
    headers: {
      "X-User-Id": apiKey ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      screener_name: name,
      numeric_filters: numericFilters,
      categorical_filters: categoricalFilters,
    }),
  }));

  return {
    ok: res.ok,
    data: res.ok ? await res.json() : null,
    error: res.ok ? null : await res.text(),
  };
};

export const updateCustomScreener = async (
  screenerId: number,
  name: string,
  filters: DatabaseScreenerFilter[],
  apiKey: string | null
) => {
  const numericFilters = filters.filter(f => f.filter_type === 'numeric').map(f => ({
    operand: f.operand,
    operator: f.operator,
    value: f.value,
  }));

  const categoricalFilters = filters.filter(f => f.filter_type === 'categoric' || f.filter_type === 'categorical').map(f => ({
    operand: f.operand,
    operator: f.operator,
    value: f.value,
  }));

  const res = await fetchWrapper(()=>fetch(apiString(`/screeners/custom/${screenerId}/update/`), {
    method: 'PUT',
    headers: {
      "X-User-Id": apiKey ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      screener_name: name,
      numeric_filters: numericFilters,
      categorical_filters: categoricalFilters,
    }),
  }));

  return {
    ok: res.ok,
    data: res.ok ? await res.json() : null,
    error: res.ok ? null : await res.text(),
  };
};

export const fetchCustomScreeners = async (apiKey: string | null) => {
  const res = await fetchWrapper(()=>fetch(apiString('/screeners/custom/list/'), {
    headers: {
      "X-User-Id": apiKey ?? "",
      "Content-Type": "application/json",
    },
  }));
  if (!res.ok) throw new Error(`Failed to fetch custom screeners: ${res.statusText}`);
  return res.json();
};

export const updateScreenerPrivacy = async (
  screenerId: number,
  isPrivate: boolean,
  apiKey: string | null
) => {
  const res = await fetchWrapper(()=>fetch(apiString(`/screeners/custom/${screenerId}/privacy/`), {
    method: 'PUT',
    headers: {
      "X-User-Id": apiKey ?? "",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      is_private: isPrivate,
    }),
  }));

  return {
    ok: res.ok,
    data: res.ok ? await res.json() : null,
    error: res.ok ? null : await res.text(),
  };
};