import React from 'react';

import NavigationBar from '../Components/NavigationBar';
import { CreateCollectionButton } from '../Components/CreateCollectionButton';
import { useCustomCollections } from '../hooks/useCustomCollections';
import { CollectionCard } from '../Components/CollectionCard';


const CustomCollectionsPage: React.FC = () => {
    const { collections, setCollections, loading } = useCustomCollections();
    const [showConfirm, setShowConfirm] = useState<{ id: number | null, visible: boolean }>({ id: null, visible: false });

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
        // Remove from state and localStorage using hook
        const updatedCollections = collections.filter((c) => c.id !== showConfirm.id);
        setCollections(updatedCollections);
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
                <CreateCollectionButton />
                    {displayCollections.map(collection => (
                      <CollectionCard key={collection.id} collection={collection} onRemove={handleRemove} />
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
function useState<T>(arg0: { id: null; visible: boolean; }): [any, any] {
    throw new Error('Function not implemented.');
}

