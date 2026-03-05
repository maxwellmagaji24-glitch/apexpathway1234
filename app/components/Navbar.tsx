'use client';

import Link from 'next/link';
import { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { authApi, Cart, BASE_URL, UPLOAD_URL } from '../api/authApi';

type ViewMode = 'student' | 'instructor';

function NavbarContent() {
    const { user, isAuthenticated, isLoading, isInstructor, logout } = useUser();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [viewMode, setViewMode] = useState<ViewMode>('student');
    const [cartCount, setCartCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSwitchingView, setIsSwitchingView] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    const router = useRouter();
    const searchParams = useSearchParams();

    // Search logic
    const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
    const isSearchablePage = ['/dashboard', '/my-learning'].includes(pathname);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);

        // Update URL query parameter
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set('q', value);
        } else {
            params.delete('q');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    // Effect to sync search state when URL changes (e.g. back button or direct navigation)
    useEffect(() => {
        setSearchQuery(searchParams.get('q') || '');
    }, [searchParams]);

    const navLinkClass = (path: string) =>
        pathname === path
            ? "text-blue-600 font-semibold transition-colors"
            : "text-gray-700 hover:text-gray-900 font-normal transition-colors";

    // Load saved view mode & cart count
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem('viewMode') as ViewMode | null;
            if (saved === 'instructor' && isInstructor) {
                setViewMode('instructor');
            }
        }

        // Fetch cart count if authenticated
        if (isAuthenticated && !isInstructor) {
            authApi.getCart().then(data => {
                if (data && data.items) {
                    setCartCount(data.items.length);
                }
            }).catch(console.error);
        }
    }, [isInstructor, isAuthenticated]);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleViewMode = () => {
        const next = viewMode === 'student' ? 'instructor' : 'student';
        setViewMode(next);
        localStorage.setItem('viewMode', next);
        setIsSwitchingView(true);

        // Instant switching
        if (next === 'instructor') {
            router.push('/instructorsdashboard');
        } else {
            router.push('/dashboard');
        }
        setIsMobileMenuOpen(false);
    };

    const initials = user?.fullName
        ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '??';

    const closeDropdown = () => setIsDropdownOpen(false);

    // Instructor status helpers
    const isPending = user?.instructorStatus === 'PENDING';
    const isRejected = user?.instructorStatus === 'REJECTED';
    const isNone = user?.instructorStatus === 'NONE';
    const canApply = isNone || isRejected; // Can show Apply to Instruct

    // Effect to clear loader when pathname changes
    useEffect(() => {
        setIsSwitchingView(false);
    }, [pathname]);

    // Don't render while loading to prevent flash
    if (isLoading) return null;

    return (
        <>
            {isSwitchingView && (
                <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm transition-all duration-300">
                    <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-6"></div>
                    <p className="text-xl font-bold text-gray-900 tracking-tight animate-pulse">
                        Switching to {viewMode === 'instructor' ? 'Instructor' : 'Student'} View...
                    </p>
                </div>
            )}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Left: Logo + Desktop Links */}
                        <div className="flex items-center space-x-4 md:space-x-8">
                            <Link href="/" className="flex-shrink-0">
                                <div className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center cursor-pointer">
                                    <img src="/Apex Pathway 1.png" alt="Apex Pathway Logo" className="w-full h-full object-contain" />
                                </div>
                            </Link>

                            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">


                                {/* Instructor-view-specific links */}
                                {isAuthenticated && isInstructor && viewMode === 'instructor' && (
                                    <>
                                        <Link href="/instructorsdashboard" className={navLinkClass('/instructorsdashboard')}>
                                            Instructor Dashboard
                                        </Link>
                                        <Link href="/analytics" className={navLinkClass('/analytics')}>
                                            Analytics
                                        </Link>
                                    </>
                                )}

                                {/* Student-view links when logged in */}
                                {isAuthenticated && (viewMode === 'student' || !isInstructor) && (
                                    <>
                                        <Link href="/dashboard" className={navLinkClass('/dashboard')}>
                                            Explore Courses
                                        </Link>
                                        <Link href="/my-learning" className={navLinkClass('/my-learning')}>
                                            My Learning
                                        </Link>
                                    </>
                                )}
                            </nav>
                        </div>

                        {/* Search Bar - Desktop */}
                        {isSearchablePage && (
                            <div className="hidden lg:flex flex-1 max-w-md mx-8">
                                <div className="relative w-full group">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Search your courses..."
                                        className="block w-full pl-11 pr-4 py-2.5 bg-white border border-gray-100 rounded-2xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Right side - Desktop */}
                        <div className="hidden md:flex items-center space-x-4 lg:space-x-6">

                            {/* ─── Logged Out ─── */}
                            {!isAuthenticated && (
                                <>
                                    <Link href="/apply-instructor" className={pathname === '/apply-instructor' ? 'text-blue-700 font-semibold transition-colors' : 'text-blue-600 hover:text-blue-700 font-normal transition-colors'}>Become a Tutor</Link>

                                    {/* Cart */}
                                    <Link href="/login" className="text-gray-600 hover:text-gray-900">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                    </Link>

                                    <Link href="/login">
                                        <button className="px-8 py-2.5 rounded-full font-medium transition-colors hover:bg-blue-50 relative text-blue-600"
                                            style={{ border: '2.4px solid transparent', background: 'linear-gradient(white, white) padding-box, linear-gradient(180deg, #3B7EFF 5.36%, #013CAC 55.33%, #2863D2 120.49%) border-box' }}>
                                            Log In
                                        </button>
                                    </Link>

                                    <Link href="/signup">
                                        <button className="px-8 py-2.5 rounded-full font-medium transition-colors text-white relative"
                                            style={{ border: '4.8px solid transparent', background: 'linear-gradient(180deg, #0144C5 0%, #002977 100%) padding-box, linear-gradient(180deg, #3B7EFF 5.36%, #013CAC 55.33%, #2863D2 120.49%) border-box' }}>
                                            Sign Up
                                        </button>
                                    </Link>
                                </>
                            )}

                            {/* ─── Logged In ─── */}
                            {isAuthenticated && (
                                <>
                                    {/* Apply to Instruct link — only for students who CAN apply */}
                                    {canApply && (viewMode === 'student' || !isInstructor) && (
                                        <Link href="/apply-instructor" className="text-blue-600 hover:text-blue-700 font-normal text-sm">
                                            Apply to Instruct
                                        </Link>
                                    )}

                                    {/* Pending badge instead of Apply link */}
                                    {isPending && (
                                        <Link href="/apply-instructor" className="text-amber-600 hover:text-amber-700 font-normal text-sm flex items-center gap-1.5">
                                            <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                                            Application Pending
                                        </Link>
                                    )}

                                    {/* Instructor: Switch View toggle */}
                                    {isInstructor && (
                                        <button
                                            onClick={toggleViewMode}
                                            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border"
                                            style={{
                                                background: viewMode === 'instructor'
                                                    ? 'linear-gradient(180deg, #0144C5 0%, #002977 100%)'
                                                    : '#f3f4f6',
                                                color: viewMode === 'instructor' ? '#fff' : '#374151',
                                                borderColor: viewMode === 'instructor' ? 'transparent' : '#d1d5db',
                                            }}
                                        >
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                            </svg>
                                            {viewMode === 'instructor' ? 'Student View' : 'Instructor View'}
                                        </button>
                                    )}

                                    {/* Cart */}
                                    <Link href="/cart" className="relative text-gray-600 hover:text-gray-900 transition-colors">
                                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                        </svg>
                                        {cartCount > 0 && (
                                            <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white shadow-sm">
                                                {cartCount}
                                            </span>
                                        )}
                                    </Link>

                                    {/* User Avatar Dropdown */}
                                    <div className="relative" ref={dropdownRef}>
                                        <button
                                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                            className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold cursor-pointer hover:bg-gray-800 transition-colors overflow-hidden"
                                        >
                                            {user?.avatarId ? (
                                                <img
                                                    src={`${UPLOAD_URL}/public/${user.avatarId}`}
                                                    alt={user.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <span className="text-sm">{initials}</span>
                                            )}
                                        </button>

                                        {isDropdownOpen && (
                                            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                                                {/* User Info */}
                                                <div className="px-4 py-3 border-b border-gray-200">
                                                    <div className="flex items-center space-x-3">
                                                        <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden">
                                                            {user?.avatarId ? (
                                                                <img
                                                                    src={`${UPLOAD_URL}/public/${user.avatarId}`}
                                                                    alt={user.fullName}
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            ) : (
                                                                initials
                                                            )}
                                                        </div>
                                                        <div className="min-w-0">
                                                            <p className="text-sm font-semibold text-gray-900 truncate">{user?.fullName}</p>
                                                            <p className="text-xs text-gray-600 truncate">{user?.email}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {isInstructor && (
                                                    <Link href="/wallet" onClick={closeDropdown} className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                        <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                                        </svg>
                                                        Wallet
                                                    </Link>
                                                )}

                                                <Link href="/settings" onClick={closeDropdown} className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                    <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    Settings
                                                </Link>

                                                <Link href="/dashboard/orders" onClick={closeDropdown} className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                                                    <svg className="w-5 h-5 mr-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                                                    </svg>
                                                    Order History
                                                </Link>

                                                {/* Logout */}
                                                <div className="border-t border-gray-200 mt-2">
                                                    <button
                                                        onClick={logout}
                                                        className="w-full text-left flex items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-100 transition-colors"
                                                    >
                                                        <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                        </svg>
                                                        Log Out
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Mobile Menu Button - Right side on mobile */}
                        <div className="md:hidden flex items-center space-x-4">
                            {isAuthenticated && (
                                <Link href="/cart" className="relative text-gray-600">
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    {cartCount > 0 && (
                                        <span className="absolute -top-1.5 -right-2 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                                            {cartCount}
                                        </span>
                                    )}
                                </Link>
                            )}
                            <button
                                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                                className="text-gray-600 hover:text-gray-900 focus:outline-none"
                            >
                                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {isMobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Sidebar */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-100 py-4 px-6 space-y-4 shadow-xl">
                        <nav className="flex flex-col space-y-4">
                            {/* Status/Toggle in Mobile Menu */}
                            {isSearchablePage && (
                                <div className="relative w-full group mb-2">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                        <svg className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </span>
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={handleSearch}
                                        placeholder="Search your courses..."
                                        className="block w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-blue-50 transition-all"
                                    />
                                </div>
                            )}

                            {isAuthenticated && isInstructor && (
                                <button
                                    onClick={toggleViewMode}
                                    className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-bold border transition-all"
                                    style={{
                                        background: viewMode === 'instructor' ? 'linear-gradient(180deg, #0144C5 0%, #002977 100%)' : '#f3f4f6',
                                        color: viewMode === 'instructor' ? '#fff' : '#374151',
                                        borderColor: viewMode === 'instructor' ? 'transparent' : '#d1d5db',
                                    }}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                                    </svg>
                                    Switch to {viewMode === 'instructor' ? 'Student View' : 'Instructor View'}
                                </button>
                            )}

                            {/* Navigation Links */}
                            {isAuthenticated ? (
                                <>
                                    {viewMode === 'instructor' ? (
                                        <>
                                            <Link href="/instructorsdashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Dashboard</Link>
                                            <Link href="/analytics" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Analytics</Link>
                                            <Link href="/wallet" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Wallet</Link>
                                        </>
                                    ) : (
                                        <>
                                            <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Explore Courses</Link>
                                            <Link href="/my-learning" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">My Learning</Link>
                                            <Link href="/dashboard/orders" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Order History</Link>
                                        </>
                                    )}
                                    <Link href="/settings" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2">Settings</Link>
                                    <button onClick={logout} className="text-red-600 font-bold py-2 text-left">Log Out</button>
                                </>
                            ) : (
                                <>
                                    <Link href="/apply-instructor" onClick={() => setIsMobileMenuOpen(false)} className="text-blue-600 font-bold py-2">Become a Tutor</Link>
                                    <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="text-gray-700 font-medium py-2 border-t pt-4">Log In</Link>
                                    <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="bg-blue-600 text-white text-center py-3 rounded-xl font-bold mt-2">Sign Up</Link>
                                </>
                            )}
                        </nav>
                    </div>
                )}
            </header>
        </>
    );
}

export default function Navbar() {
    return (
        <Suspense fallback={<div className="h-20 bg-white border-b border-gray-200 sticky top-0 z-50 w-full" />}>
            <NavbarContent />
        </Suspense>
    );
}
