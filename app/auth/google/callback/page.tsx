'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../../api/authApi';
import { useUser } from '../../../context/UserContext';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { login } = useUser();
    const [error, setError] = useState('');

    useEffect(() => {
        const code = searchParams.get('code');

        if (!code) {
            setError('No authorization code received from Google.');
            setTimeout(() => router.push('/login'), 3000);
            return;
        }

        const exchangeCode = async () => {
            try {
                const res = await authApi.exchangeGoogleCode({
                    code,
                    redirectUri: window.location.origin + '/auth/google/callback',
                });
                await login(res.accessToken, res.refreshToken);
                router.push('/dashboard');
            } catch (err: any) {
                setError(err.message || 'Google authentication failed. Please try again.');
                setTimeout(() => router.push('/login'), 3000);
            }
        };

        exchangeCode();
    }, [searchParams, login, router]);

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
            <div className="text-center">
                {error ? (
                    <>
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <p className="text-red-600 font-medium mb-2">{error}</p>
                        <p className="text-gray-500 text-sm">Redirecting to login...</p>
                    </>
                ) : (
                    <>
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-gray-700 font-medium">Signing in with Google...</p>
                        <p className="text-gray-500 text-sm mt-1">Please wait while we verify your account.</p>
                    </>
                )}
            </div>
        </div>
    );
}

export default function GoogleCallback() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            </div>
        }>
            <GoogleCallbackContent />
        </Suspense>
    );
}
