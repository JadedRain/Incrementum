import React, { useEffect, useState } from 'react';

interface StockInfo {
  [key: string]: any;
    displayName?: string;
    longName?: string;
    shortName?: string;
    
}

const StockInfoList: React.FC = () => {
  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStocks = async () => {
      try {
  const response = await fetch('/getStockInfo/');
        // if (!response.ok) {
        //   throw new Error('Network response was not ok');
        // }
        const data = await response.json();
        setStocks(data.stocks.slice(0, 11));
        console.log(stocks.length);
      }  finally {
        setLoading(false);
      }
    };
    fetchStocks();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Stock Info</h2>
      <ul>
        {stocks.map((item, idx) => {
          const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
          return (
            <li className="stock-card" key={idx} style={{ marginBottom: '1rem' }}>
              <span className='p-1 newsreader-font'>{name} </span>
              <button className='add-to-watchlist-button'>Add to Watchlist</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StockInfoList;
