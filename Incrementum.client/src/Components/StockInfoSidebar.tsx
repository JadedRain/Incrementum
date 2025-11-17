import React from 'react';
import type { StockData } from '../StockData';
import { BiPlus, BiMinus } from "react-icons/bi";

interface StockInfoSidebarProps {
  results: StockData;
  apiKey: string | null;
  inWatchlist: boolean;
  pending: boolean;
  onAddToWatchlist: () => void;
  onRemoveFromWatchlist: () => void;
}

const StockInfoSidebar: React.FC<StockInfoSidebarProps> = ({
  results,
  apiKey,
  inWatchlist,
  pending,
  onAddToWatchlist,
  onRemoveFromWatchlist,
}) => {
  const buttonHoverStyle = `
    .watchlist-button:hover:not(:disabled) {
      background: #AF8228 !important;
    }
    .watchlist-button:hover:not(:disabled) span {
      color: hsl(40, 56%, 67%) !important;
    }
    .watchlist-button:hover:not(:disabled) svg {
      color: hsl(40, 62%, 26%) !important;
    }
  `;

  return (
    <div className="w-full md:w-80 flex-shrink-0">
      <style>{buttonHoverStyle}</style>
      <div className="p-6 shadow-lg h-[800px] flex flex-col" style={{ backgroundColor: 'hsl(40, 63%, 63%)', borderRadius: '2px', boxShadow: '4px 6px 8px rgba(0, 0, 0, 0.3)' }}>
        <div>
          <h2 className="text-2xl font-bold mb-4" style={{ color: 'hsl(40, 62%, 26%)' }}>
            {results.displayName}
          </h2>
          <p className="text-lg mb-6" style={{ color: 'hsl(40, 62%, 26%)' }}>({results.symbol})</p>
          
          <div className="space-y-3">
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Current Price:</strong> ${results.currentPrice ?? 'N/A'}
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Open:</strong> ${results.open ?? 'N/A'}
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Previous Close:</strong> ${results.previousClose ?? 'N/A'}
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Day High / Low:</strong> ${results.dayHigh ?? 'N/A'} / ${results.dayLow ?? 'N/A'}
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>50-Day Average:</strong> ${results.fiftyDayAverage ? results.fiftyDayAverage.toFixed(2) : 'N/A'}
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Exchange:</strong> {results.fullExchangeName ?? 'N/A'} ({results.exchange ?? 'N/A'})
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Industry:</strong> {results.industry ?? 'N/A'}
              </p>
            </div>
            
            <div className="pb-3" style={{ borderBottom: '1px solid hsl(41, 61%, 9%)' }}>
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Sector:</strong> {results.sector ?? 'N/A'}
              </p>
            </div>
            
            <div className="pb-3">
              <p style={{ color: 'hsl(40, 62%, 26%)' }}>
                <strong>Country:</strong> {results.country ?? 'N/A'}
              </p>
            </div>
          </div>
        </div>
        
        {apiKey && (
          <div className="mt-auto flex justify-end">
            <button
              onClick={inWatchlist ? onRemoveFromWatchlist : onAddToWatchlist}
              disabled={pending}
              className="watchlist-button px-4 py-2 rounded text-[16px] font-semibold transition-opacity flex items-center"
              style={{
                background: 'hsl(40, 62%, 26%)',
                color: '#EBCB92',
                opacity: pending ? 0.7 : 1,
              }}
              aria-label={`${inWatchlist ? 'Remove' : 'Add'} ${results.symbol} ${inWatchlist ? 'from' : 'to'} watchlist`}
            >
              {!inWatchlist && <BiPlus size={32} style={{ color: 'hsl(40, 63%, 42%)', marginRight: '8px' }} />}
              {inWatchlist && <BiMinus size={32} style={{ color: 'hsl(40, 63%, 42%)', marginRight: '8px' }} />}
              <span>{inWatchlist ? 'Remove' : 'Watch'}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockInfoSidebar;
