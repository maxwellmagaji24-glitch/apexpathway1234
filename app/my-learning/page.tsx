'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { authApi, EnrolledCourse, BASE_URL, UPLOAD_URL } from '../api/authApi';
import { ProtectedRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressBar from '../components/ProgressBar';

function MyLearningContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const searchQuery = searchParams.get('q') || "";

    const [courses, setCourses] = useState<EnrolledCourse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await authApi.getMyCourses();
                setCourses(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load your courses');
            } finally {
                setIsLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
                    <div className="animate-pulse">
                        <div className="h-10 bg-gray-200 rounded w-48 mb-8"></div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white rounded-xl h-80 shadow-sm border border-gray-100"></div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            <main className="flex-1 max-w-7xl w-full mx-auto px-6 lg:px-8 py-12">
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <span className="text-gray-900 font-medium">My Learning</span>
                </nav>

                <div className="mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning</h1>
                    <p className="text-gray-600">You have {courses.length} course{courses.length !== 1 ? 's' : ''} in your library</p>
                </div>

                {error ? (
                    <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
                        {error}
                    </div>
                ) : courses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-10 h-10 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18 18.247 18.477 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">You haven't enrolled in any courses yet</h3>
                        <p className="text-gray-600 mb-8 max-w-md mx-auto">Start your learning journey today by exploring our wide range of expert-led courses.</p>
                        <Link href="/dashboard">
                            <button className="px-8 py-3 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
                                Browse Courses
                            </button>
                        </Link>
                    </div>
                ) : filteredCourses.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <h3 className="text-xl font-bold text-gray-900 mb-1">No matches found</h3>
                        <p className="text-gray-500 mb-6">We couldn't find any courses in your library matching "{searchQuery}"</p>
                        <button
                            onClick={() => router.push('/my-learning')}
                            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors"
                        >
                            Clear search
                        </button>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCourses.map((course) => {
                            const { percent } = course.progress;
                            const buttonText = percent === 0 ? 'START →' : percent === 100 ? 'REVIEW →' : 'CONTINUE →';

                            return (
                                <div key={course.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden group hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                                    {/* Thumbnail */}
                                    <div className="relative h-48 overflow-hidden bg-gray-100">
                                        <img
                                            src={course.thumbnailUrl ? `${UPLOAD_URL}/public/${course.thumbnailUrl}` : '/course-placeholder.png'}
                                            alt={course.title}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg transform scale-0 group-hover:scale-100 transition-transform duration-300">
                                                <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-6">
                                        <h3 className="text-lg font-bold text-gray-900 mb-1 line-clamp-2 min-h-[3.5rem]">
                                            {course.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mb-6 font-medium">by {course.instructorName}</p>

                                        <div className="space-y-4">
                                            <ProgressBar percent={percent} size="sm" />

                                            <div className="flex items-center justify-between">
                                                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">
                                                    {course.progress.completedLessons} of {course.progress.totalLessons} lessons
                                                </span>

                                                <Link href={`/courses/${course.id}/lessons/current`}>
                                                    <button className={`text-sm font-bold transition-colors ${percent === 100 ? 'text-green-600 hover:text-green-700' : 'text-blue-600 hover:text-blue-700'
                                                        }`}>
                                                        {buttonText}
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function MyLearning() {
    return (
        <ProtectedRoute>
            <Suspense fallback={
                <div className="min-h-screen bg-gray-50 flex flex-col">
                    <div className="h-20 bg-white border-b border-gray-200 w-full" />
                    <div className="flex-1 flex justify-center items-center">
                        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                    </div>
                </div>
            }>
                <MyLearningContent />
            </Suspense>
        </ProtectedRoute>
    );
}
