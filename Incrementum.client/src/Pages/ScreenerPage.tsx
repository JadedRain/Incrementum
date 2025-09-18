import '../App.css'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../Components/SearchBar';

function ScreenerPage() {
    const navigate = useNavigate();

    const handleCardClick = (name: string) => {
        navigate(`/screener/${encodeURIComponent(name)}`);
    };

    return (
        <div className="min-h-screen bg-gray-600">
            <div className='StocksPage-header'>
                <SearchBar />
                <h1 className="ScreenerPage-h1">
                    Screener Page
                </h1>
                <div className="w-20 mr-8 bg-gray-600"></div>
            </div>
            <div className="ScreenerPage-container">
                <div className="ScreenerPage-card-grid">
                    <div className="ScreenerPage-card cursor-pointer" onClick={() => handleCardClick('Temp Card 1')}>Temp Card 1</div>
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