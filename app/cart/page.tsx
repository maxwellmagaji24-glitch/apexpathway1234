'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useUser } from '../context/UserContext';
import { ProtectedRoute } from '../components/RouteGuard';
import { authApi, Cart, CartItem, BASE_URL, UPLOAD_URL } from '../api/authApi';

function CartContent() {
    const router = useRouter();
    const { isAuthenticated, isInstructor } = useUser();

    const [cart, setCart] = useState<Cart | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRemoving, setIsRemoving] = useState<string | null>(null);
    const [isClearing, setIsClearing] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadCart = async () => {
            try {
                const data = await authApi.getCart();
                setCart(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load cart');
            } finally {
                setIsLoading(false);
            }
        };
        loadCart();
    }, []);

    const handleRemoveItem = async (courseId: string) => {
        setIsRemoving(courseId);
        try {
            const updatedCart = await authApi.removeFromCart(courseId);
            setCart(updatedCart);
        } catch (err: any) {
            alert(err.message || 'Failed to remove item');
        } finally {
            setIsRemoving(null);
        }
    };

    const handleClearCart = async () => {
        if (!window.confirm('Are you sure you want to empty your cart?')) return;
        setIsClearing(true);
        try {
            await authApi.clearCart();
            setCart(null);
        } catch (err: any) {
            alert(err.message || 'Failed to clear cart');
        } finally {
            setIsClearing(false);
        }
    };

    const handleCheckout = async () => {
        if (!cart || cart.items.length === 0) return;
        setIsCheckingOut(true);
        try {
            // Step 3: Bundle cart into an Order
            const order = await authApi.checkoutCart();

            // Step 4: Initialize Paystack Payment with that Order ID
            const payment = await authApi.initializePayment(order.id);

            if (payment.authorizationUrl) {
                // Step 5: Redirect browser to Paystack's hosted checkout
                window.location.assign(payment.authorizationUrl);
            }
        } catch (err: any) {
            alert(err.message || 'Checkout failed. Please ensure your email is verified.');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const formatPrice = (kobo: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
        }).format((kobo || 0) / 100);
    };

    // Instructor safety check: instructors use the same app but don't typically buy courses
    // They can view it, but maybe warn them

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-12">
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Cart</span>
                </nav>

                <div className="flex flex-col sm:flex-row items-baseline justify-between gap-2 mb-8 border-b border-gray-100 pb-6 text-center sm:text-left">
                    <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">Shopping Cart</h1>
                    {cart && cart.items.length > 0 && (
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-xs">{cart.items.length} Course{cart.items.length === 1 ? '' : 's'} in Cart</span>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex justify-center flex-col items-center py-20">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
                        <p className="text-gray-500">Loading your cart...</p>
                    </div>
                ) : error ? (
                    <div className="bg-red-50 p-6 rounded-2xl border border-red-100 text-center">
                        <p className="text-red-700 font-medium">{error}</p>
                        <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg font-bold hover:bg-red-200 transition-colors">
                            Try Again
                        </button>
                    </div>
                ) : !cart || cart.items.length === 0 ? (
                    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-16 text-center">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-3">Your cart is empty</h2>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">Looks like you haven&apos;t added any courses to your cart yet. Browse our top-tier courses to get started.</p>
                        <Link href="/dashboard" className="inline-flex items-center justify-center px-8 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                            Explore Courses
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col lg:flex-row gap-12">
                        {/* Cart Items List */}
                        <div className="flex-1 space-y-6">
                            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                                <div className="divide-y divide-gray-100">
                                    {cart.items.map((item: CartItem) => {
                                        return (
                                            <div key={item.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6 group hover:bg-gray-50 transition-colors">
                                                {/* Thumbnail (or placeholder) */}
                                                <div className="w-full sm:w-32 aspect-video bg-gray-900 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                                                    {(item as any).thumbnailUrl || (item as any).thumbnailId ? (
                                                        <img
                                                            src={`${UPLOAD_URL}/public/${(item as any).thumbnailUrl || (item as any).thumbnailId}`}
                                                            alt={item.title}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    ) : (
                                                        <div className="text-white/20">
                                                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                            </svg>
                                                        </div>
                                                    )}
                                                    {/* Dim overlay on hover */}
                                                    <div className="absolute inset-0 bg-black/opacity-0 group-hover:bg-black/10 transition-colors"></div>
                                                </div>

                                                {/* Details */}
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/courses/${item.courseId}`} className="hover:underline">
                                                        <h3 className="font-bold text-lg text-gray-900 truncate mb-1">{item.title}</h3>
                                                    </Link>
                                                    {item.instructorName && (
                                                        <p className="text-sm text-gray-600 mb-2">By {item.instructorName}</p>
                                                    )}
                                                </div>

                                                {/* Price & Actions */}
                                                <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto mt-4 sm:mt-0 gap-4 pt-4 sm:pt-0 border-t sm:border-0 border-gray-50">
                                                    <div className="font-black text-xl text-blue-600 px-4 py-2 bg-blue-50 rounded-2xl">
                                                        {formatPrice(item.priceKobo)}
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemoveItem(item.courseId)}
                                                        disabled={isRemoving === item.courseId}
                                                        className="text-sm font-semibold text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                                                    >
                                                        {isRemoving === item.courseId ? (
                                                            <span>Processing...</span>
                                                        ) : (
                                                            <>
                                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                                                Remove
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <div className="p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
                                    <button
                                        onClick={handleClearCart}
                                        disabled={isClearing}
                                        className="text-sm font-bold text-gray-500 hover:text-red-600 transition-colors uppercase tracking-wider"
                                    >
                                        {isClearing ? 'Clearing...' : 'Empty Cart'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Sidebar */}
                        <div className="w-full lg:w-[400px]">
                            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-28">
                                <h3 className="text-lg font-bold text-gray-900 mb-6 pb-4 border-b border-gray-100">Order Summary</h3>

                                <div className="space-y-4 mb-6">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span className="font-semibold text-gray-900">{formatPrice(cart.totalKobo)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Discount</span>
                                        <span className="font-semibold text-green-600">₦0.00</span>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-gray-100 mb-8">
                                    <div className="flex justify-between items-end">
                                        <span className="text-gray-900 font-bold">Total</span>
                                        <div className="text-right">
                                            <span className="block text-3xl font-black text-gray-900">{formatPrice(cart.totalKobo)}</span>
                                            <span className="text-xs text-gray-500 uppercase tracking-widest font-medium">Pricing in NGN</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={handleCheckout}
                                    disabled={isCheckingOut || isClearing || !!isRemoving}
                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isCheckingOut ? 'Processing...' : 'Proceed to Payment'}
                                    <svg className="w-5 h-5 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </button>

                                <p className="text-center text-xs text-gray-400 mt-6 font-medium">
                                    Payments are securely processed by Paystack.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function CartPage() {
    return (
        <ProtectedRoute>
            <CartContent />
        </ProtectedRoute>
    );
}
