export interface StockData {
  symbol: string;
  company_name?: string;
  description?: string;
  market_cap?: number | null;
  primary_exchange?: string | null;
  type?: string | null;
  currency_name?: string | null;
  cik?: string | null;
  composite_figi?: string | null;
  share_class_figi?: string | null;
  outstanding_shares?: number | null;
  homepage_url?: string | null;
  total_employees?: number | null;
  list_date?: string | null;
  locale?: string | null;
  sic_code?: string | null;
  sic_description?: string | null;
  updated_at?: string | null;
  eps?: number | null;
  // Financial data from stock_history
  currentPrice?: number | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  previousClose?: number | null;
  change?: number | null;
  changePercent?: number | null;
  high52Week?: number | null;
  low52Week?: number | null;
}

