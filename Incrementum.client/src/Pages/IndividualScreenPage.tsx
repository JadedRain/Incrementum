import { useNavigate } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import Loading from '../Components/Loading';
import Sidebar from '../Components/Sidebar';
import NavigationBar from '../Components/NavigationBar';
import '../App.css';
import type { CustomScreener, CategoricalFilter } from '../Types/ScreenerTypes';
import { fetchCustomScreener } from "../Query/apiScreener";
import { useQuery } from "@tanstack/react-query";
import { useParams } from 'react-router-dom';

interface StockInfo {
  displayName?: string;
  longName?: string;
  shortName?: string;
  symbol?: string;
  regularMarketChangePercent?: number;
  currentPrice?: number;
}

export default function IndividualScreenPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { apiKey } = useAuth();

  const [stocks, setStocks] = useState<StockInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSectors, setSelectedSectors] = useState<string[]>([]);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>([]);

  const [percentThreshold, setPercentThreshold] = useState('');
  const [changePeriod, setChangePeriod] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [percentChangeFilter, setPercentChangeFilter] = useState<string>('gt');

  // Page-level avg volume inputs (strings for user input). We'll parse these before requests.
  const [average_volume_min, setAvgVolumeMin] = useState<string>('');
  const [average_volume_max, setAvgVolumeMax] = useState<string>('');

  const { data, error } = useQuery<CustomScreener>({
    queryKey: ["customScreener", id],
    queryFn: () => fetchCustomScreener(id!, apiKey),
  });

  useEffect(() => {
    if (!data) return;
    const filterMap: Record<string, string[]> = {};
    (data.categorical_filters || []).forEach((f: CategoricalFilter) => {
      const key = f.filter_name.toLowerCase();
      const values = Array.isArray(f.value) ? f.value : f.value ? [f.value] : [];
      if (!filterMap[key]) filterMap[key] = [];
      filterMap[key].push(...values);
    });
    setSelectedSectors(filterMap['sector'] ?? []);
    setSelectedIndustries(filterMap['industry'] ?? []);
  }, [data]);

  // parseVolumeInput: supports 'k' and 'm' suffixes. Plain small integers (1..999) map to thousands.
  const parseVolumeInput = (v?: string | null): number | null => {
    if (!v) return null;
    const s = v.toString().trim().toLowerCase();
    if (!s) return null;
    const last = s[s.length - 1];
    let num: number | null = null;
    if (last === 'k') {
      const n = parseFloat(s.slice(0, -1));
      if (!Number.isNaN(n)) num = Math.round(n * 1_000);
    } else if (last === 'm') {
      const n = parseFloat(s.slice(0, -1));
      if (!Number.isNaN(n)) num = Math.round(n * 1_000_000);
    } else {
      const n = parseFloat(s);
      if (!Number.isNaN(n)) {
        if (n > 0 && n < 1000) num = Math.round(n * 1_000);
        else num = Math.round(n);
      }
    }
    return num;
  };

  useEffect(() => {
    // Fetch stocks whenever relevant filters change, including avg-volume inputs.
    let mounted = true;

    const fetchStocks = async () => {
      setLoading(true);

      const minVal = parseVolumeInput(average_volume_min);
      const maxVal = parseVolumeInput(average_volume_max);

      const baseFilters: Record<string, any> = {};
      if (selectedSectors && selectedSectors.length) baseFilters.sectors = selectedSectors;
      if (selectedIndustries && selectedIndustries.length) baseFilters.industries = selectedIndustries;
      if (percentThreshold) {
        baseFilters.percent_change_filter = percentChangeFilter;
        baseFilters.percent_change_value = percentThreshold;
        baseFilters.percent_change_period = changePeriod;
      }

      try {
        // Both bounds set -> two backend calls + client-side intersection
        if (minVal != null && maxVal != null) {
          const fMin = { ...baseFilters, average_volume_filter: 'gte', average_volume_value: minVal };
          const fMax = { ...baseFilters, average_volume_filter: 'lte', average_volume_value: maxVal };

          const p1 = new URLSearchParams();
          p1.set('max', '250');
          p1.set('offset', '0');
          p1.set('filters', JSON.stringify(fMin));

          const p2 = new URLSearchParams();
          p2.set('max', '250');
          p2.set('offset', '0');
          p2.set('filters', JSON.stringify(fMax));

          const [res1, res2] = await Promise.all([
            fetch(`/getStockInfo/?${p1.toString()}`),
            fetch(`/getStockInfo/?${p2.toString()}`),
          ]);

          const [json1, json2] = await Promise.all([res1.json(), res2.json()]);
          const arr1 = Array.isArray(json1) ? json1 : (json1.stocks || []);
          const arr2 = Array.isArray(json2) ? json2 : (json2.stocks || []);

          const map1 = new Map(arr1.map((s: any) => [s.symbol, s]));
          const intersection = arr2.filter((s: any) => map1.has(s.symbol)).map((s: any) => map1.get(s.symbol));

          if (!mounted) return;
          setStocks(intersection.slice(0, 4));
          setLoading(false);
          return;
        }

        // single-sided filter or none
        const filters: Record<string, any> = { ...baseFilters };
        if (minVal != null) {
          filters.average_volume_filter = 'gte';
          filters.average_volume_value = minVal;
        } else if (maxVal != null) {
          filters.average_volume_filter = 'lte';
          filters.average_volume_value = maxVal;
        }

        const params = new URLSearchParams();
        params.set('max', '10');
        params.set('offset', '0');
        if (Object.keys(filters).length) params.set('filters', JSON.stringify(filters));

        const response = await fetch(`/getStockInfo/?${params.toString()}`);
        const body = await response.json();
        const results = (body.stocks || []).slice(0, 4);

        if (!mounted) return;
        setStocks(results);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching stocks', err);
        if (!mounted) return;
        setStocks([]);
        setLoading(false);
      }
    };

    fetchStocks();

    return () => {
      mounted = false;
    };
  }, [selectedSectors, selectedIndustries, percentThreshold, percentChangeFilter, changePeriod, average_volume_min, average_volume_max]);

  if (!id) return <div>Loading screener...</div>;

  return (
    <div className="min-h-screen bg-[hsl(40,62%,26%)]">
      <NavigationBar />
      <div className="main-content">
        <div className="pt-32 px-8 ScreenerPage-main-layout">
          <div className="w-full flex">
            <div className="StockTable-container">
              <div className="StockTable-header-row">
                <div className="StockTable-header">Company</div>
                <div className="StockTable-header">Symbol</div>
                <div className="StockTable-header">Chart</div>
                <div className="StockTable-header">Change</div>
              </div>

              <Loading loading={loading} loadingText="Loading screener results..." />

              {!loading && stocks.map((item, idx) => {
                const name = item.displayName || item.longName || item.shortName || 'Unnamed Stock';
                const symbol = item.symbol || 'N/A';
                const percent = item.regularMarketChangePercent;
                return (
                  <div className="StockTable-row cursor-pointer" key={idx} onClick={() => navigate(`/stock/${symbol}`)}>
                    <div className="StockTable-cell font-medium">{name}</div>
                    <div className="StockTable-cell font-mono text-sm uppercase tracking-wider">{symbol}</div>
                    <div className="StockTable-cell">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm shadow-sm">{symbol[0] || '?'}</div>
                    </div>
                    <div className={`StockTable-cell ${percent != null && percent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {percent != null ? (percent >= 0 ? `+${percent.toFixed(2)}%` : `${percent.toFixed(2)}%`) : 'N/A'}
                    </div>
                  </div>
                );
              })}
            </div>

            <Sidebar
              selectedSectors={selectedSectors}
              onSelectedSectorsChange={setSelectedSectors}
              selectedIndustries={selectedIndustries}
              onSelectedIndustriesChange={setSelectedIndustries}
              percentThreshold={percentThreshold}
              onPercentThresholdChange={setPercentThreshold}
              changePeriod={changePeriod}
              onChangePeriod={setChangePeriod}
              percentChangeFilter={percentChangeFilter}
              onPercentChangeFilter={setPercentChangeFilter}
              showCustomScreenerSection={true}
              apiKey={apiKey || undefined}
              avgVolumeMin={average_volume_min}
              setAvgVolumeMin={setAvgVolumeMin}
              avgVolumeMax={average_volume_max}
              setAvgVolumeMax={setAvgVolumeMax}
            />
          </div>
        </div>
      </div>
    </div>
  );
}