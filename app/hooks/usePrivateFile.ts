'use client';

import { useState, useEffect } from 'react';
import { BASE_URL, UPLOAD_URL } from '../api/authApi';

/**
 * Hook to fetch a private file as a Blob and create a temporary object URL.
 * Required because private files need the Authorization header which standard <img> and <a> tags don't support.
 */
export function usePrivateFile(fileId: string | null | undefined) {
    const [url, setUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!fileId) {
            setUrl(null);
            setError(null);
            return;
        }

        let isMounted = true;
        const fetchPrivateFile = async () => {
            setLoading(true);
            setError(null);
            const token = localStorage.getItem('accessToken');

            try {
                const res = await fetch(`${UPLOAD_URL}/private/${fileId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (!res.ok) {
                    if (res.status === 403) throw new Error('You do not have permission to access this file.');
                    if (res.status === 404) throw new Error('File not found.');
                    throw new Error('Failed to load private file.');
                }

                const blob = await res.blob();
                if (isMounted) {
                    const objectUrl = URL.createObjectURL(blob);
                    setUrl(objectUrl);
                }
            } catch (err: any) {
                if (isMounted) {
                    console.error("Private file fetch error:", err);
                    setError(err.message);
                }
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        fetchPrivateFile();

        // Cleanup the temporary URL when component unmounts or fileId changes
        return () => {
            isMounted = false;
            if (url) URL.revokeObjectURL(url);
        };
    }, [fileId]);

    return { url, loading, error };
}
