import '../App.css'
import { useNavigate } from 'react-router-dom'
import NavigationBar from '../Components/NavigationBar';

function ScreenerPage() {
    const navigate = useNavigate();

    const handleCardClick = (name: string) => {
        navigate(`/screener/${encodeURIComponent(name)}`);
    };

    return (
        <div className="min-h-screen bg-[hsl(40,62%,26%)]">
            <NavigationBar />
            <div className="main-content">

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
        </div>
    );
}

export default ScreenerPage