'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../../api/authApi';
import { ProtectedRoute } from '../../components/RouteGuard';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

function PaymentCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');

    const [status, setStatus] = useState<'PROCESSING' | 'SUCCESS' | 'FAILED'>('PROCESSING');
    const [attempts, setAttempts] = useState(0);

    useEffect(() => {
        if (!reference) {
            setStatus('FAILED');
            return;
        }

        const verifyPayment = async () => {
            try {
                // To safely confirm payment, we fetch the user's latest orders natively
                // and check if the order matching this reference was pushed to `PAID` by the webhook
                const orders = await authApi.getOrders();

                // Safely find the order comparing string references since the webhook marks it matching
                const matchingOrder = orders.find(o => o.paymentReference === reference);

                if (matchingOrder && matchingOrder.status === 'PAID') {
                    setStatus('SUCCESS');
                } else if (attempts < 5) {
                    // Webhook might be trailing behind by a few seconds. Retry a few times.
                    setTimeout(() => setAttempts(a => a + 1), 2500);
                } else {
                    // Assuming failed or pending manually verification
                    setStatus('FAILED');
                }
            } catch (error) {
                if (attempts < 5) {
                    setTimeout(() => setAttempts(a => a + 1), 2500);
                } else {
                    setStatus('FAILED');
                }
            }
        };

        verifyPayment();
    }, [reference, attempts]);

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 flex items-center justify-center p-6">
                <div className="bg-white max-w-md w-full rounded-3xl shadow-sm border border-gray-100 p-10 text-center">

                    {status === 'PROCESSING' && (
                        <div className="animate-fade-in">
                            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-6"></div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Verifying Payment...</h2>
                            <p className="text-gray-500 font-medium">Please wait a moment while we securely confirm your transaction with Paystack.</p>
                        </div>
                    )}

                    {status === 'SUCCESS' && (
                        <div className="animate-fade-in">
                            <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Payment Successful!</h2>
                            <p className="text-gray-600 leading-relaxed mb-8">
                                Your order was completed successfully, and your account has been granted full access.
                            </p>
                            <Link href="/my-learning" className="block w-full py-4 px-6 bg-blue-600 text-white rounded-xl font-bold tracking-wide hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                Go to My Courses
                            </Link>
                        </div>
                    )}

                    {status === 'FAILED' && (
                        <div className="animate-fade-in">
                            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Payment Failed or Pending</h2>
                            <p className="text-gray-500 font-medium mb-8">
                                We couldn't instantly verify your payment. If your account was debited, it may take a few minutes to reflect.
                            </p>
                            <div className="flex flex-col gap-3">
                                <Link href="/dashboard/orders" className="block w-full py-4 px-6 bg-gray-900 text-white rounded-xl font-bold tracking-wide hover:bg-black transition-all">
                                    View Order History
                                </Link>
                                <Link href="/cart" className="block w-full py-4 px-6 bg-white text-gray-700 border-2 border-gray-200 rounded-xl font-bold tracking-wide hover:border-gray-300 transition-all">
                                    Return to Cart
                                </Link>
                            </div>
                        </div>
                    )}

                </div>
            </main>
        </div>
    );
}

export default function PaymentCallbackPage() {
    return (
        <ProtectedRoute>
            <PaymentCallbackContent />
        </ProtectedRoute>
    );
}
