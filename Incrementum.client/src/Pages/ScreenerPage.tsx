import '../App.css';
import '../styles/NavBar.css'
import { useNavigate, Link } from 'react-router-dom'
import { useCustomScreeners } from '../hooks/useCustomScreeners';
import { useAuth } from '../Context/AuthContext';
import NavigationBar from '../Components/NavigationBar';
import AppCard from '../Components/AppCard';
import Loading from '../Components/Loading';

function ScreenerPage() {
    const navigate = useNavigate();
    const { apiKey } = useAuth();
    const { customScreeners, loading } = useCustomScreeners(apiKey || undefined);

    const handleCardClick = (id: number | string) => {
        navigate(`/screener/${encodeURIComponent(id)}`);
    };

    return (
        <div className="min-h-screen bg-[hsl(40,13%,53%)]">
            <NavigationBar />
            <div className="main-content">
                <Link to="/account" className="navbar-link">Account</Link>
                <h1 className="text-[hsl(42,15%,70%)] text-4xl text-left ml-8 mb-0 mt-8 newsreader-font">
                    Select Screener
                </h1>
                <div className="ScreenerPage-container pt-4">
                    <div className="ScreenerPage-card-grid">

                        {loading && (
                            <div className="w-full flex items-center justify-center" style={{ height: '120px' }}>
                                <Loading loading={true} loadingText="Loading screeners..." />
                            </div>
                        )}

                        {!loading && customScreeners.length === 0 && apiKey && (
                            <AppCard
                                title="No custom screeners yet"
                                subtitle="Click to create your first one!"
                                onClick={() => navigate('/screener/create')}
                            />
                        )}

                        {!loading && customScreeners.length >= 0 && apiKey && (
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
                                    title="Temp Card 1"
                                    subtitle="Description"
                                    onClick={() => handleCardClick('temp-1')}
                                />
                                <AppCard
                                    title="Create Custom"
                                    subtitle="Make new custom screener"
                                    onClick={() => navigate('/screener/create')}
                                />
                            </>
                        )}
                    </div>
                </div>
                
                {/* Independent sidebar positioned outside container */}
                <div className="ScreenerPage-right-sidebar">
                    {/* Empty sidebar - content can be added later */}
                </div>
            </div>
        </div>
    );
}
export default ScreenerPage;