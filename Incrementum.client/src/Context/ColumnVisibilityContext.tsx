import React, { useEffect, useRef, useState } from 'react';
import { ColumnVisibilityContext } from './columnVisibilityCore';

export function ColumnVisibilityProvider({ children }: { children: React.ReactNode; }) {
  const LS_KEY = 'stockTable.visibleColumns.v3';
  const defaultCols = {
    symbol: true,
    price: true,
    high52: false,
    low52: false,
    percentChange: true,
    volume: false,
    market_cap: true,
    eps: true,
    list_date: false,
    outstanding_shares: false,
    share_class_figi: false,
    sic_description: false,
    purchasePrice: false,
  } as Record<string, boolean>;

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed) {
          const loaded = { ...defaultCols, ...(parsed.visibleColumns || {}) };
          const filtered: Record<string, boolean> = {};
          for (const key of Object.keys(defaultCols)) {
            filtered[key] = loaded[key] !== false;
          }
          return filtered;
        }
      }
    }
    catch(e) {
      console.log(`Unable to set visible columns: ${e}`)
    }
    return defaultCols;
  });

  const toggleColumnWithOrder = (k: string) => {
    setVisibleColumns((p) => ({ ...p, [k]: !p[k] }));
    setColumnOrder((prev) => {
      try {
        const currently = prev.slice();
        if (!currently.includes(k as import('./columnVisibilityCore').ColKey)) {
          // try to insert after 'price' if present
          const after = currently.indexOf('price' as import('./columnVisibilityCore').ColKey);
          if (after >= 0) {
            currently.splice(after + 1, 0, k as import('./columnVisibilityCore').ColKey);
          } else {
            currently.push(k as import('./columnVisibilityCore').ColKey);
          }
          // persist combined shape
          try {
            const raw = localStorage.getItem(LS_KEY);
            const parsed = raw ? JSON.parse(raw) : {};
            parsed.columnOrder = currently;
            parsed.visibleColumns = parsed.visibleColumns || visibleColumns;
            localStorage.setItem(LS_KEY, JSON.stringify(parsed));
          } catch { /* ignore */ }
        }
        return currently;
      } catch { return prev; }
    });
  };

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const btnRef = useRef<HTMLButtonElement | null>(null);

  // column order: default to keys of defaultCols in insertion order
  const defaultOrder = Object.keys(defaultCols).filter((k) => k !== undefined) as import('./columnVisibilityCore').ColKey[];
  const [columnOrder, setColumnOrder] = useState<import('./columnVisibilityCore').ColKey[]>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.columnOrder)) {
          // Filter to only include columns that exist in defaultCols
          const filtered = (parsed.columnOrder as string[]).filter((col: string) => col in defaultCols);
          const merged = [...filtered];
          for (const col of defaultOrder) {
            if (!merged.includes(col)) merged.push(col);
          }
          return merged as import('./columnVisibilityCore').ColKey[];
        }
      }
    } catch { void 0; }
    return defaultOrder;
  });

  // move column helper
  const moveColumn = (from: number, to: number) => {
    setColumnOrder((prev) => {
      const next = prev.slice();
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      try {
        const raw = localStorage.getItem(LS_KEY);
        const parsed = raw ? JSON.parse(raw) : {};
        parsed.columnOrder = next;
        parsed.visibleColumns = parsed.visibleColumns || visibleColumns;
        localStorage.setItem(LS_KEY, JSON.stringify(parsed));
      } catch { void 0; }
      return next as import('./columnVisibilityCore').ColKey[];
    });
  };

  // persist visibleColumns and columnOrder together
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      const parsed = raw ? JSON.parse(raw) : {};
      parsed.visibleColumns = visibleColumns;
      parsed.columnOrder = columnOrder;
      localStorage.setItem(LS_KEY, JSON.stringify(parsed));
    } catch { void 0; }
  }, [visibleColumns, columnOrder]);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (!menuOpen) return; const t = e.target as Node; if (menuRef.current?.contains(t) || btnRef.current?.contains(t)) return; setMenuOpen(false); };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('mousedown', onDoc); document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey); };
  }, [menuOpen]);

  // wrap the React setter so the provider exposes the expected (order: ColKey[]) => void signature
  const setColumnOrderProp = (order: import('./columnVisibilityCore').ColKey[]) => setColumnOrder(order);

  return (
    <ColumnVisibilityContext.Provider value={{ visibleColumns, setVisibleColumns, toggleColumn: toggleColumnWithOrder, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn, setColumnOrder: setColumnOrderProp }}>
      {children}
    </ColumnVisibilityContext.Provider>
  );
}

export default ColumnVisibilityProvider;
