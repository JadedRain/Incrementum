import { useEffect, useState } from 'react';

type Row = Record<string, unknown>;

export function useFearGreed(url = '/fear-greed/csv/') {
    const [value, setValue] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const ac = new AbortController();
        let mounted = true;

        async function fetchData() {
            setLoading(true);
            setError(null);
            const res = await fetch(url, { signal: ac.signal });
            if (!res.ok) throw new Error(`status ${res.status}`);
            const data: Row[] = await res.json();
            let v: number | null = null;
            if (Array.isArray(data) && data.length > 0) {
                const first = data[0];
                for (const k of Object.keys(first)) {
                    const val = first[k];
                    if (typeof val === 'number') {
                        v = val;
                        break;
                    }
                    if (typeof val === 'string') {
                        const parsed = Number(String(val).replace(/[^0-9.-]/g, ''));
                        if (!Number.isNaN(parsed)) {
                            v = parsed;
                            break;
                        }
                        const parsedJson = JSON.parse(val);
                        if (parsedJson && typeof parsedJson === 'object') {
                            const obj = parsedJson as Record<string, unknown>;
                            for (const kk of Object.keys(obj)) {
                                const vv = obj[kk];
                                if (typeof vv === 'number') {
                                    v = vv;
                                    break;
                                }
                                if (typeof vv === 'string') {
                                    const parsedChild = Number(String(vv).replace(/[^0-9.-]/g, ''));
                                    if (!Number.isNaN(parsedChild)) {
                                        v = parsedChild;
                                        break;
                                    }
                                }
                            }
                            if (v !== null) break;
                        }
                    }
                    if (typeof val === 'object' && val !== null) {
                        const obj = val as Record<string, unknown>;
                        for (const kk of Object.keys(obj)) {
                            const vv = obj[kk];
                            if (typeof vv === 'number') {
                                v = vv;
                                break;
                            }
                            if (typeof vv === 'string') {
                                const parsedChild = Number(String(vv).replace(/[^0-9.-]/g, ''));
                                if (!Number.isNaN(parsedChild)) {
                                    v = parsedChild;
                                    break;
                                }
                            }
                        }
                        if (v !== null) break;
                    }
                }
            }

            if (mounted) {
                if (v !== null) {
                    const rounded = Math.round(Number(v));
                    setValue(Math.max(0, Math.min(100, rounded)));
                } else {
                    setValue(null);
                }
                setLoading(false);
            }
        }

        void fetchData();
        return () => {
            mounted = false;
            ac.abort();
        };
    }, [url]);

    return { value, loading, error } as const;
}
