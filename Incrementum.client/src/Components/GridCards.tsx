export function GridCards() {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '2rem',
        marginBottom: '2rem',
      }}
    >
      <div className="WatchlistPage-card">Short term<br />Desc</div>
      <div className="WatchlistPage-card">Long term<br />Desc</div>
      <div className="WatchlistPage-card">Analyst Picks<br />Desc</div>
      <div className="WatchlistPage-card">Daily gain<br />Desc</div>
      <div className="WatchlistPage-card">Daily dip<br />Desc</div>
      <div className="WatchlistPage-card">Highest Volatility<br />Desc</div>
    </div>
  );
}
