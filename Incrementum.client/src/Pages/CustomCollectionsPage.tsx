import '../styles/Collections/CustomCollectionsPage.css';
import React, { useState } from 'react';
import NavigationBar from '../Components/NavigationBar';
import { CreateCollectionButton } from '../Components/CreateCollectionButton';
import { useCustomCollections } from '../hooks/useCustomCollections';
import { useAuth } from '../Context/AuthContext';
import { CollectionCard } from '../Components/CollectionCard';


const CustomCollectionsPage: React.FC = () => {
    const { collections, setCollections, loading } = useCustomCollections();
    const [showConfirm, setShowConfirm] = useState<{ id: number | null, visible: boolean }>({ id: null, visible: false });
    const auth = useAuth();
    const [removing, setRemoving] = useState(false);

    if (loading) return <div style={{ textAlign: 'center', margin: '2rem' }}>Loading...</div>;
    // debug: show state in console
    // eslint-disable-next-line no-console
    console.debug('CustomCollectionsPage: loading=', loading, 'collections=', collections);

    const displayCollections = collections.length === 0
        ? [
            { id: 1, name: 'Demo Collection', description: 'This is a demo collection. Click to view.' }
        ]
        : collections;

    const handleRemove = (id: number) => {
        setShowConfirm({ id, visible: true });
    };

    const confirmRemove = async () => {
        const target = collections.find((c) => c.id === showConfirm.id);
        // If we don't have the collection locally, just remove by id
        if (!target) {
            setCollections(collections.filter((c) => c.id !== showConfirm.id));
            setShowConfirm({ id: null, visible: false });
            return;
        }

        const collectionName = (target as any).name || (target as any).collection_name || null;
        // If authenticated, attempt server-side delete
        const apiKey = auth?.apiKey;
        setRemoving(true);
        try {
            if (apiKey && collectionName) {
                const res = await fetch('/custom-collection/', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': apiKey,
                    },
                    body: JSON.stringify({ collection: collectionName }),
                });
                if (!res.ok) {
                    // If server deletion failed, fall back to local removal but surface a console warning
                    console.warn('Server delete failed', res.status, await res.text());
                }
            }
        } catch (err) {
            console.warn('Error deleting collection on server, falling back to local removal', err);
        }

        // In all cases, remove locally so UI updates immediately
        const updatedCollections = collections.filter((c) => c.id !== showConfirm.id);
        setCollections(updatedCollections);
        setShowConfirm({ id: null, visible: false });
        setRemoving(false);
    };
    const cancelRemove = () => setShowConfirm({ id: null, visible: false });

    return (
        <div className="min-h-screen bg-[hsl(40,13%,53%)]">
            <div className="ScreenerPage-header">
                <h1 className="ScreenerPage-h1">My Custom Collections</h1>
                <NavigationBar />
            </div>
            <div className="ScreenerPage-container">
                <div className="ScreenerPage-card-grid" style={{ paddingLeft: '2.5rem' }}>
                    <CreateCollectionButton />
                    {displayCollections.length > 0 ? (
                        displayCollections.map(collection => (
                            <CollectionCard key={collection.id} collection={collection} onRemove={handleRemove} />
                        ))
                    ) : (
                        <div style={{ padding: 24, color: '#222' }}>No collections to show.</div>
                    )}
                </div>
            </div>

            {showConfirm.visible && (
                <div className="fixed inset-0 flex items-center justify-center z-50">
                    <div className="absolute inset-0"
                        style={{ background: 'hsla(40, 62%, 26%, 0.53)' }} />
                    <div className="relative bg-[hsl(42,15%,70%)] rounded-lg shadow-lg p-8 flex flex-col items-center z-10">
                        <p className="mb-4 text-lg">Are you sure you want to remove this collection?</p>
                        <div className="flex gap-4">
                            <button className="px-4 py-2 bg-red-500 text-white rounded cursor-pointer" onClick={confirmRemove} disabled={removing}>{removing ? 'Removing...' : 'Yes, Remove'}</button>
                            <button className="px-4 py-2 bg-gray-300 text-gray-800 rounded cursor-pointer" onClick={cancelRemove} disabled={removing}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCollectionsPage;

