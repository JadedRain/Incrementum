import type { StockC } from "./Stock";

type LoadingProps = {
  loading: boolean;
  watchlist: StockC[];
  showEmpty?: boolean;
};

export default function Loading({ loading, watchlist, showEmpty = true }: LoadingProps) {
  return (
    <div style={{ marginTop: '2rem' }}>
      {loading ? (
        <p className="text-[hsl(40,61%,55%)] text-lg font-semibold">Loading...</p>
      ) : showEmpty && watchlist.length === 0 ? (
        <p>No items found in watchlist</p>
      ) : (
        <ul>
          {watchlist.map((stock, idx) => (
            <li key={idx}>
              <strong>{stock.symbol}</strong> — {stock.shortName || stock.displayName} — ${stock.currentPrice?.toFixed(2) ?? 'N/A'}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}