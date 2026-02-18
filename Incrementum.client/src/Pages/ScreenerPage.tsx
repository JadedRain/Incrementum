import '../App.css';
import '../styles/NavBar.css'
import { useNavigate, Link } from 'react-router-dom'
import { useCustomScreeners } from '../hooks/useCustomScreeners';
import { useAuth } from '../Context/AuthContext';
import NavigationBar from '../Components/NavigationBar';
import AppCard from '../Components/AppCard';
import Loading from '../Components/Loading';
import FearGreedGauge from '../Components/FearGreedGauge';
import { DatabaseScreenerProvider, useDatabaseScreenerContext } from '../Context/DatabaseScreenerContext';
import Sidebar from '../Components/Sidebar';
import StockTable from '../Components/StockTable';

function ScreenerPage() {
    const navigate = useNavigate();
    const { apiKey } = useAuth();
    const { customScreeners, loading } = useCustomScreeners(apiKey || undefined);

        // The inner component renders the screener (filters + stocks) using context
        function ScreenerMain() {
            const { stocks, isLoading } = useDatabaseScreenerContext();
            const displayStocks = Array.isArray(stocks) ? stocks : [];
            return (
                <div className="ScreenerPage-container pt-4">
                    <div className="screener-layout" style={{ display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                        <div style={{ flex: 1 }}>
                            {isLoading ? (
                                <div className="w-full flex items-center justify-center" style={{ height: '120px' }}>
                                    <Loading loading={true} loadingText="Loading stocks..." />
                                </div>
                            ) : (
                                <StockTable stocks={displayStocks} onRowClick={(sym: string) => navigate(`/stock/${sym}`)} />
                            )}
                        </div>
                        <aside style={{ width: 300, display: 'flex', justifyContent: 'center' }}>
                            <div className="FearGreedBox">
                                <Sidebar />
                            </div>
                        </aside>
                    </div>
                </div>
            );
        }

    const handleCardClick = (id: number | string) => {
        navigate(`/screener/${encodeURIComponent(id)}`);
    };

    return (
        <div className="page-shell">
            <NavigationBar />
            <div className="main-content">
                <Link to="/account" className="navbar-link">Account</Link>
                <div className="ScreenerPage-container pt-4">
                    <div className="screener-layout">
                        <div className="screener-layout-main">
                            <div className="ScreenerPage-card-grid">

                                {loading && (
                                <div className="loading-placeholder">
                                        <Loading loading={true} loadingText="Loading screeners..." />
                                    </div>
                                )}

                                {!loading && (
                                    <>
                                        <AppCard
                                            title="Day Gainers"
                                            subtitle="Stocks with the highest percentage gains today"
                                            onClick={() => navigate('/screener/day_gainers')}
                                        />

                                        <AppCard
                                            title="Day Losers"
                                            subtitle="Stocks with the largest percentage losses today"
                                            onClick={() => navigate('/screener/day_losers')}
                                        />

                                        <AppCard
                                            title="Most Actives"
                                            subtitle="Stocks with the highest trading volume today"
                                            onClick={() => navigate('/screener/most_actives')}
                                        />

                                        <AppCard
                                            title="undervalued growth stocks"
                                            subtitle="Stocks with the highest trading volume today"
                                            onClick={() => navigate('/screener/undervalued_growth_stocks')}
                                        />

                                        <AppCard
                                            title="Blank Screener"
                                            subtitle="All stocks - no filters applied"
                                            onClick={() => navigate('/screener/custom_temp')}
                                        />

                                        {apiKey && (
                                            <AppCard
                                                title="Create Custom"
                                                subtitle="Make new custom screener"
                                                onClick={() => navigate('/create-custom-screener')}
                                            />
                                        )}

                                                        {apiKey && customScreeners.map((screener) => (
                                                            <AppCard
                                                                key={screener.id}
                                                                title={screener.screener_name}
                                                                subtitle="Custom screener"
                                                                onClick={() => handleCardClick(screener.id)}
                                                            />
                                                        ))}
                                    </>
                                )}
                            </div>
                        </div>
                        <aside className="screener-layout-aside">
                            <div className="FearGreedBox">
                                <FearGreedGauge />
                            </div>
                        </aside>
                    </div>
                </div>
                                {/* Screener main rendered below so users can see stocks on one page */}
                                <DatabaseScreenerProvider>
                                  <ScreenerMain />
                                </DatabaseScreenerProvider>
            </div>
        </div>
    );
}
export default ScreenerPage;