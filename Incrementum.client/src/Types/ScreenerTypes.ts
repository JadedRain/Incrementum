export interface NumericFilter {
  filter_name: string;
  value: string | number | null;
}

export interface CategoricalFilter {
  filter_name: string;
  value: string | null;
}

export interface CustomScreener {
  id: number;
  name: string;
  numeric_filters: NumericFilter[];
  categorical_filters: CategoricalFilter[];
}
