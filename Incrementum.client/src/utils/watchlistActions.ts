// Unified watchlist functions - always use X-User-Id header for consistency

// Overload for boolean pending state
export async function addToWatchlist(
  symbol: string, 
  user_id: string | null, 
  setPending: (v: boolean) => void, 
  setToast: (msg: string | null) => void,
  setInWatchlist?: (v: boolean) => void
): Promise<void>;

// Overload for string pending state with watchlist symbols
export async function addToWatchlist(
  symbol: string, 
  user_id: string | null, 
  setPending: (v: string | null) => void, 
  setToast: (msg: string | null) => void,
  setInWatchlist?: (v: boolean) => void,
  setWatchlistSymbols?: React.Dispatch<React.SetStateAction<Set<string>>>
): Promise<void>;

// Implementation
export async function addToWatchlist(
  symbol: string, 
  user_id: string | null, 
  setPending: ((v: boolean) => void) | ((v: string | null) => void), 
  setToast: (msg: string | null) => void,
  setInWatchlist?: (v: boolean) => void,
  setWatchlistSymbols?: React.Dispatch<React.SetStateAction<Set<string>>>
): Promise<void> {
  if (!symbol || !user_id) return;
  try {
    // Set pending state - use symbol for string version, true for boolean version
    (setPending as any)(setWatchlistSymbols ? symbol : true);
    
    const res = await fetch('/watchlist/add/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user_id,
      },
      credentials: 'include',
      body: JSON.stringify({ symbol }),
    });
    
    if (!res.ok) {
      const msg = await res.text();
      console.error('Failed to add to watchlist', msg);
      setToast(`Failed to add ${symbol}: ${msg || 'request error'}`);
      setTimeout(() => setToast(null), 2500);
      return;
    }
    
    await res.json();
    
    // Update watchlist state if provided
    if (setInWatchlist) setInWatchlist(true);
    if (setWatchlistSymbols) {
      setWatchlistSymbols((prev) => new Set<string>([...prev, symbol]));
    }
    
    setToast(`Successfully added ${symbol} to watchlist`);
    setTimeout(() => setToast(null), 2000);
  } catch (e) {
    console.error('Error adding to watchlist', e);
    setToast(`Failed to add ${symbol}: ${(e as Error).message}`);
    setTimeout(() => setToast(null), 2500);
  } finally {
    // Reset pending state - use null for string version, false for boolean version
    (setPending as any)(setWatchlistSymbols ? null : false);
  }
}

// Overload for boolean pending state
export async function removeFromWatchlist(
  symbol: string, 
  user_id: string | null, 
  setPending: (v: boolean) => void, 
  setToast: (msg: string | null) => void,
  setInWatchlist?: (v: boolean) => void
): Promise<void>;

// Overload for string pending state with watchlist symbols
export async function removeFromWatchlist(
  symbol: string, 
  user_id: string | null, 
  setPending: (v: string | null) => void, 
  setToast: (msg: string | null) => void,
  setInWatchlist?: (v: boolean) => void,
  setWatchlistSymbols?: React.Dispatch<React.SetStateAction<Set<string>>>
): Promise<void>;

// Implementation
export async function removeFromWatchlist(
  symbol: string, 
  user_id: string | null, 
  setPending: ((v: boolean) => void) | ((v: string | null) => void), 
  setToast: (msg: string | null) => void,
  setInWatchlist?: (v: boolean) => void,
  setWatchlistSymbols?: React.Dispatch<React.SetStateAction<Set<string>>>
): Promise<void> {
  if (!symbol || !user_id) return;
  try {
    // Set pending state - use symbol for string version, true for boolean version
    (setPending as any)(setWatchlistSymbols ? symbol : true);
    
    const res = await fetch('/watchlist/remove/', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': user_id,
      },
      credentials: 'include',
      body: JSON.stringify({ symbol }),
    });
    
    if (!res.ok) {
      const msg = await res.text();
      console.error('Failed to remove from watchlist', msg);
      setToast(`Failed to remove ${symbol}: ${msg || 'request error'}`);
      setTimeout(() => setToast(null), 2500);
      return;
    }
    
    await res.json();
    
    // Update watchlist state if provided
    if (setInWatchlist) setInWatchlist(false);
    if (setWatchlistSymbols) {
      setWatchlistSymbols((prev) => {
        const next = new Set(prev);
        next.delete(symbol);
        return next;
      });
    }
    
    setToast(`Removed ${symbol} from watchlist`);
    setTimeout(() => setToast(null), 2000);
  } catch (e) {
    console.error('Error removing from watchlist', e);
    setToast(`Failed to remove ${symbol}: ${(e as Error).message}`);
    setTimeout(() => setToast(null), 2500);
  } finally {
    // Reset pending state - use null for string version, false for boolean version
    (setPending as any)(setWatchlistSymbols ? null : false);
  }
}
