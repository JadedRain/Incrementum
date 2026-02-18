import '../styles/NavBar.css'
import { useState } from "react";
import { useParams } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import Toast from "../Components/Toast";
import { useFetchStockData } from "../hooks/useFetchStockData";
import { FilterDataProvider } from '../Context/FilterDataContext';
import InteractiveGraph from "../Components/InteractiveGraph"
import StockInfoSidebar from '../Components/StockInfoSidebar';
import Loading from "../Components/Loading";

export default function Stock({ token: propToken }: { token?: string; }) {
  const params = useParams<{ token: string }>();
  const token = propToken ?? params.token;
  const { results, loading } = useFetchStockData(token);
  const [toast] = useState<string | null>(null);

  if (loading) return <div className="stock-page-loading"><Loading loading={true} /></div>;
  if (!results) return <div className="stock-page-loading"><p>No stock data found.</p></div>;

  return (
    <FilterDataProvider>
      <div className="stock-page-wrapper">
        <NavigationBar />
        <div className="stock-page-content">
          <Toast message={toast} />

          <div className="stock-page-header">
            <button
              onClick={() => window.history.back()}
              className="back-button"
            >
              ← Back
            </button>
          </div>

          <div className="stock-page-body">
            <div className="stock-page-sidebar">
              <StockInfoSidebar results={results} />
            </div>
            <div className="stock-page-graph">
              <InteractiveGraph height="800px" />
            </div>
          </div>
        </div>
      </div>
    </FilterDataProvider>
  );
}