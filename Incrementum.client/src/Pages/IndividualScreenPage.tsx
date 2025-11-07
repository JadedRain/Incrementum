import '../styles/SideBar.css'
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Sidebar from '../Components/Sidebar'
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import Toast from '../Components/Toast'
import { fetchCustomScreener } from "../Query/apiScreener"
import { useFetchWatchlist } from '../useFetchWatchlist';
import { addToWatchlist, removeFromWatchlist } from '../utils/watchlistActions';
import type { CustomScreener } from '../Types/ScreenerTypes';
import { FilterDataProvider } from '../Context/FilterDataContext';

function IndividualScreenPage() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [toast, setToast] = useState<string | null>(null);
  const [pending, setPending] = useState<string | null>(null);

  const { watchlistSymbols, setWatchlistSymbols } = useFetchWatchlist(apiKey);


  const { id } = useParams<{ id: string }>();
  const numid = Number(id);

  if (!id) {
    return <div>Loading screener...</div>; // or redirect
  }


  if (!isNaN(numid)) {
    const { data, error } = useQuery<CustomScreener>({
      queryKey: ["customScreener", id],
      queryFn: () => fetchCustomScreener(id!, apiKey),
    });
    useEffect(() => { console.log(data) }, [data]);
  }
  else {
    const data = null;
    const error = null;
  }


  const handleToggleWatchlist = async (symbol: string, inWatchlist: boolean) => {
    if (!apiKey || !symbol) return;

    if (inWatchlist) {
      await removeFromWatchlist(symbol, apiKey, setPending, setToast, undefined, setWatchlistSymbols);
    } else {
      await addToWatchlist(symbol, apiKey, setPending, setToast, undefined, setWatchlistSymbols);
    }
  };

  return (
    <FilterDataProvider>
      <div className="min-h-screen bg-[hsl(40,13%,53%)]">
        <NavigationBar />
        <Toast message={toast} />
        <div className="main-content">
          <div className="pt-32 px-8 ScreenerPage-main-layout">
            <div className="w-full flex">
              <StockTable
                onRowClick={(symbol: string) => navigate(`/stock/${symbol}`)}
                watchlistSymbols={apiKey ? watchlistSymbols : undefined}
                onToggleWatchlist={apiKey ? handleToggleWatchlist : undefined}
                pendingSymbol={apiKey ? pending : undefined}
              />
            </div>
            <Sidebar />
          </div>
        </div>
      </div>
    </FilterDataProvider>
  );
}

export default IndividualScreenPage;