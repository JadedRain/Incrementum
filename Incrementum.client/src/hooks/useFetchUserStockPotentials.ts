import { useState, useEffect } from "react";
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

export interface UserStockPotential {
  id: number;
  account_id: number;
  stock_symbol: string;
  company_name: string;
  purchase_date: string;
  quantity: string;
  purchase_price: string;
  screener: number | null;
  difference: string;
}

export function useFetchUserStockPotentials(stockSymbol: string | undefined, apiKey: string | null, refreshKey?: number) {
  const [potentials, setPotentials] = useState<UserStockPotential[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!stockSymbol || !apiKey) return;

    const fetchPotentials = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetchWrapper(() =>
          fetch(apiString(`/api/user-stock-potentials/stock/${stockSymbol}/`), {
            headers: {
              "X-User-Id": apiKey,
            },
          })
        );
        const data = await res.json();
        setPotentials(data.potentials || []);
      } catch (err) {
        console.error("Error fetching user stock potentials:", err);
        setError("Failed to load user stock potentials");
        setPotentials([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPotentials();
  }, [stockSymbol, apiKey, refreshKey]);

  return { potentials, loading, error };
}
