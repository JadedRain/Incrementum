export interface LocalCollection {
  id: number;
  name: string;
  stocks: string[];
  c_desc?: string;
}

export interface CollectionCreatePayload {
  collection: string;
  symbols: string[];
  desc?: string;
}

export interface SaveResult {
  ok: boolean;
  id?: number;
  error?: string;
}

export interface ApiToken {
  symbol: string;
  price?: number;
  [key: string]: unknown;
}

export default {};