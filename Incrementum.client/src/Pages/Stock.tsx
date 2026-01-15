import '../styles/NavBar.css'
import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../Context/AuthContext";
import NavigationBar from "../Components/NavigationBar";
import Toast from "../Components/Toast";
import { useFetchStockData } from "../hooks/useFetchStockData";
import { FilterDataProvider } from '../Context/FilterDataContext';
import InteractiveGraph from "../Components/InteractiveGraph"
import StockInfoSidebar from '../Components/StockInfoSidebar';

export default function Stock({ token: propToken }: { token?: string; }) {
  const { apiKey } = useAuth();
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;
  const { results, loading } = useFetchStockData(token);
  const [toast, setToast] = useState<string | null>(null);

  if (loading) return <div className="bg-[hsl(40,13%,53%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">Loading...</p></div>;
  if (!results) return <div className="bg-[hsl(40,13%,53%)] min-h-screen flex items-center justify-center" style={{ fontFamily: "serif" }}><p className="text-[hsl(40,66%,60%)]">No stock data found.</p></div>;

  return (
    <FilterDataProvider>
      <div className="bg-[hsl(40,13%,53%)] min-h-screen" style={{ fontFamily: "serif" }}>
        <NavigationBar />
        <div className="main-content" style={{ padding: "20px" }}>
          <Toast message={toast} />

          {/* Back button in a full-width header row above the two-column content */}
          <div style={{ width: '100%', marginBottom: '12px' }}>
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              ← Back
            </button>
          </div>

          {/* Two-column layout: sidebar (fixed width) + graph (fluid). Align tops and give both the same height */}
          <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
            <div style={{ flexShrink: 0 }}>
              <StockInfoSidebar
                results={results}
                apiKey={apiKey}
              />
            </div>

            <div style={{ flex: 1, height: '800px' }}>
              <InteractiveGraph height="800px" />
            </div>
          </div>
        </div>
      </div>
    </FilterDataProvider>
  );
}