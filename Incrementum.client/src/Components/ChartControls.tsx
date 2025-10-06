import React from 'react';

interface ChartControlsProps {
  period: string;
  interval: string;
  onPeriodChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onIntervalChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const periods = [
  { label: "1 Day", value: "1d" },
  { label: "5 Days", value: "5d" },
  { label: "1 Month", value: "1mo" },
  { label: "6 Months", value: "6mo" },
  { label: "1 Year", value: "1y" },
  { label: "2 Years", value: "2y" },
];

const intervals = [
  { label: "5 Minutes", value: "5m" },
  { label: "15 Minutes", value: "15m" },
  { label: "30 Minutes", value: "30m" },
  { label: "1 Hour", value: "1h" },
  { label: "1 Day", value: "1d" },
  { label: "1 Week", value: "1wk" },
];

const ChartControls: React.FC<ChartControlsProps> = ({
  period,
  interval,
  onPeriodChange,
  onIntervalChange
}) => {
  return (
    <div className="flex gap-4 mt-2">
      <div>
        <label htmlFor="period" className="mr-2 font-semibold">Time Frame:</label>
        <select
          id="period"
          value={period}
          onChange={onPeriodChange}
          className="rounded p-1"
        >
          {periods.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="interval" className="mr-2 font-semibold">Interval:</label>
        <select
          id="interval"
          value={interval}
          onChange={onIntervalChange}
          className="rounded p-1"
        >
          {intervals.map((i) => (
            <option key={i.value} value={i.value}>{i.label}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default ChartControls;