import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import NavigationBar from '../Components/NavigationBar';

interface CustomCollection {
    id: number;
    name: string;
    description?: string;
}


const CustomCollectionsPage: React.FC = () => {
    const [collections, setCollections] = useState<CustomCollection[]>([]);
    const [loading, setLoading] = useState(true);
    const [showConfirm, setShowConfirm] = useState<{ id: number | null, visible: boolean }>({ id: null, visible: false });
    const navigate = useNavigate();

    useEffect(() => {
        // Read from localStorage (simulate API)
        const stored = localStorage.getItem('customCollections');
        if (stored) {
            setCollections(JSON.parse(stored));
        } else {
            setCollections([]);
        }
        setLoading(false);
    }, []);

    if (loading) return <div style={{ textAlign: 'center', margin: '2rem' }}>Loading...</div>;

    const displayCollections = collections.length === 0
        ? [
            { id: 1, name: 'Demo Collection', description: 'This is a demo collection. Click to view.' }
        ]
        : collections;

    const handleRemove = (id: number) => {
        setShowConfirm({ id, visible: true });
    };
    const confirmRemove = () => {
    // Remove from state
    const updatedCollections = collections.filter((c: CustomCollection) => c.id !== showConfirm.id);
    setCollections(updatedCollections);
    // Remove from localStorage
    localStorage.setItem('customCollections', JSON.stringify(updatedCollections));
    setShowConfirm({ id: null, visible: false });
    };
    const cancelRemove = () => setShowConfirm({ id: null, visible: false });

    return (
        <div className="min-h-screen bg-[hsl(40,62%,26%)]">
            <div className="StocksPage-header relative" >
                <h1 className="ScreenerPage-h1 ">My Custom Collections</h1>
                <NavigationBar />
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div
                    className="ScreenerPage-card-custom cursor-pointer"
                    onClick={() => navigate('/create-custom-collection')}
                    tabIndex={0}
                    role="button"
                >
                    <span style={{ fontSize: 32, marginBottom: 8 }}>＋</span>
                    <span>Create New Collection</span>
                </div>
                {displayCollections.map((collection: CustomCollection) => (
                    <div
                        key={collection.id}
                        className="ScreenerPage-card cursor-pointer h-48 flex flex-col justify-center items-center text-center space-y-2 group relative"
                        onClick={() => navigate(`/custom-collection/${collection.id}`)}
                        onKeyDown={(e: React.KeyboardEvent<HTMLDivElement>) => { if (e.key === 'Enter' || e.key === ' ') navigate(`/custom-collection/${collection.id}`); }}
                        tabIndex={0}
                        role="button"
                    >
                        <button
                            className="xbutton"
                            style={{ pointerEvents: 'auto' }}
                            onClick={(e: React.MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleRemove(collection.id); }}
                            tabIndex={-1}
                            aria-label="Remove collection"
                        >
                            &times;
                        </button>
                        <h2 className="text-lg font-bold leading-relaxed m-0">{collection.name}</h2>
                        <p className="text-gray-700 leading-relaxed mb-2">{collection.description || 'No description.'}</p>
                    </div>
                ))}
            </div>

            {showConfirm.visible && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0"
                        style={{ background: 'hsla(40, 62%, 26%, 0.53)' }} />
                    <div className="relative bg-[hsl(42,15%,70%)] rounded-lg shadow-lg p-8 flex flex-col items-center z-10">
                        <p className="mb-4 text-lg">Are you sure you want to remove this collection?</p>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer" onClick={confirmRemove}>Yes, Remove</button>
                            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded cursor-pointer" onClick={cancelRemove}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCollectionsPage;
