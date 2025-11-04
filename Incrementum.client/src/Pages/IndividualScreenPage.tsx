import '../styles/SideBar.css'
import { useEffect, useState } from 'react';
import { useQuery } from "@tanstack/react-query"
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../Context/AuthContext';
import Sidebar from '../Components/Sidebar'
import NavigationBar from '../Components/NavigationBar'
import StockTable from '../Components/StockTable'
import { fetchCustomScreener } from "../Query/apiScreener"
import { useScreener } from '../hooks/useScreener';
import { useScreenerDefaults } from '../hooks/useScreenerDefaults';
import type { CustomScreener } from '../Types/ScreenerTypes';

function IndividualScreenPage() {
  const navigate = useNavigate();
  const { apiKey } = useAuth();
  const [loading, setLoading] = useState(true);

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
      useEffect(()=>{ console.log(data) }, [data]);
  }
  else {
    const data = null;
    const error = null;
  }

  return (
    <div className="min-h-screen bg-[hsl(40,13%,53%)]">
      <NavigationBar />
      <div className="main-content">
        <div className="pt-32 px-8 ScreenerPage-main-layout">
          <div className="w-full flex">
            <StockTable onRowClick={(symbol: string) => navigate(`/stock/${symbol}`)} />
          </div>
          <Sidebar />
        </div>
      </div>
    </div>
  );
}

export default IndividualScreenPage;