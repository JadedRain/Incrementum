import React, { useState, useEffect } from 'react';
import Toast from '../Components/Toast';
import { registerFetchErrorHandler } from './toastBridge';

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [message, setMessage] = useState<string | null>(null);

    useEffect(() => {
        return registerFetchErrorHandler((msg: string) => {
            setMessage(msg);
            setTimeout(() => setMessage(null), 3000);
        });
    }, []);

    return (
        <>
            {children}
            <Toast message={message} onClose={() => setMessage(null)} />
        </>
    );
}
