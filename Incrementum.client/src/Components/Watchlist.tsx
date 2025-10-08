import React, { useEffect, useState } from 'react';

interface Stock {
  symbol: string;
  name: string;
  price: number;
}

interface WatchlistProps {
  onSelect: (token: string) => void;
}

const sortOptions = [
  { label: 'Default', value: 'default' },
  { label: 'Date Added', value: 'date_added' },
];

const Watchlist: React.FC<WatchlistProps> = ({ onSelect }) => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState('default');

  useEffect(() => {
    setLoading(true);
    const endpoint =
      sortBy === 'date_added'
        ? '/watchlist/sorted/'
        : '/watchlist';
    fetch(endpoint)
      .then(res => res.json())
      .then(data => {
        setStocks(data.watchlist || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [sortBy]);

  return (
    <div style={{ width: 400, borderLeft: '1px solid #ccc', padding: 24 }}>
      <h2>Watchlist</h2>
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="sort-select" style={{ marginRight: 8 }}>Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={e => setSortBy(e.target.value)}
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>
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