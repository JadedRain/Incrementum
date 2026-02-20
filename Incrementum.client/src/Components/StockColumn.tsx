import React, { createContext, useContext } from 'react';

export type CollectionStock = { [k: string]: unknown };

export type Formatter = (value: unknown, row: CollectionStock) => React.ReactNode;

// eslint-disable-next-line react-refresh/only-export-components
export const StockTableContext = createContext<{
  sortBy: string | null;
  sortDir: 'asc' | 'desc' | null;
  setSort: (col: string) => void;
  formatters?: Record<string, Formatter>;
} | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export const StockRowContext = createContext<CollectionStock | null>(null);

interface Props {
  variableName: string;
  displayName: string;
}

export default function StockColumn({ variableName, displayName }: Props) {
  const row = useContext(StockRowContext);
  const table = useContext(StockTableContext);

  if (!row) {
    const handleSort = (e: React.MouseEvent) => {
      e.stopPropagation();
      table?.setSort(variableName);
    };

    if (table) {
      return (
        <button
          type="button"
          role="columnheader"
          aria-label={`Sort by ${displayName}`}
          onClick={handleSort}
          className="StockTable-header sortable text-left"
        >
          {displayName}
        </button>
      );
    }

    return (
      <div className="StockTable-header" role="columnheader">
        <span>{displayName}</span>
      </div>
    );
  }

  const value = row[variableName];

  // Prefer a table-provided formatter if present
  const formatter = table?.formatters?.[variableName];
  let rendered: React.ReactNode;
  if (formatter && row) {
    try {
      rendered = formatter(value, row);
    } catch (err) {
      console.error('Formatter error for', variableName, err);
      rendered = value == null ? '' : typeof value === 'object' ? JSON.stringify(value) : String(value);
    }
  } else {
    if (value === null || value === undefined) {
      rendered = '';
    } else if (typeof value === 'object') {
      try {
        rendered = JSON.stringify(value);
      } catch {
        rendered = String(value);
      }
    } else {
      rendered = String(value);
    }
  }

  return <div className="StockTable-cell">{rendered}</div>;
}