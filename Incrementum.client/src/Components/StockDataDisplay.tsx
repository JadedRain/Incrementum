import React from 'react';
import type { StockData } from '../StockData';

interface StockDataDisplayProps {
  results: StockData
  apiKey: string | null;
  inWatchlist: boolean;
  pending: boolean;
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
  imgUrl: string;
  token?: string;
}

const StockDataDisplay: React.FC<StockDataDisplayProps> = ({
  results,
  apiKey,
  inWatchlist,
  pending,
  onAddToWatchlist,
  onRemoveFromWatchlist,
  imgUrl,
  token
}) => {
  return (
    <div className="mt-8">
      <h2 className="text-[hsl(40,66%,60%)]">{results.displayName} ({results.symbol})</h2>
      <div style={{ marginTop: '0.75rem' }}>
        {apiKey && (
          <button
            onClick={inWatchlist ? onRemoveFromWatchlist : onAddToWatchlist}
            disabled={pending}
            className="px-4 py-2 rounded"
            style={{
              background: inWatchlist ? '#883939' : '#3a6c3a',
              color: '#EBCB92',
              opacity: pending ? 0.7 : 1,
            }}
            aria-label={`${inWatchlist ? 'Remove' : 'Add'} ${results.symbol} ${inWatchlist ? 'from' : 'to'} watchlist`}
          >
            {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
          </button>
        )}
      </div>
      <p className="text-[hsl(40,66%,60%)]"><strong>Current Price:</strong> ${results.currentPrice}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Open:</strong> ${results.open}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Previous Close:</strong> ${results.previousClose}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Day High / Low:</strong> ${results.dayHigh} / ${results.dayLow}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>50-Day Average:</strong> ${results.fiftyDayAverage.toFixed(2)}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Exchange:</strong> {results.fullExchangeName} ({results.exchange})</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Industry:</strong> {results.industry}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Sector:</strong> {results.sector}</p>
      <p className="text-[hsl(40,66%,60%)]"><strong>Country:</strong> {results.country}</p>
      <img
        src={imgUrl}
        alt={`${token} stock chart`}
        className="rounded-lg shadow-md max-w-full h-auto grid-middle mt-4"
      />
    </div>
  );
};

export default StockDataDisplay;