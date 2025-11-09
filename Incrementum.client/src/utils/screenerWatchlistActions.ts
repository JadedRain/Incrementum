export const addScreenerToWatchlist = async (
  screenerId: number,
  apiKey: string,
  setPending: (id: number | null) => void,
  setToast: (message: string | null) => void,
  onSuccess?: () => void,
  setWatchlistScreenerIds?: (updater: (prev: Set<number>) => Set<number>) => void
) => {
  setPending(screenerId);
  try {
    const res = await fetch('/watchlist/custom-screeners/add/', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Id': apiKey 
      },
      body: JSON.stringify({ custom_screener_id: screenerId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to add screener to watchlist');
    }

    setToast('Screener added to watchlist');
    if (setWatchlistScreenerIds) {
      setWatchlistScreenerIds(prev => new Set(prev).add(screenerId));
    }
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error adding screener to watchlist:', error);
    setToast(error instanceof Error ? error.message : 'Failed to add screener to watchlist');
  } finally {
    setPending(null);
    setTimeout(() => setToast(null), 3000);
  }
};

export const removeScreenerFromWatchlist = async (
  screenerId: number,
  apiKey: string,
  setPending: (id: number | null) => void,
  setToast: (message: string | null) => void,
  onSuccess?: () => void,
  setWatchlistScreenerIds?: (updater: (prev: Set<number>) => Set<number>) => void
) => {
  setPending(screenerId);
  try {
    const res = await fetch('/watchlist/custom-screeners/remove/', {
      method: 'DELETE',
      headers: { 
        'Content-Type': 'application/json',
        'X-User-Id': apiKey 
      },
      body: JSON.stringify({ custom_screener_id: screenerId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || 'Failed to remove screener from watchlist');
    }

    setToast('Screener removed from watchlist');
    if (setWatchlistScreenerIds) {
      setWatchlistScreenerIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(screenerId);
        return newSet;
      });
    }
    if (onSuccess) onSuccess();
  } catch (error) {
    console.error('Error removing screener from watchlist:', error);
    setToast(error instanceof Error ? error.message : 'Failed to remove screener from watchlist');
  } finally {
    setPending(null);
    setTimeout(() => setToast(null), 3000);
  }
};
