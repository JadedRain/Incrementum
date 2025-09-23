import React, { useState } from 'react';
import Watchlist from './Watchlist';
import Stock from '../Stock';

const WatchlistPage: React.FC = () => {
  const [selectedToken, setSelectedToken] = useState<string | null>(null);

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      <Watchlist onSelect={setSelectedToken} />
      <div style={{ flex: 1, padding: 24 }}>
        {selectedToken ? (
          <Stock token={selectedToken} />
        ) : (
          <div>Select a stock to view its chart.</div>
        )}
      </div>
    </div>
  );
};

export default WatchlistPage;