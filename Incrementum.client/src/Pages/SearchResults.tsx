import '../styles/SearchResultsPage.css'
import { useParams } from "react-router-dom";
import NavigationBar from "../Components/NavigationBar";
import StockCard from "../Components/StockCard";
import { useStockSearch } from "../hooks/useStockSearch";
import Loading from "../Components/Loading";
import PaginationControls from "../Components/PaginationControls";

function SearchResults() {
  const { query } = useParams<{ query: string }>();
  const { results, loading, page, hasMore, handleNext, handlePrev } = useStockSearch(query ?? "");

  return (
    <div style={{ padding: "20px", fontFamily: "serif" }}
      className="bg-[hsl(40,13%,53%)] min-h-screen">
      <NavigationBar />
      <div className="SearchResults-main-content">
        <h1 className="SearchResultsPage-h1">
          Search Results
        </h1>
        <h2 className="text-[#DABB7C]">Results for "{query}"</h2>
        {loading && (
          <div className="w-full flex items-center justify-center" style={{ height: '120px' }}>
            <Loading loading={true} loadingText="Loading stocks..." />
          </div>
        )}
        {!loading && results.length === 0 && <p>No results found.</p>}

        {!loading && results.length >= 1 && (
          <>
            <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {results.map((stock: { symbol: string; name: string }) => (
                <li key={stock.symbol}>
                  <StockCard symbol={stock.symbol} name={stock.name} />
                </li>
              ))}
            </ul>
          </>
        )}

        <div className="mt-4 flex gap-2">
          <PaginationControls
            page={page}
            hasMore={hasMore}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </div>
  );
}

export default SearchResults;