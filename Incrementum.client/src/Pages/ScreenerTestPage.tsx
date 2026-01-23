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
    value?: string | number;
}

function ScreenerTestPage() {
    const [tickerSymbols, setTickerSymbols] = useState('');
    const [industryQuery, setIndustryQuery] = useState('');
    const [industrySuggestions, setIndustrySuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedIndustry, setSelectedIndustry] = useState('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [ppsMin, setPpsMin] = useState('');
    const [ppsMax, setPpsMax] = useState('');
    const suggestionBoxRef = useRef<HTMLDivElement>(null);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

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

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };

        // add PPS filters if provided
        if (ppsMin !== '') {
            filters.push({
                operator: 'greater_than',
                operand: 'pps',
                filter_type: 'numeric',
                value: Number(ppsMin)
            });
        }
        if (ppsMax !== '') {
            filters.push({
                operator: 'less_than',
                operand: 'pps',
                filter_type: 'numeric',
                value: Number(ppsMax)
            });
        }

        await runScreener(filters);
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectIndustry = (industry: string) => {
        setSelectedIndustry(industry);
        setIndustryQuery(industry);
        setShowSuggestions(false);
    };

    const getAllStocks = async () => {
        const filters: FilterData[] = [];
        if (ppsMin !== '') {
            filters.push({
                operator: 'greater_than',
                operand: 'pps',
                filter_type: 'numeric',
                value: Number(ppsMin)
            });
        }
        if (ppsMax !== '') {
            filters.push({
                operator: 'less_than',
                operand: 'pps',
                filter_type: 'numeric',
                value: Number(ppsMax)
            });
        }

        await runScreener(filters);
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
        setPpsMin('');
        setPpsMax('');
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
        // Allow searching when no tickers are selected if PPS filters are provided
        if (selectedStocks.length === 0 && ppsMin === '' && ppsMax === '') {
            setError('No selected stocks to search');
            return;
        }

        const filters: FilterData[] = selectedStocks.map(s => ({
            operator: 'equals',
            operand: 'ticker',
            filter_type: 'string',
            value: s.symbol,
        }));

        if (ppsMin !== '') {
            filters.push({
                operator: 'greater_than',
                operand: 'pps',
                filter_type: 'numeric',
                value: Number(ppsMin)
            });
        }
        if (ppsMax !== '') {
            filters.push({
                operator: 'less_than',
                operand: 'pps',
                filter_type: 'numeric',
                value: Number(ppsMax)
            });
        }

        await runScreener(filters);
    };

    const searchByIndustryAndTickers = async () => {
        const hasIndustry = selectedIndustry.trim().length > 0;
        const hasTickerInput = tickerSymbols.trim().length > 0;
        const hasSelectedStocks = selectedStocks.length > 0;

        if (!hasIndustry && !hasTickerInput && !hasSelectedStocks) {
            setError('Please enter an industry, ticker symbols, or select stocks');
            return;
        }

        const filters: FilterData[] = [];

        if (hasIndustry) {
            filters.push({
                operator: 'contains',
                operand: 'industry',
                filter_type: 'string',
                value: selectedIndustry
            });
        }

        if (hasSelectedStocks) {
            const tickerFilters = selectedStocks.map(s => ({
                operator: 'equals',
                operand: 'ticker',
                filter_type: 'string',
                value: s.symbol
            }));
            filters.push(...tickerFilters);
        } else if (hasTickerInput) {
            const symbols = tickerSymbols
                .trim()
                .split(/[,\s]+/)
                .map(s => s.trim().toUpperCase())
                .filter(s => s.length > 0);

            if (symbols.length > 0) {
                const tickerFilters = symbols.map(symbol => ({
                    operator: 'equals',
                    operand: 'ticker',
                    filter_type: 'string',
                    value: symbol
                }));
                filters.push(...tickerFilters);
            }
        }

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

                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">PPS Greater Than</label>
                                <input
                                    type="number"
                                    value={ppsMin}
                                    onChange={(e) => setPpsMin(e.target.value)}
                                    placeholder="Enter min PPS (numeric)"
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to ignore</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">PPS Less Than</label>
                                <input
                                    type="number"
                                    value={ppsMax}
                                    onChange={(e) => setPpsMax(e.target.value)}
                                    placeholder="Enter max PPS (numeric)"
                                    className="w-full px-3 py-2 border rounded"
                                />
                                <p className="text-xs text-gray-500 mt-1">Leave empty to ignore</p>
                            </div>
                        </div>

                        <div className="flex gap-2 mb-6">
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
                                onKeyPress={(e) => e.key === 'Enter' && searchByIndustryAndTickers}
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

                        <div className="flex gap-2 mb-6 flex-wrap">
                            <button
                                onClick={searchByIndustryAndTickers}
                                disabled={loading}
                                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:bg-gray-400"
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
