import type { StockC } from '../Components/Stock';

export function ChartArea({ selectedStock, imgUrl }: { selectedStock: StockC | null; imgUrl: string | null; }) {
  if (!selectedStock) return null;
  return (
    <div className="chart-area">
      <h2>
        {selectedStock.shortName || selectedStock.displayName} ({selectedStock.symbol})
      </h2>
      {imgUrl && (
        <img
          src={imgUrl}
          alt={`${selectedStock.symbol} stock chart`}
        />
      )}
    </div>
  );
}
