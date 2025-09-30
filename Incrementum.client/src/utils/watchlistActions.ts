import { useAuth } from "../Context/AuthContext";

export async function addToWatchlist(symbol: string, user_id: string | null, setPending: (v: boolean) => void, setToast: (msg: string | null) => void, setInWatchlist?: (v: boolean) => void) {
  if (!symbol || !user_id) return;
  try {
    setPending(true);
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
      setToast(`Failed to add ${symbol}: ${msg || 'request error'}`);
      setTimeout(() => setToast(null), 2500);
      return;
    }
    await res.json();
    if (setInWatchlist) setInWatchlist(true);
    setToast(`Successfully added ${symbol} to watchlist`);
    setTimeout(() => setToast(null), 2000);
  } finally {
    setPending(false);
  }
}

export async function removeFromWatchlist(symbol: string, user_id: string | null, setPending: (v: boolean) => void, setToast: (msg: string | null) => void, setInWatchlist?: (v: boolean) => void) {
  if (!symbol || !user_id) return;
  try {
    setPending(true);
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
      setToast(`Failed to remove ${symbol}: ${msg || 'request error'}`);
      setTimeout(() => setToast(null), 2500);
      return;
    }
    await res.json();
    if (setInWatchlist) setInWatchlist(false);
    setToast(`Removed ${symbol} from watchlist`);
    setTimeout(() => setToast(null), 2000);
  } finally {
    setPending(false);
  }
}
