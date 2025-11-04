import React from 'react';
import type { StockData } from '../StockData';
import StockInfoSidebar from './StockInfoSidebar';

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
    <div className="mt-8 flex flex-col md:flex-row gap-6">
      {/* Left sidebar with stock info */}
      <StockInfoSidebar
        results={results}
        apiKey={apiKey}
        inWatchlist={inWatchlist}
        pending={pending}
        onAddToWatchlist={onAddToWatchlist}
        onRemoveFromWatchlist={onRemoveFromWatchlist}
      />
      
      {/* Center area with chart */}
      <div className="flex-1 flex items-center justify-center">
        <img
          src={imgUrl}
          alt={`${token} stock chart`}
          className="rounded-lg shadow-md max-w-full h-auto"
        />
      </div>
    </div>
  );
};

export default StockDataDisplay;