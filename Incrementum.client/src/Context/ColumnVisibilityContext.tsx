import React, { useEffect, useRef, useState } from 'react';
import { ColumnVisibilityContext } from './columnVisibilityCore';

export function ColumnVisibilityProvider({ children, showWatchlist = false }: { children: React.ReactNode; showWatchlist?: boolean }) {
  const LS_KEY = 'stockTable.visibleColumns.v1';
  const defaultCols = { symbol: true, price: true, high52: true, low52: true, percentChange: true, volume: true, marketCap: true, watchlist: !!showWatchlist } as Record<string, boolean>;

  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.columnOrder)) {
          return { ...defaultCols, ...(parsed.visibleColumns || {}) };
        }
        return { ...defaultCols, ...(parsed || {}) };
      }
    } catch { void 0; }
    return defaultCols;
  });

  useEffect(() => { try { localStorage.setItem(LS_KEY, JSON.stringify(visibleColumns)); } catch { void 0; } }, [visibleColumns]);

  const toggleColumn = (k: string) => setVisibleColumns((p) => ({ ...p, [k]: !p[k] }));

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
        if (parsed && Array.isArray(parsed.columnOrder)) return parsed.columnOrder as import('./columnVisibilityCore').ColKey[];
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
    <ColumnVisibilityContext.Provider value={{ visibleColumns, setVisibleColumns, toggleColumn, menuOpen, setMenuOpen, menuRef, btnRef, columnOrder, moveColumn, setColumnOrder: setColumnOrderProp }}>
      {children}
    </ColumnVisibilityContext.Provider>
  );
}

export default ColumnVisibilityProvider;
