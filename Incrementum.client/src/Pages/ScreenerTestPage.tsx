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
    const [tickerSymbols, setTickerSymbols] = useState('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    const searchByTicker = async () => {
        const trimmed = tickerSymbols.trim();
        if (!trimmed) {
            setError('Please enter at least one ticker symbol');
            return;
        }

        // Split by comma or space and filter out empty strings
        const symbols = trimmed
            .split(/[,\s]+/)
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0);

        if (symbols.length === 0) {
            setError('Please enter valid ticker symbols');
            return;
        }

        const filters: FilterData[] = symbols.map(symbol => ({
            operator: 'equals',
            operand: 'ticker',
            filter_type: 'string',
            value: symbol
        }));

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
        setTickerSymbols('');
        setError('');
    };

    const handleEnterAdd = () => {
        const trimmed = tickerSymbols.trim();
        if (!trimmed) return;

        const symbols = trimmed
            .split(/[,\s]+/)
            .map(s => s.trim().toUpperCase())
            .filter(s => s.length > 0);

        if (symbols.length === 0) return;

        setSelectedStocks(prev => {
            const map = new Map(prev.map(s => [s.symbol, s]));
            for (const sym of symbols) {
                if (!map.has(sym)) map.set(sym, { symbol: sym, company_name: '' });
            }
            return Array.from(map.values());
        });

        setTickerSymbols('');
        setError('');
    };

    const addToSelected = (stock: Stock) => {
        setSelectedStocks(prev => {
            if (prev.find(s => s.symbol === stock.symbol)) return prev;
            return [...prev, stock];
        });
    };

    const removeFromSelected = (symbol: string) => {
        setSelectedStocks(prev => prev.filter(s => s.symbol !== symbol));
    };

    const addAllResultsToSelected = () => {
        setSelectedStocks(prev => {
            const map = new Map(prev.map(s => [s.symbol, s]));
            for (const s of stocks) map.set(s.symbol, s);
            return Array.from(map.values());
        });
    };

    const clearSelected = () => setSelectedStocks([]);

    const searchSelected = async () => {
        if (selectedStocks.length === 0) {
            setError('No selected stocks to search');
            return;
        }

        const filters: FilterData[] = selectedStocks.map(s => ({
            operator: 'equals',
            operand: 'ticker',
            filter_type: 'string',
            value: s.symbol,
        }));

        await runScreener(filters);
    };

    return (
        <div className="min-h-screen bg-[hsl(40,13%,53%)]">
            <NavigationBar />
            <div className="main-content">
                <div className="max-w-2xl mx-auto p-8">
                    <div className="bg-white rounded-lg shadow p-6">
                        <h1 className="text-2xl font-bold mb-6">Stock Screener Test</h1>

                        <div className="mb-4">
                            <label className="block text-sm font-medium mb-2">
                                Ticker Symbols (comma or space separated):
                            </label>
                            <input
                                type="text"
                                value={tickerSymbols}
                                onChange={(e) => setTickerSymbols(e.target.value.toUpperCase())}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        handleEnterAdd();
                                    }
                                }}
                                placeholder="e.g. AAPL, MSFT, GOOGL"
                                className="w-full px-3 py-2 border rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter multiple symbols separated by commas or spaces
                            </p>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={() => selectedStocks.length > 0 ? searchSelected() : searchByTicker()}
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
                                <div className="flex items-center justify-between mb-3">
                                    <p className="font-semibold">{stocks.length} stocks found:</p>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={addAllResultsToSelected}
                                            className="px-3 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                                        >
                                            Add All
                                        </button>
                                    </div>
                                </div>
                                <ul className="list-disc list-inside space-y-1">
                                    {stocks.map((stock) => {
                                        const already = selectedStocks.find(s => s.symbol === stock.symbol);
                                        return (
                                            <li key={stock.symbol} className="flex items-center justify-between">
                                                <span>{stock.symbol} - {stock.company_name}</span>
                                                <button
                                                    onClick={() => addToSelected(stock)}
                                                    disabled={!!already}
                                                    className={`ml-4 px-2 py-1 rounded ${already ? 'bg-gray-300 text-gray-600' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                                                >
                                                    {already ? 'Added' : 'Add'}
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}

                        {selectedStocks.length > 0 && (
                            <div className="mt-6 bg-gray-50 p-3 rounded">
                                <p className="mb-2 font-semibold">Selected stocks ({selectedStocks.length}):</p>
                                <ul className="list-disc list-inside space-y-1">
                                    {selectedStocks.map(s => (
                                        <li key={s.symbol} className="flex items-center justify-between">
                                            <span>{s.symbol} - {s.company_name}</span>
                                            <button
                                                onClick={() => removeFromSelected(s.symbol)}
                                                className="ml-4 px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                                            >
                                                Remove
                                            </button>
                                        </li>
                                    ))}
                                </ul>

                                <div className="flex gap-2 mt-4">
                                    <button
                                        onClick={searchSelected}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                    >
                                        Search Selected
                                    </button>
                                    <button
                                        onClick={clearSelected}
                                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                                    >
                                        Clear Selected
                                    </button>
                                </div>
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
