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
        setStocks(data.stocks);
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
            <li key={idx} style={{ marginBottom: '1rem' }}>
              <span style={{ marginRight: '1rem', fontWeight: 'bold' }}>{name}</span>
              <button>Add</button>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default StockInfoList;
