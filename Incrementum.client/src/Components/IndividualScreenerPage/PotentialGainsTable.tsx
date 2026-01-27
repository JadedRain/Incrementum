
import React, { useState } from "react";
import "../../styles/PotentialGains.css";


// Helper to group entries by symbol
interface PotentialEntry {
  id?: string | number;
  stock_symbol: string;
  purchase_price: number;
  quantity: number;
  purchase_date: string;
}

// function groupBySymbol(potentials: PotentialEntry[]): Record<string, PotentialEntry[]> {
//   const grouped: Record<string, PotentialEntry[]> = {};
//   potentials.forEach((p) => {
//     if (!grouped[p.stock_symbol]) grouped[p.stock_symbol] = [];
//     grouped[p.stock_symbol].push(p);
//   });
//   return grouped;
// }

const API_URL = "/api/user-stock-potentials/"; // Use Vite proxy for backend, matches backend URL with trailing slash

interface StockTableProps {
  filteredSymbols?: string[];
}

interface NewEntry {
  purchase_price?: string;
  quantity?: string;
  purchase_date?: string;
}

const StockTable: React.FC<StockTableProps> = ({ filteredSymbols = [] }) => {
  const [potentials, setPotentials] = useState<Record<string, PotentialEntry[]>>({});
  const [openSymbol, setOpenSymbol] = useState<string | null>(null);
  const [newEntry, setNewEntry] = useState<Record<string, NewEntry>>({});
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Fetch entries for a symbol when expanded
  const fetchPotentialsForSymbol = async (symbol: string) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        headers: {
          "X-User-Id": localStorage.getItem("userId") || "demo-user",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      // Only keep entries for this symbol
      const filtered: PotentialEntry[] = (data.potentials || []).filter((p: PotentialEntry) => p.stock_symbol === symbol);
      setPotentials((prev) => ({ ...prev, [symbol]: filtered }));
    } catch {
      setError("Error loading data");
    } finally {
      setLoading(false);
    }
  };

  // Handle row expand/collapse
  const handleRowClick = (symbol: string) => {
    if (openSymbol !== symbol) {
      fetchPotentialsForSymbol(symbol);
    }
    setOpenSymbol(openSymbol === symbol ? null : symbol);
  };

  // Handle new entry input change
  const handleInputChange = (symbol: string, field: keyof NewEntry, value: string) => {
    setNewEntry((prev) => ({
      ...prev,
      [symbol]: {
        ...prev[symbol],
        [field]: value,
      },
    }));
  };

  // Add new entry for a symbol
  const handleAddEntry = async (symbol: string) => {
    const entry = newEntry[symbol] || {};
    if (!entry.purchase_price || !entry.quantity || !entry.purchase_date) {
      setError("All fields required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-User-Id": localStorage.getItem("userId") || "demo-user",
        },
        body: JSON.stringify({
          stock_symbol: symbol,
          purchase_price: Number(entry.purchase_price),
          quantity: Number(entry.quantity),
          purchase_date: entry.purchase_date,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to add");
      }
      setNewEntry((prev) => ({ ...prev, [symbol]: {} }));
      fetchPotentialsForSymbol(symbol);
    } catch (e) {
      if (e instanceof Error) {
        setError(e.message || "Error adding entry");
      } else {
        setError("Error adding entry");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="stock-table-wrapper">
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {loading && <div>Loading...</div>}
        <table className="stock-table">
          <thead>
            <tr className="stock-table-header-row">
              <th className="stock-table-header-cell">Symbol</th>
              <th className="stock-table-header-cell">Price</th>
              <th className="stock-table-header-cell"># of Shares</th>
              <th className="stock-table-header-cell">Gain/Loss</th>
              <th className="stock-table-header-cell">Date</th>
              <th className="stock-table-header-cell"></th>
            </tr>
          </thead>
          <tbody>
            {filteredSymbols.length === 0 && (
              <tr><td colSpan={6}>No stocks found.</td></tr>
            )}
            {filteredSymbols.map((symbol) => {
              const entries = potentials[symbol] || [];
              return (
                <React.Fragment key={symbol}>
                  <tr
                    className="stock-table-row"
                    onClick={() => handleRowClick(symbol)}
                  >
                    <td className="stock-table-cell">{symbol}</td>
                    <td className="stock-table-cell">{entries[0]?.purchase_price ? `$${entries[0].purchase_price}` : "-"}</td>
                    <td className="stock-table-cell">{entries[0]?.quantity ?? "-"}</td>
                    <td className="stock-table-cell">-</td>
                    <td className="stock-table-cell">{entries[0]?.purchase_date?.slice(0,10) ?? "-"}</td>
                    <td className="stock-table-expand-btn">+</td>
                  </tr>
                  {openSymbol === symbol && (
                    <tr>
                      <td colSpan={6} className="stock-table-collapsible-row">
                        <div className="stock-table-collapsible-content">
                          <div>
                            <b>All Entries for {symbol}:</b>
                            <table className="w-full mt-2">
                              <thead>
                                <tr>
                                  <th>Price</th>
                                  <th>Shares</th>
                                  <th>Date</th>
                                </tr>
                              </thead>
                              <tbody>
                                {entries.length === 0 && (
                                  <tr><td colSpan={3}>No entries yet.</td></tr>
                                )}
                                {entries.map((entry, i) => (
                                  <tr key={entry.id ?? i}>
                                    <td>${entry.purchase_price}</td>
                                    <td>{entry.quantity}</td>
                                    <td>{entry.purchase_date?.slice(0,10)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                            <div className="mt-4">
                              <b>Add Entry:</b>
                              <div className="flex gap-2 mt-2">
                                <input
                                  className="stock-table-input"
                                  type="number"
                                  placeholder="Price"
                                  value={newEntry[symbol]?.purchase_price ?? ""}
                                  onChange={e => handleInputChange(symbol, "purchase_price", e.target.value)}
                                />
                                <input
                                  className="stock-table-input"
                                  type="number"
                                  placeholder="Shares"
                                  value={newEntry[symbol]?.quantity ?? ""}
                                  onChange={e => handleInputChange(symbol, "quantity", e.target.value)}
                                />
                                <input
                                  className="stock-table-input-date"
                                  type="date"
                                  placeholder="Date"
                                  value={newEntry[symbol]?.purchase_date ?? ""}
                                  onChange={e => handleInputChange(symbol, "purchase_date", e.target.value)}
                                />
                                <button
                                  className="bg-blue-500 text-white px-2 py-1 rounded"
                                  onClick={e => { e.stopPropagation(); handleAddEntry(symbol); }}
                                  disabled={loading}
                                >Add</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StockTable;