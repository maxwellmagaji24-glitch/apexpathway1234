'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { authApi, Order } from '../../api/authApi';
import { ProtectedRoute } from '../../components/RouteGuard';
import Navbar from '../../components/Navbar';

function OrdersContent() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const data = await authApi.getOrders();
                setOrders(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load order history');
            } finally {
                setIsLoading(false);
            }
        };
        fetchOrders();
    }, []);

    const formatDate = (dateString: string) => {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(new Date(dateString));
    };

    const StatusBadge = ({ status }: { status: Order['status'] }) => {
        switch (status) {
            case 'PAID':
                return <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold tracking-wide">PAID</span>;
            case 'PENDING':
                return <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-bold tracking-wide">PENDING</span>;
            case 'FAILED':
            case 'CANCELLED':
                return <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold tracking-wide">{status}</span>;
            default:
                return <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-bold tracking-wide">{status}</span>;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Order History</span>
                </nav>

                <div className="flex items-center gap-3 mb-8">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h1 className="text-3xl font-extrabold text-gray-900">Order History</h1>
                </div>

                {isLoading ? (
                    <div className="flex justify-center flex-col items-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p className="text-gray-500">Loading your receipts...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 text-red-600 p-6 rounded-2xl border border-red-100 text-center">
                        <p>{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 font-semibold">
                            Try Again
                        </button>
                    </div>
                ) : orders.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No orders found</h2>
                        <p className="text-gray-500 mb-8 max-w-sm mx-auto">You haven't purchased any courses yet.</p>
                        <Link href="/#courses" className="inline-block px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            Explore Courses
                        </Link>
                    </div>
                ) : (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Order Reference</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Items</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Total Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {orders.map((order) => (
                                        <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                            <td className="px-6 py-5 align-top">
                                                <div className="font-mono text-sm text-gray-900 font-medium">#{order.paymentReference || order.id.slice(0, 8).toUpperCase()}</div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="text-sm text-gray-600">{formatDate(order.createdAt)}</div>
                                            </td>
                                            <td className="px-6 py-5 align-top max-w-xs">
                                                <div className="space-y-3">
                                                    {order.items.map(item => (
                                                        <div key={item.id} className="flex flex-col">
                                                            <span className="text-sm font-semibold text-gray-900 truncate" title={item.courseTitle}>
                                                                {item.courseTitle || 'Unknown Course'}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {order.currency} {((item.priceKobo || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <div className="font-bold text-gray-900">
                                                    {order.currency} {((order.totalKobo || 0) / 100).toLocaleString('en-NG', { minimumFractionDigits: 2 })}
                                                </div>
                                            </td>
                                            <td className="px-6 py-5 align-top">
                                                <StatusBadge status={order.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function OrdersPage() {
    return (
        <ProtectedRoute>
            <OrdersContent />
        </ProtectedRoute>
    );
}
