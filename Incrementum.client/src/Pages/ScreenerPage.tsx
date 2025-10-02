import '../App.css'
import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useState } from 'react';
import { useAuth } from '../Context/AuthContext';
import NavigationBar from '../Components/NavigationBar';

interface CustomScreener {
    id: number;
    screener_name: string;
    created_at: string;
}

function ScreenerPage() {
    const navigate = useNavigate();
    const { apiKey } = useAuth();
    const [customScreeners, setCustomScreeners] = useState<CustomScreener[]>([]);
    const [loading, setLoading] = useState(false);

    const handleCardClick = (name: string) => {
        navigate(`/screener/${encodeURIComponent(name)}`);
    };

    const handleCustomScreenerClick = (screener: CustomScreener) => {
        // For now, navigate to the same individual screener page
        // In the future, this could be enhanced to handle custom screener logic differently
        navigate(`/screener/${encodeURIComponent(screener.screener_name)}`);
    };

    useEffect(() => {
        const fetchCustomScreeners = async () => {
            if (!apiKey) return;

            setLoading(true);
            try {
                const response = await fetch('http://localhost:8000/custom-screeners/', {
                    headers: {
                        'X-User-Id': apiKey,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setCustomScreeners(data.screeners || []);
                }
            } catch (error) {
                console.error('Error fetching custom screeners:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchCustomScreeners();
    }, [apiKey]);

    return (
        <div className="min-h-screen bg-[hsl(40,62%,26%)]">
            <NavigationBar />
            <div className="main-content">

                <div className="ScreenerPage-container">
                    <div className="ScreenerPage-card-grid">
                        {/* Custom Collection Card */}
                        <div className="ScreenerPage-card-custom cursor-pointer bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg flex items-center justify-center" style={{ height: '120px' }} onClick={() => navigate('/custom-collection')}>
                            Custom Collection
                        </div>
                        <div className="ScreenerPage-card cursor-pointer" onClick={() => handleCardClick('Temp Card 2')}>Create Custom</div>

                        {loading && (
                            <div className="ScreenerPage-card flex items-center justify-center" style={{ height: '120px' }}>
                                <div className="text-gray-500">Loading screeners...</div>
                            </div>
                        )}

                        {!loading && customScreeners.map((screener) => (
                            <div
                                key={screener.id}
                                className="ScreenerPage-card cursor-pointer bg-gradient-to-r from-blue-500 to-blue-600 text-white flex flex-col justify-center items-center p-4"
                                style={{ height: '120px' }}
                                onClick={() => handleCustomScreenerClick(screener)}
                            >
                                <div className="font-bold text-lg text-center mb-1">
                                    {screener.screener_name}
                                </div>
                                <div className="text-sm opacity-80">
                                    Custom Screener
                                </div>
                            </div>
                        ))}

                        {!loading && customScreeners.length === 0 && apiKey && (
                            <div className="ScreenerPage-card flex flex-col items-center justify-center text-gray-500" style={{ height: '120px' }}>
                                <div className="text-sm text-center">
                                    No custom screeners yet
                                </div>
                                <div className="text-xs text-center mt-1">
                                    Create your first one!
                                </div>
                            </div>
                        )}
                </div>
                <aside className="sidebar">
                    <nav className="sidebar-nav">
                        <a href="#" className="sidebar-links">x</a>
                        <a href="#" className="sidebar-links">y</a>
                        <a href="#" className="sidebar-links">z</a>
                        <a href="#" className="sidebar-links">v</a>
                        <a href="#" className="sidebar-links">c</a>
                    </nav>
                </aside>
            </div>
        </div>
    </div >
    );
}

export default ScreenerPage