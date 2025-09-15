
type LoadingProps = {
  loading: boolean;
  watchlist: string[];
};

export default function Loading({ loading, watchlist }: LoadingProps) {
  return (
    <div style={{ marginTop: '2rem' }}>
      {loading ? (
        <p>Loading...</p>
      ) : watchlist.length === 0 ? (
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