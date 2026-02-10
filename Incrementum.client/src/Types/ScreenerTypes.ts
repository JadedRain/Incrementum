export interface NumericFilter {
  filter_name?: string;
  operand?: string;
  operator?: string;
  value?: string | number | null;
  value_low?: number | null;
  value_high?: number | null;
  filter_type?: string;
}

export interface CategoricalFilter {
  filter_name?: string;
  operand?: string;
  operator?: string;
  value?: string | null;
  value_low?: number | null;
  value_high?: number | null;
  filter_type?: string;
}

export interface CustomScreener {
  id: number;
  screener_name?: string;
  created_at?: string;
  numeric_filters?: NumericFilter[];
  categorical_filters?: CategoricalFilter[];
}
