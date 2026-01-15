import '../styles/Stocks/StockInfoList.css'
import React, { useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useFetchStocks } from '../useFetchStocks';
import Toast from '../Components/Toast';
import { FilterDataProvider } from '../Context/FilterDataContext';


const StockInfoList: React.FC = () => {
    const { apiKey } = useAuth();
    const { stocks, loading } = useFetchStocks();
    const [toast, setToast] = useState<string | null>(null);

    if (loading) return <div>Loading...</div>;

    return (
        <FilterDataProvider>
        <div>
            <Toast message={toast} />
            <h2>Stock Info</h2>
            <ul>
                {stocks.map((item, idx) => {
                    const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
                    const symbol = item.symbol as string | undefined;
                    return (
                        <li className="stock-card" key={idx} style={{ marginBottom: '1rem' }}>
                            <span className='p-1 newsreader-font'>{name} </span>
                        </li>
                    );
                })}
            </ul>
        </div>
        </FilterDataProvider>
    );
}

export default StockInfoList;