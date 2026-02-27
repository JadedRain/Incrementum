import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  DefaultZIndexes,
  ErrorBar,
  Line,
  LineChart,
  Rectangle,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { BarShapeProps } from 'recharts';
import { apiString } from '../Context/FetchingHelper';
import Loading from './Loading';

interface StockDataPoint {
  time: string;
  date: Date;
  open: number;
  high: number;
  low: number;
  close: number;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    payload: StockDataPoint;
    value?: number;
  }>;
}

interface StockChartProps {
  ticker: string;
  period?: string;
  interval?: string;
  chartType?: 'line' | 'candle';
  height?: string;
}

interface ApiResponse {
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
}

const formatTimestamp = (dateStr: string): string => {
  const date = new Date(dateStr);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  
  if (hours === 0 && minutes === 0) {
    // If time is midnight, just show the date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }
  
  // Otherwise show time
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

const formatDollars = (value: number): string => `$${value.toFixed(2)}`;

const barDataKey = (entry: StockDataPoint): [number, number] => [
  Math.min(entry.close, entry.open),
  Math.max(entry.close, entry.open),
];

const whiskerDataKey = (entry: StockDataPoint): [number, number] => {
  const highEnd = Math.max(entry.close, entry.open);
  return [highEnd - entry.low, entry.high - highEnd];
};

const Candlestick = (props: BarShapeProps) => {
  // @ts-expect-error Recharts does spread StockDataPoint on the props but the types don't reflect that
  const color = props.open < props.close ? '#10b981' : '#ef4444'; // green : red
  return <Rectangle {...props} fill={color} />;
};

const CandlestickTooltip = (props: CustomTooltipProps) => {
  const { active, payload } = props;
  if (active && payload && payload.length > 0) {
    const entry: StockDataPoint = payload[0].payload as StockDataPoint;
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface, white)',
          border: '1px solid var(--border-color, #ccc)',
          padding: '0.5em 1em',
          borderRadius: '4px',
          color: 'var(--text-primary, black)',
        }}
      >
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
          {new Date(entry.time).toLocaleString()}
        </p>
        <p style={{ margin: '4px 0' }}>{`Open: ${formatDollars(entry.open)}`}</p>
        <p style={{ margin: '4px 0' }}>{`Close: ${formatDollars(entry.close)}`}</p>
        <p style={{ margin: '4px 0' }}>{`Low: ${formatDollars(entry.low)}`}</p>
        <p style={{ margin: '4px 0' }}>{`High: ${formatDollars(entry.high)}`}</p>
      </div>
    );
  }
  return null;
};

const LineTooltip = (props: CustomTooltipProps) => {
  const { active, payload } = props;
  if (active && payload && payload.length > 0) {
    const entry: StockDataPoint = payload[0].payload as StockDataPoint;
    return (
      <div
        style={{
          backgroundColor: 'var(--bg-surface, white)',
          border: '1px solid var(--border-color, #ccc)',
          padding: '0.5em 1em',
          borderRadius: '4px',
          color: 'var(--text-primary, black)',
        }}
      >
        <p style={{ margin: '4px 0', fontWeight: 'bold' }}>
          {new Date(entry.time).toLocaleString()}
        </p>
        <p style={{ margin: '4px 0' }}>{`Price: ${formatDollars(entry.close)}`}</p>
      </div>
    );
  }
  return null;
};

const StockChart: React.FC<StockChartProps> = ({
  ticker,
  period = '1y',
  interval = '1d',
  chartType = 'line',
  height = '600px',
}) => {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const url = apiString(`/getStocks/${encodeURIComponent(ticker)}/?period=${encodeURIComponent(
          period
        )}&interval=${encodeURIComponent(interval)}`);
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch data: ${response.statusText}`);
        }
        
        const json: ApiResponse = await response.json();
        
        // Transform the API data into the format we need
        const transformedData: StockDataPoint[] = json.dates.map((dateStr, index) => ({
          time: dateStr,
          date: new Date(dateStr),
          open: json.open[index] || 0,
          high: json.high[index] || 0,
          low: json.low[index] || 0,
          close: json.close[index] || 0,
        }));
        
        setData(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        console.error('Error fetching stock data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (ticker) {
      fetchData();
    }
  }, [ticker, period, interval]);

  if (loading) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Loading loading={true} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--status-error, red)' }}>Error: {error}</p>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available for {ticker}</p>
      </div>
    );
  }

  const minPrice = Math.min(...data.map(d => d.low)) * 0.99;
  const maxPrice = Math.max(...data.map(d => d.high)) * 1.01;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'candle' ? (
          <BarChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-color, #ccc)"
            />
            <XAxis
              dataKey="time"
              tickFormatter={formatTimestamp}
              stroke="var(--text-secondary, #666)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tickFormatter={formatDollars}
              stroke="var(--text-secondary, #666)"
              style={{ fontSize: '12px' }}
            />
            <Bar dataKey={barDataKey} shape={Candlestick}>
              <ErrorBar dataKey={whiskerDataKey} width={0} strokeWidth={1} zIndex={DefaultZIndexes.bar - 1} />
            </Bar>
            <Tooltip content={CandlestickTooltip} />
          </BarChart>
        ) : (
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke="var(--border-color, #ccc)"
            />
            <XAxis
              dataKey="time"
              tickFormatter={formatTimestamp}
              stroke="var(--text-secondary, #666)"
              style={{ fontSize: '12px' }}
            />
            <YAxis
              domain={[minPrice, maxPrice]}
              tickFormatter={formatDollars}
              stroke="var(--text-secondary, #666)"
              style={{ fontSize: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="close"
              stroke="var(--accent, #3b82f6)"
              strokeWidth={2}
              dot={false}
            />
            <Tooltip content={LineTooltip} />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
