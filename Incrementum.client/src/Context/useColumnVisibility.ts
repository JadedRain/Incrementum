import { useContext } from 'react';
import { ColumnVisibilityContext } from './columnVisibilityCore';

export function useColumnVisibility() {
  const ctx = useContext(ColumnVisibilityContext);
  if (!ctx) throw new Error('useColumnVisibility must be used within ColumnVisibilityProvider');
  return ctx;
}

export default useColumnVisibility;
