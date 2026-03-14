import { createContext } from 'react';

export type Columns = Record<string, boolean>;
export type ColKey = 'symbol' | 'price' | 'high52' | 'low52' | 'percentChange' | 'volume' | 'market_cap' | 'eps' | 'debt_to_equity' | 'purchasePrice' | 'list_date' | 'outstanding_shares' | 'share_class_figi' | 'sic_description' | 'annual_eps_growth_rate' | 'price_per_earnings' | 'pe_per_growth';

export type ContextValue = {
  visibleColumns: Columns;
  setVisibleColumns: (c: Columns) => void;
  toggleColumn: (k: string) => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
  menuRef: React.RefObject<HTMLDivElement | null>;
  btnRef: React.RefObject<HTMLButtonElement | null>;
  columnOrder: ColKey[];
  moveColumn: (from: number, to: number) => void;
  setColumnOrder: (order: ColKey[]) => void;
};

export const ColumnVisibilityContext = createContext<ContextValue | null>(null);
