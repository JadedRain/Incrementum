import { useState, useEffect, useRef } from 'react';
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
    const [industryQuery, setIndustryQuery] = useState('');
    const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const suggestionBoxRef = useRef<HTMLDivElement>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

    // Fetch industry suggestions with debounce
    useEffect(() => {
        const fetchIndustrySuggestions = async () => {
            if (industryQuery.trim().length < 2) {
                setIndustrySuggestions([]);
                return;
            }

            try {
                const response = await fetch(
                    `${API_BASE_URL}/stocks/industry-autocomplete?query=${encodeURIComponent(industryQuery)}`
                );
                const data = await response.json();
                setIndustrySuggestions(data.industries || []);
                setShowSuggestions(true);
            } catch (err) {
                console.error('Error fetching industry suggestions:', err);
            }
        };

        const timeoutId = setTimeout(fetchIndustrySuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [industryQuery, API_BASE_URL]);

    // Close suggestions when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectIndustry = (industry: string) => {
        setSelectedIndustry(industry);
        setIndustryQuery(industry);
        setShowSuggestions(false);
    };

    const searchByIndustry = async () => {
        if (!selectedIndustry.trim()) {
            setError('Please select an industry from the suggestions');
            return;
        }

        const filters: FilterData[] = [{
            operator: 'contains',
            operand: 'industry',
            filter_type: 'string',
            value: selectedIndustry
        }];

        await runScreener(filters);
    };

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
        setIndustryQuery('');
        setSelectedIndustry('');
        setIndustrySuggestions([]);
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
                            <label className="block text-sm font-medium mb-2">
                                Ticker Symbols (comma or space separated):
                            </label>
                            <input
                                type="text"
                                value={tickerSymbols}
                                onChange={(e) => setTickerSymbols(e.target.value.toUpperCase())}
                                onKeyPress={(e) => e.key === 'Enter' && searchByTicker()}
                                placeholder="e.g. AAPL, MSFT, GOOGL"
                                className="w-full px-3 py-2 border rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Enter multiple symbols separated by commas or spaces
                            </p>
                        </div>

                        <div className="mb-4 relative" ref={suggestionBoxRef}>
                            <label className="block text-sm font-medium mb-2">
                                Industry Search:
                            </label>
                            <input
                                type="text"
                                value={industryQuery}
                                onChange={(e) => {
                                    setIndustryQuery(e.target.value);
                                    setSelectedIndustry('');
                                }}
                                onKeyPress={(e) => e.key === 'Enter' && searchByIndustry()}
                                onFocus={() => industrySuggestions.length > 0 && setShowSuggestions(true)}
                                placeholder="Start typing an industry..."
                                className="w-full px-3 py-2 border rounded"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                Type to search for industries (e.g., "banking", "software")
                            </p>
                            
                            {showSuggestions && industrySuggestions.length > 0 && (
                                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded shadow-lg max-h-60 overflow-y-auto">
                                    {industrySuggestions.map((industry, index) => (
                                        <div
                                            key={index}
                                            onClick={() => selectIndustry(industry)}
                                            className="px-3 py-2 hover:bg-blue-100 cursor-pointer"
                                        >
                                            {industry}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-2 mb-6">
                            <button
                                onClick={searchByTicker}
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
                            >
                                Search Tickers
                            </button>
                            <button
                                onClick={searchByIndustry}
                                disabled={loading}
                                className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-400"
                            >
                                Search Industry
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
