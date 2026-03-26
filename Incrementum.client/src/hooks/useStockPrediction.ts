import { useState } from "react";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export interface StockPrediction {
  symbol: string;
  last_close: number;
  predicted_price: number;
  predicted_log_return: number;
  predicted_log_return_norm: number;
  lookback_end_time: string;
  model_version: string;
  lookback_periods: number;
  data_records_used: number;
}

export function useStockPrediction() {
  const [prediction, setPrediction] = useState<StockPrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getPrediction = async (ticker: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchWrapper(() =>
        fetch(apiString(`/api/predict/${ticker}/`))
      );
      const data = await res.json();
      setPrediction(data as StockPrediction);
    } catch (err) {
      console.error("Error fetching stock prediction:", err);
      setError("Failed to fetch prediction");
    } finally {
      setLoading(false);
    }
  };

  return { prediction, loading, error, getPrediction };
}
