import React, { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  Brush,
  CartesianGrid,
  DefaultZIndexes,
  ErrorBar,
  Line,
  LineChart,
  Rectangle,
  ReferenceArea,
  ReferenceLine,
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
  startDate?: string;
  endDate?: string;
  onDateRangeChange?: (startDate: string, endDate: string) => void;
}

interface ApiResponse {
  dates: string[];
  open: number[];
  high: number[];
  low: number[];
  close: number[];
}

interface ChartMouseEvent {
  activeLabel?: string | number;
  activePayload?: unknown[];
  activeTooltipIndex?: number | string | null;
  chartX?: number;
  chartY?: number;
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
  startDate,
  endDate,
  onDateRangeChange,
}) => {
  const [data, setData] = useState<StockDataPoint[]>([]);
  const [filteredData, setFilteredData] = useState<StockDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clickedStart, setClickedStart] = useState<string>('');
  const [clickedEnd, setClickedEnd] = useState<string>('');

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
        setFilteredData(transformedData);
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

  // Filter data when start/end dates change
  useEffect(() => {
    if (!startDate || !endDate) {
      setFilteredData(data);
      // Clear clicked points when dates are reset
      if (!startDate && !endDate) {
        setClickedStart('');
        setClickedEnd('');
      }
      return;
    }

    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();

    const filtered = data.filter(point => {
      const pointTime = new Date(point.time).getTime();
      return pointTime >= start && pointTime <= end;
    });

    setFilteredData(filtered.length > 0 ? filtered : data);
  }, [data, startDate, endDate]);

  const handleMouseDown = (e: ChartMouseEvent) => {
    if (e && e.activeLabel) {
      const clickedDate = String(e.activeLabel);
      
      // If no start date yet, set start date
      if (!clickedStart) {
        setClickedStart(clickedDate);
        setClickedEnd('');
      } 
      // If start date exists but no end date, set end date
      else if (!clickedEnd) {
        setClickedEnd(clickedDate);
        
        // Determine which comes first
        const startIndex = filteredData.findIndex(d => d.time === clickedStart);
        const endIndex = filteredData.findIndex(d => d.time === clickedDate);
        
        if (startIndex !== -1 && endIndex !== -1 && onDateRangeChange) {
          const actualStart = startIndex <= endIndex ? clickedStart : clickedDate;
          const actualEnd = startIndex <= endIndex ? clickedDate : clickedStart;
          onDateRangeChange(actualStart, actualEnd);
        }
      }
      // If both are set, reset and start over
      else {
        setClickedStart(clickedDate);
        setClickedEnd('');
      }
    }
  };

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

  const displayData = filteredData.length > 0 ? filteredData : data;
  const minPrice = Math.min(...displayData.map(d => d.low)) * 0.99;
  const maxPrice = Math.max(...displayData.map(d => d.high)) * 1.01;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        {chartType === 'candle' ? (
          <BarChart
            data={displayData}
            onMouseDown={handleMouseDown}
          >
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
            <Brush
              dataKey="time"
              height={30}
              stroke="var(--accent, #3b82f6)"
              tickFormatter={formatTimestamp}
            />
            {clickedStart && (
              <ReferenceLine
                x={clickedStart}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: 'Start', position: 'top', fill: '#10b981', fontSize: 12 }}
              />
            )}
            {clickedEnd && (
              <ReferenceLine
                x={clickedEnd}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: 'End', position: 'top', fill: '#ef4444', fontSize: 12 }}
              />
            )}
            {clickedStart && clickedEnd && (
              <ReferenceArea
                x1={clickedStart}
                x2={clickedEnd}
                strokeOpacity={0.3}
                fill="var(--accent, #3b82f6)"
                fillOpacity={0.1}
              />
            )}
          </BarChart>
        ) : (
          <LineChart
            data={displayData}
            onMouseDown={handleMouseDown}
          >
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
            <Brush
              dataKey="time"
              height={30}
              stroke="var(--accent, #3b82f6)"
              tickFormatter={formatTimestamp}
            />
            {clickedStart && (
              <ReferenceLine
                x={clickedStart}
                stroke="#10b981"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: 'Start', position: 'top', fill: '#10b981', fontSize: 12 }}
              />
            )}
            {clickedEnd && (
              <ReferenceLine
                x={clickedEnd}
                stroke="#ef4444"
                strokeWidth={2}
                strokeDasharray="3 3"
                label={{ value: 'End', position: 'top', fill: '#ef4444', fontSize: 12 }}
              />
            )}
            {clickedStart && clickedEnd && (
              <ReferenceArea
                x1={clickedStart}
                x2={clickedEnd}
                strokeOpacity={0.3}
                fill="var(--accent, #3b82f6)"
                fillOpacity={0.1}
              />
            )}
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default StockChart;
