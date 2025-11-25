import type { CollectionCreatePayload, SaveResult, LocalCollection } from '../Types/collections';
import { apiString, fetchWrapper } from "../Context/FetchingHelper";

async function createLocalCollection(payload: CollectionCreatePayload): Promise<SaveResult> {
    try {
        const collections = JSON.parse(localStorage.getItem('customCollections') || '[]') as LocalCollection[];
        const id = Date.now();
        const newCollection: LocalCollection = { id, name: payload.collection, stocks: payload.symbols, c_desc: payload.desc };
        collections.push(newCollection);
        localStorage.setItem('customCollections', JSON.stringify(collections));
        return { ok: true, id };
    } catch (err: unknown) {
        return { ok: false, error: String(err) };
    }
}

export async function saveCollection(payload: CollectionCreatePayload & { apiKey?: string | null }): Promise<SaveResult> {
    const { collection, symbols, desc, apiKey } = payload;
    if (!collection || !collection.trim()) return { ok: false, error: 'Collection name required' };
    if (!symbols || symbols.length === 0) return { ok: false, error: 'At least one symbol required' };

    if (!apiKey) {
        return createLocalCollection({ collection, symbols, desc });
    }

    try {
        const res = await fetchWrapper(()=>fetch(apiString('/custom-collection/'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-Id': apiKey
            },
            body: JSON.stringify({ collection, symbols, desc })
        }));

        if (!res.ok) {
            const text = await res.text();
            try {
                const errObj = JSON.parse(text);
                return { ok: false, error: errObj.error || `Failed to create collection: ${res.status}` };
            } catch {
                return { ok: false, error: `Failed to create collection: ${res.status}` };
            }
        }

        const data = await res.json();
        const id = data?.id || Date.now();

        const collections = JSON.parse(localStorage.getItem('customCollections') || '[]') as LocalCollection[];
        const newCollection: LocalCollection = { id, name: collection, stocks: symbols, c_desc: desc };
        collections.push(newCollection);
        localStorage.setItem('customCollections', JSON.stringify(collections));

        return { ok: true, id };
    } catch (err: unknown) {
        return { ok: false, error: String(err) };
    }
}

export default { saveCollection };