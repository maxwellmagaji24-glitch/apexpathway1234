'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/authApi';
import { InstructorRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

function CourseEditorContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [title, setTitle] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!title.trim()) {
            setError("Please provide a course title to begin.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const createdCourse = await authApi.createCourse({ title });
            // The backend returns the new course, we redirect to the full editor/curriculum
            router.push(`/courseeditor/${createdCourse.id}`);
        } catch (err: any) {
            setError(err.message || "Failed to create draft.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <Navbar />

            <main className="flex-1 max-w-2xl mx-auto w-full px-6 lg:px-8 py-20">
                <nav className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-12 gap-2">
                    <Link href="/instructorsdashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                    <span className="text-gray-200">/</span>
                    <span className="text-gray-900">New Course</span>
                </nav>

                <div className="mb-12">
                    <p className="text-blue-600 font-black text-xs uppercase tracking-widest mb-3">Quick Start</p>
                    <h1 className="text-5xl font-black text-gray-900 mb-6 leading-[1.1] tracking-tight">LET'S START WITH A TITLE.</h1>
                    <p className="text-gray-500 font-medium text-lg leading-relaxed">
                        Don't worry about the details yet. You can change your title, add a thumbnail, and build your curriculum in the next step.
                    </p>
                </div>

                {error && (
                    <div className="mb-8 p-5 bg-red-50 text-red-600 rounded-2xl border border-red-100 font-bold text-sm flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-10">
                    <div className="group relative">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 group-focus-within:text-blue-600 transition-colors">What will you call your course?</label>
                        <input
                            autoFocus
                            type="text"
                            placeholder="e.g. Mastering Advanced Thermodynamics"
                            value={title}
                            onChange={e => setTitle(e.target.value)}
                            className="w-full px-0 py-6 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-3xl font-black bg-transparent text-gray-900 placeholder-gray-200 transition-all"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-6 pt-6">
                        <button
                            type="submit"
                            disabled={isLoading || !title.trim()}
                            className="w-full sm:w-auto px-12 py-5 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-gray-200 disabled:opacity-20 active:scale-95 text-sm"
                        >
                            {isLoading ? 'Creating Draft...' : 'Create Course & Continue'}
                        </button>
                        <Link href="/instructorsdashboard" className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-gray-900 transition-colors">
                            Cancel
                        </Link>
                    </div>
                </form>

                <div className="mt-20 pt-20 border-t border-gray-50 grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div>
                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Save as you go</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">The system automatically saves your progress as a <b>DRAFT</b>. You only go live when you're ready.</p>
                    </div>
                    <div>
                        <h4 className="text-[10px] font-black text-gray-900 uppercase tracking-widest mb-3">Need Help?</h4>
                        <p className="text-sm text-gray-500 leading-relaxed">Browse our <span className="text-blue-600 font-bold underline cursor-pointer">Instructor Guide</span> for tips on creating high-quality content.</p>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function CourseEditor() {
    return (
        <InstructorRoute>
            <CourseEditorContent />
        </InstructorRoute>
    );
}
