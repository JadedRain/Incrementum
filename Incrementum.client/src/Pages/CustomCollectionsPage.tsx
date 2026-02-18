import '../styles/Collections/CustomCollectionsPage.css';
import React, { useState, useEffect } from 'react';
import NavigationBar from '../Components/NavigationBar';
import { CreateCollectionButton } from '../Components/CreateCollectionButton';
import { useCustomCollections } from '../hooks/useCustomCollections';
import { useAuth } from '../Context/AuthContext';
import { CollectionCard } from '../Components/CollectionCard';
import { apiString, fetchWrapper } from "../Context/FetchingHelper";
import Loading from '../Components/Loading';


const CustomCollectionsPage: React.FC = () => {
    const { collections, setCollections, loading } = useCustomCollections();
    const [showConfirm, setShowConfirm] = useState<{ id: number | null, visible: boolean }>({ id: null, visible: false });
    const auth = useAuth();
    const [removing, setRemoving] = useState(false);
    
    useEffect(() => {
        const handleStorageChange = () => {
            const stored = localStorage.getItem('customCollections');
            if (stored) {
                try {
                    const parsed = JSON.parse(stored);
                    setCollections(parsed);
                } catch (err) {
                    console.error('Failed to parse collections from localStorage', err);
                }
            }
        };
        
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, [setCollections]);

    if (loading) return <Loading loading={true} />;
    // debug: show state in console
    console.debug('CustomCollectionsPage: loading=', loading, 'collections=', collections);

    const displayCollections = collections.length === 0
        ? [
            { id: 1, name: 'Demo Collection', description: 'This is a demo collection. Click to view.', date_created: '2025-11-06' }
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

        type CustomCollection = {
            id: number;
            name?: string;
            collection_name?: string;
        };
        const typedTarget = target as unknown as CustomCollection;
        const collectionName = typedTarget.name ?? typedTarget.collection_name ?? null;
        // If authenticated, attempt server-side delete
        const apiKey = auth?.apiKey;
        setRemoving(true);
        try {
            if (apiKey && collectionName) {
                const res = await fetchWrapper(()=>fetch(apiString('/custom-collection/'), {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': apiKey,
                    },
                    body: JSON.stringify({ collection: collectionName }),
                }));
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
        <div className="collections-page">
            <NavigationBar />
            <div className="ScreenerPage-container">
                <h1 className="ScreenerPage-h1 collections-page-title">My Custom Collections</h1>
                <div className="ScreenerPage-card-grid">
                    <CreateCollectionButton />
                    {displayCollections.length > 0 ? (
                        displayCollections.map(collection => (
                            <CollectionCard key={collection.id} collection={collection} onRemove={handleRemove} />
                        ))
                    ) : (
                        <div className="no-collections-text">No collections to show.</div>
                    )}
                </div>
            </div>

            {showConfirm.visible && (
                <div className="modal-overlay">
                    <div className="modal-backdrop" />
                    <div className="modal-card">
                        <p>Are you sure you want to remove this collection?</p>
                        <div className="modal-actions">
                            <button className="btn-danger" onClick={confirmRemove} disabled={removing}>{removing ? 'Removing...' : 'Yes, Remove'}</button>
                            <button className="btn-cancel" onClick={cancelRemove} disabled={removing}>Cancel</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomCollectionsPage;

