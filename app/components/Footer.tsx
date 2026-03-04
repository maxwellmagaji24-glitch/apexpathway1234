'use client';

import Link from 'next/link';
import { useUser } from '../context/UserContext';

export default function Footer() {
    const { isAuthenticated } = useUser();

    // Compact footer for authenticated users
    if (isAuthenticated) {
        return (
            <footer className="bg-white border-t border-gray-100 px-4 sm:px-6 lg:px-8 py-4">
                <div className="max-w-7xl mx-auto">
                    <p className="text-gray-400 text-xs text-center">
                        © {new Date().getFullYear()} Apex Pathway. All rights reserved.
                    </p>
                </div>
            </footer>
        );
    }

    // Full footer for public/unauthenticated pages
    return (
        <footer className="bg-[#0A1E3D] text-white py-16 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                <div className="grid md:grid-cols-2 gap-12 mb-12">
                    {/* Column 1 - Logo and Description */}
                    <div>
                        <div className="flex items-center mb-6">
                            <div className="w-12 h-12 mr-3">
                                <img
                                    src="/Apex Pathway 1.png"
                                    alt="Apex Pathway Logo"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <span className="text-2xl font-black tracking-tight">Apex Pathway</span>
                        </div>
                        <p className="text-gray-300 mb-8 leading-relaxed max-w-sm">
                            Smarter learning, simplified. We connect students with top-performing peer tutors
                            to help you master your curriculum and ace every semester.
                        </p>
                    </div>

                    {/* Column 2 - Quick Links */}
                    <div className="md:ml-auto">
                        <h3 className="text-xl font-bold mb-6">Quick Links</h3>
                        <ul className="space-y-4">
                            <li>
                                <Link href="/" className="text-gray-300 hover:text-white transition-colors">Home</Link>
                            </li>
                            <li>
                                <Link href="/dashboard" className="text-gray-300 hover:text-white transition-colors">Explore Courses</Link>
                            </li>
                            <li>
                                <Link href="/apply-instructor" className="text-gray-300 hover:text-white transition-colors">Become a Tutor</Link>
                            </li>
                            <li>
                                <Link href="/#faq" className="text-gray-300 hover:text-white transition-colors">FAQs</Link>
                            </li>
                            <li>
                                <Link href="/about" className="text-gray-300 hover:text-white transition-colors">About Us</Link>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Copyright */}
                <div className="border-t border-white/10 pt-10 text-center">
                    <p className="text-gray-400 text-sm flex items-center justify-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                        © {new Date().getFullYear()} Apex Pathway. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
}
