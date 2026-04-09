export interface Stock {
    symbol: string;
    company_name: string;
}

export interface ScreenerResponse {
    stocks: Stock[];
    count: number;
}

export interface FilterData {
    operator: string;
    operand: string;
    filter_type: string;
    value?: string | number;
}
