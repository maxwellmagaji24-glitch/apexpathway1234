'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authApi, PublicCourse, InstructorAddLessonPayload } from '../../api/authApi';
import { InstructorRoute } from '../../components/RouteGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

function CurriculumEditorContent() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<PublicCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Modal states
    const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
    const [newSectionTitle, setNewSectionTitle] = useState("");

    const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
    const [currentSectionId, setCurrentSectionId] = useState("");
    const [lessonForm, setLessonForm] = useState<InstructorAddLessonPayload>({
        title: "",
        type: 'YOUTUBE',
        videoId: "",
        pdfFileId: "",
        durationText: "10:00",
        isFreePreview: false
    });

    const [uploadingPdf, setUploadingPdf] = useState(false);
    const [pdfFile, setPdfFile] = useState<File | null>(null);

    const fetchCourse = useCallback(async () => {
        setIsLoading(true);
        try {
            const rawData = await authApi.getInstructorCourse(courseId as string);
            console.log("Instructor course response:", rawData);

            // Unwrap response — only if .data is an actual course object (has an id)
            let courseData: any = rawData;
            if (
                (rawData as any)?.data &&
                typeof (rawData as any).data === 'object' &&
                !Array.isArray((rawData as any).data) &&
                (rawData as any).data.id
            ) {
                courseData = (rawData as any).data;
            }

            // Ensure sections exist and each section has a lessons array
            if (courseData && Array.isArray(courseData.sections)) {
                courseData.sections = courseData.sections.map((s: any) => ({
                    ...s,
                    lessons: Array.isArray(s.lessons) ? s.lessons : []
                }));
            } else if (courseData) {
                courseData.sections = [];
            }

            setCourse(courseData);
        } catch (err: any) {
            setError(err.message || "Failed to load course details.");
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    const handleAddSection = async () => {
        if (!newSectionTitle) return;
        try {
            const newSection = await authApi.addSection(courseId as string, newSectionTitle);
            setNewSectionTitle("");
            setIsSectionModalOpen(false);

            // Optimistic update so it shows instantly
            const sectionData = (newSection as any).data || newSection;
            setCourse(prev => prev ? {
                ...prev,
                sections: [...prev.sections, { ...sectionData, lessons: sectionData.lessons || [] }]
            } : null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setPdfFile(file);
    };

    const handleAddLesson = async () => {
        if (!lessonForm.title) return;
        if (lessonForm.type === 'PDF' && !pdfFile && !lessonForm.pdfFileId) {
            alert("Please select a PDF document to upload.");
            return;
        }

        try {
            setUploadingPdf(true);
            let finalLessonForm = { ...lessonForm };

            // Upload PDF if we have a file waiting
            if (lessonForm.type === 'PDF' && pdfFile && !finalLessonForm.pdfFileId) {
                const res = await authApi.uploadFile(pdfFile, true);
                finalLessonForm.pdfFileId = res.id;
            }

            const newLesson = await authApi.addLesson(courseId as string, currentSectionId, finalLessonForm);
            setIsLessonModalOpen(false);
            setLessonForm({ title: "", type: 'YOUTUBE', videoId: "", pdfFileId: "", durationText: "10:00", isFreePreview: false });
            setPdfFile(null);

            // Optimistic update
            const lessonData = (newLesson as any).data || newLesson;
            setCourse(prev => {
                if (!prev) return prev;
                return {
                    ...prev,
                    sections: prev.sections.map(s =>
                        s.id === currentSectionId ? { ...s, lessons: [...s.lessons, lessonData] } : s
                    )
                };
            });
        } catch (err: any) {
            alert(err.message || "Failed to add lesson");
        } finally {
            setUploadingPdf(false);
        }
    };

    const handleSubmitForApproval = async () => {
        if (!course) return;
        if (course.sections.length === 0) {
            alert("Please add at least one section before submitting.");
            return;
        }
        const hasLesson = course.sections.some(s => s.lessons.length > 0);
        if (!hasLesson) {
            alert("Please add at least one lesson before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            await authApi.submitCourseForApproval(courseId as string);
            alert("Course submitted successfully! Redirecting to dashboard...");
            router.push('/instructorsdashboard');
        } catch (err: any) {
            alert(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 lg:px-8 py-12 pb-20">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <nav className="flex items-center text-xs font-black uppercase tracking-widest text-gray-400 mb-6 gap-2">
                            <Link href="/instructorsdashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-900">Curriculum Editor</span>
                        </nav>
                        <h1 className="text-4xl font-black text-gray-900 mb-2 uppercase tracking-tight">{course?.title}</h1>
                        <p className="text-gray-500 font-bold uppercase text-xs tracking-widest">Master Curriculum Builder</p>
                    </div>
                    <button
                        onClick={handleSubmitForApproval}
                        disabled={isSubmitting}
                        className="px-10 py-4 bg-green-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-green-700 transition-all shadow-xl shadow-green-100 disabled:opacity-50 active:scale-95 text-sm"
                    >
                        {isSubmitting ? 'SUBMITTING...' : 'SUBMIT FOR APPROVAL'}
                    </button>
                </div>

                {/* Sections List */}
                <div className="space-y-8">
                    {course?.sections.map((section, sidx) => (
                        <div key={section.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="bg-gray-50 px-8 py-6 border-b border-gray-100 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <span className="w-8 h-8 rounded-lg bg-gray-900 text-white flex items-center justify-center font-black text-sm">{sidx + 1}</span>
                                    <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{section.title}</h2>
                                </div>
                                <button
                                    onClick={() => {
                                        setCurrentSectionId(section.id);
                                        setIsLessonModalOpen(true);
                                    }}
                                    className="bg-white px-5 py-2 rounded-xl border-2 border-gray-100 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:border-blue-600 hover:shadow-lg transition-all"
                                >
                                    + Add Lesson
                                </button>
                            </div>

                            <div className="p-4 space-y-3">
                                {section.lessons.length > 0 ? (
                                    section.lessons.map((lesson, lidx) => (
                                        <div key={lesson.id} className="flex items-center justify-between p-4 rounded-2xl border border-gray-50 hover:border-blue-100 hover:bg-blue-50/30 transition-all group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 flex items-center justify-center text-gray-300 font-bold group-hover:text-blue-400">
                                                    {lesson.type === 'PDF' ? (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                        </svg>
                                                    ) : (
                                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900">{lesson.title}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{lesson.type} • {lesson.durationText}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {lesson.isFreePreview && <span className="bg-green-100 text-green-700 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-tighter">Preview</span>}
                                                <button className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-10 text-center text-gray-300 font-bold text-xs uppercase tracking-widest italic">
                                        No lessons in this section yet
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    <button
                        onClick={() => setIsSectionModalOpen(true)}
                        className="w-full py-6 border-2 border-dashed border-gray-200 rounded-3xl text-gray-400 font-black uppercase tracking-[5px] hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50 transition-all text-xs"
                    >
                        + Add New Section
                    </button>
                </div>

                {/* Add Section Modal */}
                {isSectionModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[32px] p-10 max-w-lg w-full shadow-2xl animate-in zoom-in duration-300">
                            <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">New Section</h3>
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-8">Group your lessons by topic</p>

                            <div className="mb-10">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Section Title</label>
                                <input
                                    autoFocus
                                    type="text"
                                    placeholder="e.g. Introduction to Web3"
                                    value={newSectionTitle}
                                    onChange={e => setNewSectionTitle(e.target.value)}
                                    className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-2xl font-black bg-transparent text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                />
                            </div>

                            <div className="flex gap-4">
                                <button
                                    onClick={() => setIsSectionModalOpen(false)}
                                    className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddSection}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
                                >
                                    Create
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Add Lesson Modal */}
                {isLessonModalOpen && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                        <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl animate-in zoom-in duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tighter">New Lesson</h3>
                            <p className="text-gray-500 font-bold uppercase text-[10px] tracking-widest mb-10">Choose content type and details</p>

                            <div className="space-y-8">
                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-3">Lesson Title</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Understanding Smart Contracts"
                                        value={lessonForm.title}
                                        onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-0 py-2 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-black bg-transparent text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={() => setLessonForm(p => ({ ...p, type: 'YOUTUBE' }))}
                                        className={`py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-xs transition-all ${lessonForm.type === 'YOUTUBE' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        YouTube Video
                                    </button>
                                    <button
                                        onClick={() => setLessonForm(p => ({ ...p, type: 'PDF' }))}
                                        className={`py-4 rounded-2xl border-2 font-black uppercase tracking-widest text-xs transition-all ${lessonForm.type === 'PDF' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-100 text-gray-400'}`}
                                    >
                                        PDF Resource
                                    </button>
                                </div>

                                {lessonForm.type === 'YOUTUBE' ? (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Video ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. dQw4w9WgXcQ"
                                            value={lessonForm.videoId}
                                            onChange={e => setLessonForm(p => ({ ...p, videoId: e.target.value }))}
                                            className="w-full px-4 py-4 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-600 font-bold text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                        />
                                        <p className="mt-2 text-[9px] font-bold text-gray-400 uppercase tracking-tighter">Enter the ID from the YouTube URL</p>
                                    </div>
                                ) : (
                                    <div>
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-3">PDF Document</label>
                                        <div className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all ${pdfFile || lessonForm.pdfFileId ? 'border-green-200 bg-green-50' : 'border-gray-100 bg-gray-50'}`}>
                                            {pdfFile || lessonForm.pdfFileId ? (
                                                <div>
                                                    <p className="text-green-600 font-black text-xs mb-2 truncate px-4">{pdfFile ? pdfFile.name : 'DOCUMENT LOADED'}</p>
                                                    <button onClick={() => { setPdfFile(null); setLessonForm(p => ({ ...p, pdfFileId: "" })); }} className="text-[10px] font-black text-red-500 uppercase">Change</button>
                                                </div>
                                            ) : (
                                                <>
                                                    <input type="file" accept=".pdf" id="pdf-upload" className="hidden" onChange={handlePdfUpload} />
                                                    <label htmlFor="pdf-upload" className={`cursor-pointer px-6 py-3 bg-white border-2 border-gray-100 rounded-xl text-[10px] font-black uppercase tracking-widest inline-block ${uploadingPdf ? 'opacity-50' : 'hover:border-blue-600'}`}>
                                                        {uploadingPdf ? 'UPLOADING...' : 'Select PDF'}
                                                    </label>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}

                                <div className="flex items-center justify-between">
                                    <div className="w-1/2">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-700 mb-2">Duration (e.g. 12:45)</label>
                                        <input
                                            type="text"
                                            value={lessonForm.durationText}
                                            onChange={e => setLessonForm(p => ({ ...p, durationText: e.target.value }))}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-600 font-bold text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                        />
                                    </div>
                                    <div className="bg-gray-50 px-6 py-4 rounded-[20px] flex items-center gap-4">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">Free Preview?</label>
                                        <button
                                            onClick={() => setLessonForm(p => ({ ...p, isFreePreview: !p.isFreePreview }))}
                                            className={`w-12 h-6 rounded-full transition-all relative ${lessonForm.isFreePreview ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${lessonForm.isFreePreview ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button
                                    onClick={() => setIsLessonModalOpen(false)}
                                    className="flex-1 py-4 border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all text-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleAddLesson}
                                    className="flex-1 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-blue-100 hover:bg-blue-700 active:scale-95 transition-all text-sm"
                                >
                                    Add Lesson
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}

export default function CurriculumEditor() {
    return (
        <InstructorRoute>
            <CurriculumEditorContent />
        </InstructorRoute>
    );
}
