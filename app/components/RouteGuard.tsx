'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';

function LoadingSpinner() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                <p className="text-gray-500 text-sm">Loading...</p>
            </div>
        </div>
    );
}

/**
 * Wraps pages that should ONLY be accessible to logged-out users.
 * If user is authenticated AND verified, redirect to /dashboard.
 * If user is authenticated but NOT verified, redirect to /verify-email.
 */
export function GuestRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading && isAuthenticated) {
            if (user && !user.emailVerified) {
                router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
            } else {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || isAuthenticated) {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}

/**
 * Wraps pages that require authentication AND a verified email.
 * - If not authenticated → /login
 * - If authenticated but email not verified → /verify-email
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user && !user.emailVerified) {
                router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
            }
        }
    }, [isLoading, isAuthenticated, user, router]);

    if (isLoading || !isAuthenticated || (user && !user.emailVerified)) {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}

/**
 * Wraps instructor-only pages (e.g. Wallet, Instructor Dashboard).
 * Checks authentication, email verification, AND instructorStatus === 'APPROVED'.
 */
export function InstructorRoute({ children }: { children: React.ReactNode }) {
    const { user, isAuthenticated, isLoading, isInstructor } = useUser();
    const router = useRouter();

    useEffect(() => {
        if (!isLoading) {
            if (!isAuthenticated) {
                router.push('/login');
            } else if (user && !user.emailVerified) {
                router.push(`/verify-email?email=${encodeURIComponent(user.email)}`);
            } else if (!isInstructor) {
                router.push('/dashboard');
            }
        }
    }, [isLoading, isAuthenticated, isInstructor, user, router]);

    if (isLoading || !isAuthenticated || !isInstructor || (user && !user.emailVerified)) {
        return <LoadingSpinner />;
    }

    return <>{children}</>;
}
