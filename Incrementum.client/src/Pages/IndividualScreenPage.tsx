import { useParams, useNavigate } from 'react-router-dom';
import '../App.css';

function IndividualScreenPage() {
  const { screenerName } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-600">
      <div className="StocksPage-header">
        <button className="ml-4 px-4 py-2 rounded bg-gray-800 text-white cursor-pointer" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="ScreenerPage-h1">{screenerName}</h1>
        <div className="w-20 mr-8 bg-gray-600"></div>
      </div>
      <div className="pt-32 px-8 ScreenerPage-main-layout">
        <div className="w-full">
          <ul className="bg-white rounded-2xl shadow-md p-8 text-[#222]">
            <li className="py-2 border-b">List Item 1</li>
            <li className="py-2 border-b">List Item 2</li>
            <li className="py-2">List Item 3</li>
          </ul>
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

export default IndividualScreenPage;
