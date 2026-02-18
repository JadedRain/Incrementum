import '../styles/SearchResultsPage.css'
import { useParams } from "react-router-dom";
import { useState } from 'react';
import NavigationBar from "../Components/NavigationBar";
import StockCard from "../Components/StockCard";
import { useStockSearch } from "../hooks/useStockSearch";
import Loading from "../Components/Loading";
import PaginationControls from "../Components/PaginationControls";
import Toast from '../Components/Toast';

function SearchResults() {
  const { query } = useParams<{ query: string }>();
  const { results, loading, page, hasMore, totalPages, handleNext, handlePrev } = useStockSearch(query ?? "");
  const [toast, setToast] = useState<string | null>(null);

  return (
    <div className="page-shell">
      <NavigationBar />
      <Toast message={toast} />
      <div className="SearchResults-main-content">
        {loading && (
          <div className="loading-placeholder">
            <Loading loading={true} loadingText="Loading stocks..." />
          </div>
        )}
        {!loading && results.length === 0 && <p>No results found.</p>}

        {!loading && results.length >= 1 && (
          <>
            <div className="search-results-row">
              <div className="search-results-spacer" />
            </div>
            <ul>
              {results.map((stock: { symbol: string; name: string }) => (
                <li key={stock.symbol}>
                  <StockCard symbol={stock.symbol} name={stock.name} setToast={setToast} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <PaginationControls
            page={page}
            hasMore={hasMore}
            loading={loading}
            totalPages={totalPages ?? undefined}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchResults;