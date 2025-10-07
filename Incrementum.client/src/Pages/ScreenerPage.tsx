import '../App.css';
import { useNavigate, Link } from 'react-router-dom'
import { useCustomScreeners } from '../hooks/useCustomScreeners';
import type { CustomScreener } from '../hooks/useCustomScreeners';
import { useAuth } from '../Context/AuthContext';
import NavigationBar from '../Components/NavigationBar';
import AppCard from '../Components/AppCard';
import Loading from '../Components/Loading';

function ScreenerPage() {
    const navigate = useNavigate();
    const { apiKey } = useAuth();
    const { customScreeners, loading } = useCustomScreeners(apiKey);

    const handleCardClick = (id: number | string) => {
        navigate(`/screener/${encodeURIComponent(id)}`);
    };

    const handleCustomScreenerClick = (screener: CustomScreener) => {
        navigate(`/screener/${encodeURIComponent(screener.id)}`);
    };

    return (
        <div className="min-h-screen bg-[hsl(40,62%,26%)]">
            <NavigationBar />
            <div className="main-content">
                <Link to="/account" className="navbar-link">Account</Link>
                <div className="ScreenerPage-container">
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
                                onClick={handleCustomScreenerClick}
                            />
                        )}

                        {!loading && customScreeners.length >= 1 && apiKey && (
                            <>
                                <AppCard
                                    title="Temp Card 1"
                                    subtitle="Description"
                                    onClick={handleCardClick}
                                />
                                <AppCard
                                    title="Create Custom"
                                    subtitle="Make new custom screener"
                                    onClick={handleCustomScreenerClick}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default ScreenerPage;