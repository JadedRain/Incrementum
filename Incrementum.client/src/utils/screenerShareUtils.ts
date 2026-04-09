import type { DatabaseScreenerFilter } from "../Context/DatabaseScreenerTypes";

interface SharedScreenerData {
  filters: DatabaseScreenerFilter[];
  sortBy?: string;
  sortAsc?: boolean;
}

/**
 * Encodes screener filters and sort state into URL search params string.
 */
export function encodeScreenerFilters(
  filters: DatabaseScreenerFilter[],
  sortBy: string | null,
  sortAsc: boolean
): string {
  const data: SharedScreenerData = { filters };
  if (sortBy) {
    data.sortBy = sortBy;
    data.sortAsc = sortAsc;
  }
  return btoa(JSON.stringify(data));
}

/**
 * Builds a full shareable URL for the current screener filters.
 */
export function buildShareableUrl(
  filters: DatabaseScreenerFilter[],
  sortBy: string | null,
  sortAsc: boolean
): string {
  const encoded = encodeScreenerFilters(filters, sortBy, sortAsc);
  const url = new URL(window.location.origin + "/screener/custom_temp");
  url.searchParams.set("shared", encoded);
  return url.toString();
}

/**
 * Parses shared screener data from URL search params.
 * Returns null if no shared data is present or if parsing fails.
 */
export function parseSharedScreenerParams(
  searchParams: URLSearchParams
): SharedScreenerData | null {
  const encoded = searchParams.get("shared");
  if (!encoded) return null;

  try {
    const json = atob(encoded);
    const data = JSON.parse(json) as SharedScreenerData;

    // Validate structure
    if (!data || !Array.isArray(data.filters)) return null;

    // Validate each filter has required fields
    for (const filter of data.filters) {
      if (
        typeof filter.operator !== "string" ||
        typeof filter.operand !== "string" ||
        typeof filter.filter_type !== "string"
      ) {
        return null;
      }
    }

    return data;
  } catch {
    return null;
  }
}
