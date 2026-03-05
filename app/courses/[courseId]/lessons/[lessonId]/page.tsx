'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { authApi, CourseProgressResponse, LessonContent, Lesson } from '../../../../api/authApi';
import { ProtectedRoute } from '../../../../components/RouteGuard';
import Navbar from '../../../../components/Navbar';
import Footer from '../../../../components/Footer';
import LessonSidebar from '../../../../components/LessonSidebar';
import { usePrivateFile } from '../../../../hooks/usePrivateFile';

function LessonPlayerContent() {
    const params = useParams();
    const router = useRouter();
    const courseId = params.courseId as string;
    const initialLessonId = params.lessonId as string;

    const [courseData, setCourseData] = useState<CourseProgressResponse | null>(null);
    const [currentLesson, setCurrentLesson] = useState<LessonContent | null>(null);
    const [playbackToken, setPlaybackToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isContentLoading, setIsContentLoading] = useState(true);
    const [error, setError] = useState('');

    // PDF secure fetch
    const { url: pdfBlobUrl, loading: isPdfFetching } = usePrivateFile(
        currentLesson?.type === 'PDF' ? (currentLesson.pdfFileId || currentLesson.pdfAccessUrl?.split('/').pop()) : null
    );

    // Flattened lessons for navigation
    const allLessons = useMemo(() => {
        if (!courseData) return [];
        return courseData.sections.flatMap(s => s.lessons);
    }, [courseData]);

    const currentIndex = useMemo(() => {
        if (!currentLesson) return -1;
        return allLessons.findIndex(l => l.id === currentLesson.id);
    }, [allLessons, currentLesson]);

    const prevLesson = allLessons[currentIndex - 1];
    const nextLesson = allLessons[currentIndex + 1];

    // Fetch course structure & progress
    const fetchCourseData = useCallback(async () => {
        try {
            const data = await authApi.getCourseLessons(courseId);
            setCourseData(data);
            return data;
        } catch (err: any) {
            setError(err.message || 'Failed to load course details');
            return null;
        }
    }, [courseId]);

    // Fetch specific lesson content
    const fetchLessonContent = useCallback(async (lessonId: string, currentLessonsMeta?: Lesson[]) => {
        setIsContentLoading(true);
        setPlaybackToken(null);
        try {
            const lessonsToScan = currentLessonsMeta || allLessons;
            const meta = lessonsToScan.find(l => l.id === lessonId);

            let token: string | undefined = undefined;

            // Step A: Only needed for YOUTUBE types
            if (meta?.type === 'YOUTUBE' && !meta.isFreePreview) {
                const res = await authApi.getPlaybackToken(courseId, lessonId);
                token = res.playbackToken;
                setPlaybackToken(token);
            }

            // Step B: Fetch the Lesson Video/PDF with the token (if acquired)
            const content = await authApi.getLessonContent(courseId, lessonId, token);
            setCurrentLesson(content);
        } catch (err: any) {
            setError(err.message || 'Failed to load lesson content');
        } finally {
            setIsContentLoading(false);
        }
    }, [courseId, allLessons]);

    // Handle "current" lesson redirect or initial load
    useEffect(() => {
        const init = async () => {
            const data = await fetchCourseData();
            if (!data) return;

            let targetId = initialLessonId;
            const flatLessons = data.sections.flatMap(s => s.lessons);

            if (targetId === 'current') {
                const firstIncomplete = flatLessons.find(l => !l.completed);
                targetId = firstIncomplete?.id || flatLessons[0].id;
                router.replace(`/courses/${courseId}/lessons/${targetId}`);
                return;
            }

            // Need to explicitly pass flatLessons here because allLessons state might not be updated yet
            await fetchLessonContent(targetId, flatLessons);
            setIsLoading(false);
        };
        init();
    }, [courseId, initialLessonId, fetchCourseData, fetchLessonContent, router]);

    const handleLessonSwitch = (id: string) => {
        router.push(`/courses/${courseId}/lessons/${id}`);
    };

    const markComplete = async () => {
        if (!currentLesson || currentLesson.completed) return;
        try {
            await authApi.markLessonComplete(currentLesson.id);
            // Refresh course data to update sidebar progress
            await fetchCourseData();
            // Update local state for immediate feedback
            setCurrentLesson(prev => prev ? { ...prev, completed: true } : null);
        } catch (err: any) {
            console.error('Failed to mark complete:', err);
        }
    };

    if (isLoading || !courseData) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col overflow-hidden">
            <Navbar />

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-6">
                <nav className="flex items-center text-sm text-gray-500">
                    <Link href="/my-learning" className="hover:text-blue-600 transition-colors">My Learning</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium truncate max-w-[200px]">{courseData.course.title}</span>
                    <span className="mx-2">/</span>
                    <span className="text-blue-600 font-semibold truncate max-w-[200px]">{currentLesson?.title || 'Loading...'}</span>
                </nav>
            </div>

            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-4 lg:py-6 gap-6">
                {/* Main Content Area (65%) */}
                <div className="flex-1 overflow-y-auto bg-gray-900 flex flex-col rounded-3xl overflow-hidden shadow-sm border border-gray-200/20">
                    {/* Player Container */}
                    <div className="relative aspect-video bg-black w-full shadow-2xl">
                        {isContentLoading ? (
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-white/30" />
                            </div>
                        ) : currentLesson?.type === 'YOUTUBE' ? (
                            <iframe
                                src={`https://www.youtube.com/embed/${currentLesson.videoId}`}
                                className="absolute inset-0 w-full h-full"
                                allow="autoplay; encrypted-media"
                                allowFullScreen
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                                <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                <p className="text-xl font-medium mb-6 text-center">This lesson is a PDF Document</p>
                                <a
                                    href={pdfBlobUrl || currentLesson?.pdfAccessUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold transition-colors shadow-lg ${(isPdfFetching || !pdfBlobUrl) ? 'opacity-50 pointer-events-none' : ''}`}
                                >
                                    {isPdfFetching ? 'Loading PDF...' : 'View PDF in New Tab'}
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Lesson Info & Controls */}
                    <div className="flex-1 bg-white p-8 lg:p-12">
                        <div className="max-w-4xl mx-auto">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                                <div>
                                    <p className="text-xs font-bold text-blue-600 tracking-widest uppercase mb-1">
                                        Lesson {currentIndex + 1} of {allLessons.length}
                                    </p>
                                    <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 leading-tight">
                                        {currentLesson?.title}
                                    </h1>
                                </div>

                                <button
                                    onClick={markComplete}
                                    disabled={currentLesson?.completed}
                                    className={`px-8 py-4 rounded-xl font-bold transition-all shadow-md active:scale-95 ${currentLesson?.completed
                                        ? 'bg-green-100 text-green-700 cursor-default'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                        }`}
                                >
                                    <span className="flex items-center justify-center">
                                        {currentLesson?.completed && (
                                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                                        )}
                                        {currentLesson?.completed ? 'Completed' : 'Mark as Complete'}
                                    </span>
                                </button>
                            </div>

                            <div className="h-px bg-gray-100 mb-10" />

                            {/* Navigation Buttons */}
                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => handleLessonSwitch(prevLesson.id)}
                                    disabled={!prevLesson}
                                    className="flex flex-col items-start p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Previous</span>
                                    <span className="text-sm font-bold text-gray-700 truncate w-full group-hover:text-blue-600">
                                        {prevLesson ? prevLesson.title : 'No previous lesson'}
                                    </span>
                                </button>

                                <button
                                    onClick={() => handleLessonSwitch(nextLesson.id)}
                                    disabled={!nextLesson}
                                    className="flex flex-col items-end p-4 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors group text-right disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Next</span>
                                    <span className="text-sm font-bold text-gray-700 truncate w-full group-hover:text-blue-600">
                                        {nextLesson ? nextLesson.title : 'Course Complete!'}
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar (35%) */}
                <div className="w-full lg:w-[400px] h-[500px] lg:h-[calc(100vh-160px)] rounded-3xl overflow-hidden shadow-sm border border-gray-200">
                    <LessonSidebar
                        courseTitle={courseData.course.title}
                        instructorName={courseData.course.instructorName}
                        percent={courseData.percent}
                        totalLessons={courseData.totalLessons}
                        completedLessons={courseData.completedLessons}
                        sections={courseData.sections}
                        currentLessonId={currentLesson?.id || ''}
                        onLessonClick={handleLessonSwitch}
                    />
                </div>
            </div>
            <Footer />
        </div >
    );
}

export default function LessonPlayer() {
    return (
        <ProtectedRoute>
            <LessonPlayerContent />
        </ProtectedRoute>
    );
}
