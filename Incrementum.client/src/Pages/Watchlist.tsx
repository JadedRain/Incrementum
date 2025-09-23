import React, { useEffect, useState } from 'react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
}

interface WatchlistProps {
  onSelect: (token: string) => void;
}

const Watchlist: React.FC<WatchlistProps> = ({ onSelect }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/watchlist')
      .then(res => res.json())
      .then(data => {
        setStocks(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div style={{ width: 400, borderLeft: '1px solid #ccc', padding: 24 }}>
      <h2>Watchlist</h2>
      {loading ? (
        <div>Loading...</div>
      ) : (
        <ul>
          {stocks.map(stock => (
            <li
              key={stock.symbol}
              style={{ marginBottom: 12, cursor: 'pointer' }}
              onClick={() => onSelect(stock.symbol)}
            >
              <strong>{stock.symbol}</strong> - {stock.name} (${stock.price})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Watchlist;