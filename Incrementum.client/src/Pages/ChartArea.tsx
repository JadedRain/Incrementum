import type { StockC } from '../Components/Stock';

export function ChartArea({ selectedStock, imgUrl }: { selectedStock: StockC | null; imgUrl: string | null; }) {
  if (!selectedStock) return null;
  return (
    <div style={{ marginBottom: '2rem', background: '#f9f7f3', borderRadius: '12px', padding: '1.5rem' }}>
      <h2 style={{ marginBottom: '0.5rem' }}>
        {selectedStock.shortName || selectedStock.displayName} ({selectedStock.symbol})
      </h2>
      {imgUrl && (
        <img
          src={imgUrl}
          alt={`${selectedStock.symbol} stock chart`}
          style={{ maxWidth: '100%', borderRadius: '8px', boxShadow: '0 2px 8px #ccc' }} />
      )}
    </div>
  );
}
