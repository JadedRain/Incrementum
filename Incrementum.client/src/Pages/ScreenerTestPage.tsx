import { useState } from 'react';
import NavigationBar from '../Components/NavigationBar';
import '../App.css';

interface Stock {
    symbol: string;
    company_name: string;
}

interface ScreenerResponse {
    stocks: Stock[];
    count: number;
}

interface FilterData {
    operator: string;
    operand: string;
    filter_type: string;
    value?: string;
}

function ScreenerTestPage() {
    const [tickerSymbol, setTickerSymbol] = useState('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const searchByTicker = async () => {
        if (!tickerSymbol.trim()) {
            setError('Please enter a ticker symbol');
            return;
        }

        const filters: FilterData[] = [
            {
                operator: 'equals',
                operand: 'ticker',
                filter_type: 'string',
                value: tickerSymbol.trim()
            }
        ];

        await runScreener(filters);
    };

    const getAllStocks = async () => {
        await runScreener([]);
    };

    const runScreener = async (filters: FilterData[]) => {
        setLoading(true);
        setError('');
        setStocks([]);

        try {
            const response = await fetch(`${API_BASE_URL}/stocks/screen`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(filters)
            });

            const data: ScreenerResponse = await response.json();

            if (!response.ok) {
                throw new Error((data as unknown as { error?: string }).error || 'Request failed');
            }

            setStocks(data.stocks);

        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        } finally {
            setLoading(false);
        }
    };

    const clearResults = () => {
        setStocks([]);
        setTickerSymbol('');
        setError('');
    };

    return (
        <div className="min-h-screen bg-[hsl(40,13%,53%)]">
            <NavigationBar />
            <div className="main-content">
                <div className="max-w-2xl mx-auto p-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold mb-6">Stock Screener Test</h1>

                        <div className="mb-4">
                            <input
                                type="text"
                                value={tickerSymbol}
                                onChange={(e) => setTickerSymbol(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && searchByTicker()}
                                placeholder="Enter ticker symbol"
                                className="w-full px-3 py-2 border rounded"
                            />
                        </div>

                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={searchByTicker}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Search
                            </button>
                            <button
                                onClick={getAllStocks}
                                disabled={loading}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                            >
                                Get All
                            </button>
                            <button
                                onClick={clearResults}
                                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                            >
                                Clear
                            </button>
                        </div>

                        {error && (
                            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                                {error}
                            </div>
                        )}

                        {loading && <div className="text-center py-4">Loading...</div>}

                        {!loading && stocks.length > 0 && (
                            <div>
                                <p className="mb-3 font-semibold">{stocks.length} stocks found:</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {stocks.map((stock) => (
                                        <li key={stock.symbol}>
                                            {stock.symbol} - {stock.company_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {!loading && stocks.length === 0 && !error && (
                            <p className="text-gray-500">No results</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ScreenerTestPage;
