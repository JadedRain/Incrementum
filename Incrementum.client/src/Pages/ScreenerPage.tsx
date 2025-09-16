import '../App.css'
import { useNavigate } from 'react-router-dom'
import SearchBar from '../searchBar';

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
            <div className="pt-32 px-8 flex flex-row justify-start items-start gap-8 mr-[360px]">
                <div className="ScreenerPage-card-grid">
                    <div className="ScreenerPage-card cursor-pointer" onClick={() => handleCardClick('Temp Card 1')}>Temp Card 1</div>
                    <div className="ScreenerPage-card cursor-pointer" onClick={() => handleCardClick('Temp Card 2')}>Temp Card 2</div>
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