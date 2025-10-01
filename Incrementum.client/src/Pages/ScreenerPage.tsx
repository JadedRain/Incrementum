import '../App.css'
import { useNavigate, Link } from 'react-router-dom'
import SearchBar from '../Components/SearchBar';

function ScreenerPage() {
    const navigate = useNavigate();

    const handleCardClick = (name: string) => {
        navigate(`/screener/${encodeURIComponent(name)}`);
    };

    return (
        <div className="min-h-screen bg-[hsl(40,62%,26%)]">
            <div className='StocksPage-header relative'>
                <Link to="/account" className="absolute top-4 right-4 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition">Account</Link>
                <SearchBar />
                <h1 className="ScreenerPage-h1">
                    Screener Page
                </h1>
            </div>
            <div className="ScreenerPage-container">
                <div className="ScreenerPage-card-grid">
                    <div className="ScreenerPage-card cursor-pointer" onClick={() => handleCardClick('Temp Card 2')}>Temp Card 2</div>
                    <div className="ScreenerPage-card cursor-pointer" onClick={() => handleCardClick('Temp Card 3')}>Temp Card 3</div>
                    <div className="ScreenerPage-card-custom cursor-pointer" onClick={() => handleCardClick('Create Custom')}>Create Custom</div>
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
    );
}

export default ScreenerPage