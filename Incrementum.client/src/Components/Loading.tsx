type LoadingProps = {
  loading: boolean;
  watchlist: string[];
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
          {watchlist.map((item, idx) => (
            <li key={idx}>{item}</li>
          ))}
        </ul>
      )}
    </div>
  );
}