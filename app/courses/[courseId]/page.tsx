'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { authApi, PublicCourse, EnrolledCourse, BASE_URL, UPLOAD_URL } from '../../api/authApi';
import { useUser } from '../../context/UserContext';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProgressBar from '../../components/ProgressBar';

export default function CourseDetailPage() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const { isAuthenticated, user, isLoading: isUserLoading } = useUser();

    const [course, setCourse] = useState<PublicCourse | null>(null);
    const [enrolledData, setEnrolledData] = useState<EnrolledCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const isEnrolled = !!enrolledData;

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            // Step 1: Load explore course data (authenticated)
            const publicData = await authApi.getExploreCourse(courseId);
            setCourse(publicData);

            // Open first section by default
            if (publicData.sections.length > 0) {
                setOpenSections({ [publicData.sections[0].id]: true });
            }

            // Step 2: If logged in, check enrollment
            if (isAuthenticated) {
                try {
                    const myCourses = await authApi.getMyCourses();
                    const match = myCourses.find(c => c.id === courseId);
                    if (match) {
                        setEnrolledData(match);
                    }
                } catch (e) {
                    console.error('Failed to check enrollment', e);
                }
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load course details');
        } finally {
            setIsLoading(false);
        }
    }, [courseId, isAuthenticated]);

    useEffect(() => {
        if (!isUserLoading) {
            fetchData();
        }
    }, [fetchData, isUserLoading]);

    const toggleSection = (id: string) => {
        setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const handleAddToCart = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/courses/${courseId}`);
            return;
        }
        setIsAddingToCart(true);
        try {
            await authApi.addToCart(courseId);
            router.push('/cart'); // Or show success toast
        } catch (err: any) {
            alert(err.message || 'Failed to add to cart');
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleBuyNow = async () => {
        if (!isAuthenticated) {
            router.push(`/login?redirect=/courses/${courseId}`);
            return;
        }
        setIsCheckingOut(true);
        try {
            await authApi.addToCart(courseId);

            // Generate single order
            const order = await authApi.checkoutCart();

            // Initialize Paystack Payment with the generated Order ID
            const payment = await authApi.initializePayment(order.id);

            if (payment.authorizationUrl) {
                window.location.assign(payment.authorizationUrl);
            }
        } catch (err: any) {
            alert(err.message || 'Failed to initialize checkout');
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

    if (isLoading || isUserLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </div>
        );
    }

    if (error || !course) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-20 text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">Error Loading Course</h1>
                    <p className="text-gray-600 mb-8">{error || 'Course not found'}</p>
                    <Link href="/dashboard" className="text-blue-600 font-medium hover:underline">
                        Back to Courses
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <div className="flex-1 w-full flex flex-col">

                {/* Banner / Header */}
                <div className="bg-gray-900 border-b border-gray-800 text-white">
                    <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 lg:py-16 relative">
                        <div className="w-full lg:w-[calc(100%-400px)] lg:pr-12">
                            {/* Course Info */}
                            <nav className="flex items-center text-sm text-gray-400 mb-6">
                                <Link href={isEnrolled ? "/my-learning" : "/dashboard"} className="hover:text-gray-200 transition-colors">
                                    {isEnrolled ? "My Learning" : "Dashboard"}
                                </Link>
                                <span className="mx-2">/</span>
                                <span className="text-gray-100 font-medium truncate">{course.title}</span>
                            </nav>

                            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight">
                                {course.title}
                            </h1>
                            <p className="text-lg md:text-xl text-gray-300 mb-8 leading-relaxed max-w-3xl">
                                {course.description}
                            </p>

                            <div className="flex flex-wrap items-center gap-6 text-sm text-gray-300">
                                <div className="flex items-center gap-2">
                                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    <span>{course.language}</span>
                                </div>

                                <div className="flex items-center gap-3 border-l pl-6 border-gray-700">
                                    <div className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center text-white font-bold text-xs uppercase overflow-hidden">
                                        {course.instructor?.avatarId ? (
                                            <img
                                                src={`${UPLOAD_URL}/public/${course.instructor.avatarId}`}
                                                alt={course.instructor.fullName}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            course.instructor?.fullName?.[0] || 'I'
                                        )}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-white">{course.instructor?.fullName || 'Instructor'}</p>
                                        {course.instructor?.instructorProfile?.department && (
                                            <p className="text-xs text-gray-400">{course.instructor.instructorProfile.department}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-10 w-full relative">
                    <div className="flex flex-col lg:flex-row gap-10 lg:gap-12 items-start">

                        {/* Right Column: CTA/Progress Card (Moved outside! Overlaps banner on desktop) */}
                        <div className="w-full lg:w-[380px] lg:-mt-[340px] z-10 order-1 lg:order-2 mb-8 lg:mb-0">
                            <div className="sticky top-24">
                                {isEnrolled ? (
                                    /* Enrolled View: Progress Widget */
                                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 sticky top-28">
                                        <div className="flex items-center justify-between mb-2">
                                            <h3 className="text-lg font-bold text-gray-900">Your Progress</h3>
                                            <span className="text-2xl font-black text-blue-600">{enrolledData.progress.percent}%</span>
                                        </div>
                                        <p className="text-sm text-gray-500 mb-6 font-medium">
                                            {enrolledData.progress.completedLessons} of {enrolledData.progress.totalLessons} lessons completed
                                        </p>

                                        <ProgressBar percent={enrolledData.progress.percent} size="lg" className="mb-8" />

                                        <Link
                                            href={`/courses/${courseId}/lessons/current`}
                                            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                                        >
                                            {enrolledData.progress.percent === 100 ? 'Review Course' : 'Continue Learning'}
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </Link>

                                        <p className="text-center text-xs text-gray-400 mt-6 font-medium uppercase tracking-widest">
                                            Lifetime Access Included
                                        </p>
                                    </div>
                                ) : (
                                    /* Marketing View: Purchase Card */
                                    <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden sticky top-28">
                                        <div className="aspect-video relative group cursor-pointer overflow-hidden bg-gray-100">
                                            {course.thumbnailId ? (
                                                <img
                                                    src={`${UPLOAD_URL}/public/${course.thumbnailId}`}
                                                    alt={course.title}
                                                    className="w-full h-full object-cover transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 opacity-20" />
                                            )}
                                        </div>

                                        <div className="p-8">
                                            <div className="flex items-baseline gap-2 mb-6 text-gray-900">
                                                <span className="text-4xl font-black">{formatPrice(course.priceKobo)}</span>
                                                {/* Could add original price here if available */}
                                            </div>

                                            <div className="space-y-4 mb-8">
                                                <button
                                                    onClick={handleAddToCart}
                                                    disabled={isAddingToCart}
                                                    className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50"
                                                >
                                                    {isAddingToCart ? 'Adding...' : 'Add to Cart'}
                                                </button>
                                                <button
                                                    onClick={handleBuyNow}
                                                    disabled={isCheckingOut}
                                                    className="w-full py-4 border-2 border-gray-900 text-gray-900 rounded-2xl font-bold hover:bg-gray-50 transition-all disabled:opacity-50"
                                                >
                                                    {isCheckingOut ? 'Processing...' : 'Buy Now'}
                                                </button>
                                            </div>

                                            <div className="space-y-3">
                                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">This course includes:</p>
                                                {[
                                                    { icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Full Video Lessons' },
                                                    { icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>, text: 'PDF Resources' },
                                                    { icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Full Lifetime Access' },
                                                    { icon: <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, text: 'Certificate of Completion' }
                                                ].map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3 text-sm text-gray-700 font-medium">
                                                        <span>{item.icon}</span>
                                                        <span>{item.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Left/Middle Column (About & Curriculum) */}
                        <div className="flex-1 w-full lg:w-[calc(100%-420px)] space-y-12 order-2 lg:order-1">
                            {/* What you'll learn */}
                            <section>
                                <div className="border border-gray-200 bg-white rounded-lg p-6 sm:p-8">
                                    <h2 className="text-2xl font-bold text-gray-900 mb-6">What you'll learn</h2>
                                    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-4">
                                        {course.whatYouWillLearn.map((item, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <svg className="w-5 h-5 text-gray-900 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                                <span className="text-gray-700 text-sm leading-relaxed">{item}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Curriculum */}
                            <section>
                                <div className="flex items-center justify-between mb-8">
                                    <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                                        <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center">
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                                        </span>
                                        Course Content
                                    </h2>
                                    <div className="text-sm font-medium text-gray-500">
                                        {course.sections.length} sections · {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} lessons
                                    </div>
                                </div>

                                <div className="border border-gray-200 rounded-3xl overflow-hidden bg-white">
                                    {course.sections.map((section, sIdx) => {
                                        const isOpen = !!openSections[section.id];
                                        return (
                                            <div key={section.id} className={sIdx !== 0 ? "border-t border-gray-100" : ""}>
                                                <button
                                                    onClick={() => toggleSection(section.id)}
                                                    className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors text-left"
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                            </svg>
                                                        </span>
                                                        <div className="min-w-0">
                                                            <h3 className="font-bold text-gray-900 truncate">{section.title}</h3>
                                                            <p className="text-xs text-gray-500 font-medium">
                                                                {section.lessons.length} lessons
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {isOpen && (
                                                    <div className="px-6 pb-6 space-y-2">
                                                        {section.lessons.map((lesson) => {
                                                            const isClickable = isEnrolled || lesson.isFreePreview;

                                                            return (
                                                                <div
                                                                    key={lesson.id}
                                                                    className={`flex items-center justify-between p-4 rounded-xl transition-all ${isClickable
                                                                        ? 'hover:bg-blue-50 cursor-pointer group'
                                                                        : 'opacity-50'
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (isClickable) {
                                                                            router.push(`/courses/${courseId}/lessons/${lesson.id}`);
                                                                        }
                                                                    }}
                                                                >
                                                                    <div className="flex items-center gap-4">
                                                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${lesson.completed
                                                                            ? 'bg-green-100 text-green-600'
                                                                            : 'bg-gray-100 text-gray-500 group-hover:bg-blue-100 group-hover:text-blue-600'
                                                                            }`}>
                                                                            {lesson.completed ? (
                                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                                                            ) : (
                                                                                <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                                                                            )}
                                                                        </div>
                                                                        <span className={`text-sm font-medium ${isClickable ? 'text-gray-900' : 'text-gray-500'}`}>
                                                                            {lesson.title}
                                                                        </span>
                                                                    </div>

                                                                    <div className="flex items-center gap-4">
                                                                        {lesson.durationText && (
                                                                            <span className="text-xs text-gray-400 font-medium">{lesson.durationText}</span>
                                                                        )}
                                                                        {!isEnrolled && lesson.isFreePreview && (
                                                                            <span className="px-2 py-0.5 bg-green-100 text-green-600 text-[10px] font-bold rounded uppercase tracking-wider">Free</span>
                                                                        )}
                                                                        {!isEnrolled && !lesson.isFreePreview && (
                                                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </section>

                            {/* Instructor */}
                            <section>
                                <h2 className="text-2xl font-bold text-gray-900 mb-8">Your Instructor</h2>
                                <div className="bg-white rounded-3xl p-8 border border-gray-200">
                                    <div className="flex items-center gap-6 mb-6">
                                        <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                                            {course.instructor?.avatarId ? (
                                                <img
                                                    src={`${UPLOAD_URL}/public/${course.instructor.avatarId}`}
                                                    alt={course.instructor.fullName}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                course.instructor?.fullName?.[0] || 'I'
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-gray-900">{course.instructor?.fullName || 'Instructor'}</h3>
                                            {course.instructor?.instructorProfile?.department && (
                                                <p className="text-blue-600 font-medium">{course.instructor.instructorProfile.department}</p>
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-gray-600 leading-relaxed">
                                        {course.instructor?.instructorProfile?.bio || `${course.instructor?.fullName || 'This instructor'} is dedicated to helping peers master complex subjects through simplified, exam-focused learning materials.`}
                                    </p>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
