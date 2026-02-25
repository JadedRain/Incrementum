/**
 * Format a number with commas (e.g., 1234567 => 1,234,567)
 */
export const formatWithCommas = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return value.toLocaleString('en-US');
};

/**
 * Format large numbers as abbreviated currency (e.g., 1500000000 => $1.5B)
 */
export const formatMarketCap = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000_000) {
    return `$${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (absValue >= 1_000_000_000) {
    return `$${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (absValue >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `$${(value / 1_000).toFixed(2)}K`;
  } else {
    return `$${value.toFixed(2)}`;
  }
};

/**
 * Format large numbers with abbreviations (e.g., 1500000000 => 1.5B)
 */
export const formatLargeNumber = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  
  const absValue = Math.abs(value);
  
  if (absValue >= 1_000_000_000_000) {
    return `${(value / 1_000_000_000_000).toFixed(2)}T`;
  } else if (absValue >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(2)}B`;
  } else if (absValue >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(2)}M`;
  } else if (absValue >= 1_000) {
    return `${(value / 1_000).toFixed(2)}K`;
  } else {
    return formatWithCommas(value);
  }
};

/**
 * Format currency with dollar sign and 2 decimal places
 */
export const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  return `$${value.toFixed(2)}`;
};

/**
 * Format date in a readable format
 */
export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  } catch {
    return dateString;
  }
};

/**
 * Format percentage with sign
 */
export const formatPercentage = (value: number | null | undefined): string => {
  if (value === null || value === undefined) return 'N/A';
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(2)}%`;
};
