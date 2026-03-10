'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { authApi, PublicCourse, InstructorAddLessonPayload, InstructorCreateCoursePayload } from '../../api/authApi';
import { InstructorRoute } from '../../components/RouteGuard';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import Link from 'next/link';

type Tab = 'basic' | 'pricing' | 'curriculum';

function CurriculumEditorContent() {
    const { courseId } = useParams();
    const router = useRouter();
    const [course, setCourse] = useState<PublicCourse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState<Tab>('basic');

    // Basic Info & Pricing State (Derived from course)
    const [formData, setFormData] = useState<Partial<InstructorCreateCoursePayload>>({});
    const [priceNaira, setPriceNaira] = useState("");
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Curriculum Modals
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
            let courseData: any = rawData;
            if (rawData?.id) {
                courseData = rawData;
            } else if ((rawData as any)?.data?.id) {
                courseData = (rawData as any).data;
            }

            if (courseData && Array.isArray(courseData.sections)) {
                courseData.sections = courseData.sections.map((s: any) => ({
                    ...s,
                    lessons: Array.isArray(s.lessons) ? s.lessons : []
                }));
            } else if (courseData) {
                courseData.sections = [];
            }

            setCourse(courseData);

            // Sync form data
            setFormData({
                title: courseData.title,
                description: courseData.description || "",
                courseCode: courseData.courseCode || "",
                language: courseData.language || "English",
                whatYouWillLearn: courseData.whatYouWillLearn || [""],
            });
            setPriceNaira(courseData.priceKobo ? (courseData.priceKobo / 100).toString() : "0");

            if (courseData.thumbnailId) {
                setThumbnailPreviewUrl(`/uploads/public/${courseData.thumbnailId}`);
            }
        } catch (err: any) {
            setError(err.message || "Failed to load course details.");
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => {
        fetchCourse();
    }, [fetchCourse]);

    // PATCH Update Logic
    const handleAutoSave = async (payload: Partial<InstructorCreateCoursePayload>, file?: File) => {
        if (!course) return;
        setIsSaving(true);
        try {
            const updated = await authApi.updateCourse(course.id, payload, file);
            setCourse(prev => prev ? { ...prev, ...updated } : null);
        } catch (err: any) {
            console.error("Auto-save failed:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handlePriceChange = (val: string) => {
        setPriceNaira(val);
        const kobo = Math.floor(parseFloat(val || "0") * 100);
        handleAutoSave({ priceKobo: kobo });
    };

    const handleLearnChange = (index: number, val: string) => {
        const newList = [...(formData.whatYouWillLearn || [""])];
        newList[index] = val;
        setFormData(p => ({ ...p, whatYouWillLearn: newList }));
    };

    const removeLearnItem = (index: number) => {
        const newList = (formData.whatYouWillLearn || [""]).filter((_, i) => i !== index);
        setFormData(p => ({ ...p, whatYouWillLearn: newList.length > 0 ? newList : [""] }));
        handleAutoSave({ whatYouWillLearn: newList.length > 0 ? newList : [""] });
    };

    const saveLearnItems = () => {
        handleAutoSave({ whatYouWillLearn: formData.whatYouWillLearn });
    };

    const addLearnItem = () => {
        setFormData(prev => ({ ...prev, whatYouWillLearn: [...(prev.whatYouWillLearn || []), ""] }));
    };

    const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setThumbnailFile(file);
        setThumbnailPreviewUrl(URL.createObjectURL(file));
        handleAutoSave({}, file);
    };

    // Curriculum Handlers
    const handleAddSection = async () => {
        if (!newSectionTitle) return;
        try {
            const newSection = await authApi.addSection(courseId as string, newSectionTitle);
            setNewSectionTitle("");
            setIsSectionModalOpen(false);
            const sectionData = (newSection as any).data || newSection;
            setCourse(prev => prev ? {
                ...prev,
                sections: [...prev.sections, { ...sectionData, lessons: sectionData.lessons || [] }]
            } : null);
        } catch (err: any) {
            alert(err.message);
        }
    };

    const handleAddLesson = async () => {
        if (!lessonForm.title) return;
        try {
            setUploadingPdf(true);
            let finalLessonForm = { ...lessonForm };
            if (lessonForm.type === 'PDF' && pdfFile) {
                const res = await authApi.uploadFile(pdfFile, true);
                finalLessonForm.pdfFileId = res.id;
            }
            const newLesson = await authApi.addLesson(courseId as string, currentSectionId, finalLessonForm);
            setIsLessonModalOpen(false);
            setLessonForm({ title: "", type: 'YOUTUBE', videoId: "", pdfFileId: "", durationText: "10:00", isFreePreview: false });
            setPdfFile(null);
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
        setIsSubmitting(true);
        try {
            await authApi.submitCourseForApproval(courseId as string);
            alert("Successfully submitted! An admin will review it soon.");
            router.push('/instructorsdashboard');
        } catch (err: any) {
            alert(`Hold on! ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return (
        <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-gray-100 border-t-gray-900 rounded-full animate-spin"></div>
        </div>
    );

    return (
        <div className="flex flex-col min-h-screen bg-white font-inter">
            <Navbar />

            <main className="flex-1 w-full max-w-5xl mx-auto px-6 lg:px-8 py-12 pb-32">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
                    <div>
                        <nav className="flex items-center text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-6 gap-2">
                            <Link href="/instructorsdashboard" className="hover:text-blue-600 transition-colors">Dashboard</Link>
                            <span className="text-gray-200">/</span>
                            <span className="text-gray-900">Editor</span>
                        </nav>
                        <h1 className="text-4xl font-black text-gray-900 mb-3 tracking-tight uppercase leading-[1.1]">{course?.title}</h1>
                        <div className="flex items-center gap-3">
                            <span className="bg-gray-100 text-gray-800 text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest">{course?.status}</span>
                            {isSaving && <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest animate-pulse">Saving changes...</span>}
                        </div>
                    </div>
                    <button
                        onClick={handleSubmitForApproval}
                        disabled={isSubmitting}
                        className="w-full md:w-auto px-10 py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all shadow-2xl shadow-gray-100 disabled:opacity-50 active:scale-95 text-sm"
                    >
                        {isSubmitting ? 'Validating...' : 'Submit for Review'}
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex border-b border-gray-100 mb-10 gap-8 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'basic', label: '1. Basic Info' },
                        { id: 'pricing', label: '2. Pricing' },
                        { id: 'curriculum', label: '3. Curriculum' }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all relative ${activeTab === tab.id ? 'text-gray-900' : 'text-gray-300 hover:text-gray-500'}`}
                        >
                            {tab.label}
                            {activeTab === tab.id && <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-900 rounded-full" />}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {activeTab === 'basic' && (
                        <div className="space-y-12">
                            <div className="grid md:grid-cols-2 gap-12">
                                <div className="space-y-8">
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Course Title</label>
                                        <input
                                            type="text"
                                            value={formData.title}
                                            onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                            onBlur={() => handleAutoSave({ title: formData.title })}
                                            className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-black bg-transparent text-gray-900"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Course Code (e.g. PHY-101)</label>
                                        <input
                                            type="text"
                                            value={formData.courseCode}
                                            onChange={e => setFormData(p => ({ ...p, courseCode: e.target.value }))}
                                            onBlur={() => handleAutoSave({ courseCode: formData.courseCode })}
                                            className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-black bg-transparent text-gray-900 uppercase"
                                        />
                                    </div>

                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 group-focus-within:text-blue-600 transition-colors">Language</label>
                                        <select
                                            value={formData.language}
                                            onChange={e => {
                                                const val = e.target.value;
                                                setFormData(p => ({ ...p, language: val }));
                                                handleAutoSave({ language: val });
                                            }}
                                            className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-black bg-transparent text-gray-900"
                                        >
                                            <option value="English">English</option>
                                            <option value="Yoruba">Yoruba</option>
                                            <option value="Igbo">Igbo</option>
                                            <option value="Hausa">Hausa</option>
                                            <option value="French">French</option>
                                        </select>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4">Course Thumbnail</label>
                                    <div className="aspect-video rounded-[32px] overflow-hidden bg-gray-50 border-2 border-dashed border-gray-100 relative group flex items-center justify-center">
                                        {thumbnailPreviewUrl ? (
                                            <>
                                                <img src={thumbnailPreviewUrl} alt="Thumbnail" className="w-full h-full object-cover group-hover:opacity-40 transition-opacity" />
                                                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <label htmlFor="thumb-reupload" className="px-6 py-3 bg-gray-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl cursor-pointer">Change Image</label>
                                                </div>
                                            </>
                                        ) : (
                                            <label htmlFor="thumb-upload" className="flex flex-col items-center gap-4 cursor-pointer hover:scale-105 transition-transform">
                                                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                                    </svg>
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Select Image</span>
                                            </label>
                                        )}
                                        <input type="file" id="thumb-upload" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                                        <input type="file" id="thumb-reupload" className="hidden" accept="image/*" onChange={handleThumbnailUpload} />
                                    </div>
                                    <p className="mt-4 text-[9px] font-bold text-gray-300 uppercase tracking-widest text-center">1280 x 720 (16:9 ratio) is recommended</p>
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 group-focus-within:text-blue-600 transition-colors">Description</label>
                                <textarea
                                    rows={5}
                                    value={formData.description}
                                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                                    onBlur={() => handleAutoSave({ description: formData.description })}
                                    className="w-full px-6 py-6 bg-gray-50 border-2 border-gray-50 focus:border-blue-600 focus:bg-white focus:outline-none rounded-3xl text-gray-900 font-medium transition-all"
                                    placeholder="Write a compelling description for your course..."
                                />
                            </div>

                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400">What students will learn</label>
                                    <button onClick={addLearnItem} className="text-[10px] font-black text-blue-600 uppercase tracking-widest">+ Add Item</button>
                                </div>
                                <div className="grid gap-4">
                                    {(formData.whatYouWillLearn || [""]).map((item, idx) => (
                                        <div key={idx} className="flex gap-4">
                                            <input
                                                type="text"
                                                value={item}
                                                onChange={e => handleLearnChange(idx, e.target.value)}
                                                onBlur={saveLearnItems}
                                                className="flex-1 px-6 py-4 bg-gray-50 rounded-2xl text-sm font-bold border-2 border-transparent focus:border-blue-600 focus:bg-white focus:outline-none transition-all"
                                                placeholder={`Outcome #${idx + 1}`}
                                            />
                                            {(formData.whatYouWillLearn || []).length > 1 && (
                                                <button onClick={() => removeLearnItem(idx)} className="p-4 text-gray-300 hover:text-red-500 transition-colors">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" strokeWidth={2} /></svg>
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end pt-10">
                                <button onClick={() => setActiveTab('pricing')} className="px-10 py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all text-sm">Next: Pricing</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'pricing' && (
                        <div className="space-y-12 max-w-xl mx-auto">
                            <div className="text-center mb-10">
                                <h3 className="text-3xl font-black text-gray-900 uppercase tracking-tight mb-3">Set your price</h3>
                                <p className="text-gray-500 font-medium">Earn 70% of every sale. Your course will be sold in Naira (₦).</p>
                            </div>

                            <div className="p-10 bg-gray-50 rounded-[40px] border border-gray-100 flex flex-col items-center">
                                <div className="flex items-center gap-4 mb-6">
                                    <span className="text-5xl font-black text-gray-200">₦</span>
                                    <input
                                        type="number"
                                        value={priceNaira}
                                        onChange={e => setPriceNaira(e.target.value)}
                                        onBlur={() => handlePriceChange(priceNaira)}
                                        className="w-48 text-5xl font-black text-gray-900 bg-transparent border-none focus:ring-0 p-0 placeholder-gray-200"
                                        placeholder="0.00"
                                    />
                                </div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em]">Course Price</p>
                            </div>

                            <div className="grid grid-cols-2 gap-10 py-10">
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">You Earn</p>
                                    <p className="text-2xl font-black text-emerald-600">₦ {(parseFloat(priceNaira || "0") * 0.7).toLocaleString()}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Platform Fee</p>
                                    <p className="text-2xl font-black text-gray-900">30%</p>
                                </div>
                            </div>

                            <div className="flex justify-between pt-10">
                                <button onClick={() => setActiveTab('basic')} className="text-sm font-black text-gray-400 uppercase tracking-widest hover:text-gray-900">Back</button>
                                <button onClick={() => setActiveTab('curriculum')} className="px-10 py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-600 transition-all text-sm">Next: Curriculum</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'curriculum' && (
                        <div className="space-y-8">
                            {course?.sections.map((section, sidx) => (
                                <div key={section.id} className="bg-white rounded-[32px] border border-gray-100 overflow-hidden shadow-sm">
                                    <div className="bg-gray-50/50 px-8 py-6 flex justify-between items-center border-b border-gray-50">
                                        <div className="flex items-center gap-4">
                                            <span className="w-8 h-8 rounded-xl bg-gray-900 text-white flex items-center justify-center font-black text-xs">{sidx + 1}</span>
                                            <h2 className="text-sm font-black text-gray-900 uppercase tracking-widest">{section.title}</h2>
                                        </div>
                                        <button
                                            onClick={() => { setCurrentSectionId(section.id); setIsLessonModalOpen(true); }}
                                            className="px-4 py-2 bg-white rounded-xl border border-gray-200 text-[10px] font-black uppercase tracking-widest text-blue-600 hover:border-blue-600 transition-all"
                                        >
                                            + Add Lesson
                                        </button>
                                    </div>

                                    <div className="p-4 space-y-2">
                                        {section.lessons.length > 0 ? (
                                            section.lessons.map(lesson => (
                                                <div key={lesson.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-colors group">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-blue-600 transition-colors">
                                                            {lesson.type === 'PDF' ? (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" strokeWidth={2} stroke="currentColor" fill="none" /></svg>
                                                            ) : (
                                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth={2} stroke="currentColor" fill="none" /></svg>
                                                            )}
                                                        </div>
                                                        <div>
                                                            <p className="font-bold text-gray-900 text-sm leading-tight">{lesson.title}</p>
                                                            <p className="text-[9px] text-gray-400 font-black uppercase tracking-widest mt-1">{lesson.type} • {lesson.durationText}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-8 text-center text-[10px] font-black text-gray-300 uppercase tracking-widest">No lessons added yet</div>
                                        )}
                                    </div>
                                </div>
                            ))}

                            <button
                                onClick={() => setIsSectionModalOpen(true)}
                                className="w-full py-10 border-2 border-dashed border-gray-100 rounded-[32px] text-[10px] font-black uppercase tracking-[0.3em] text-gray-300 hover:border-blue-200 hover:text-blue-600 hover:bg-blue-50/50 transition-all shadow-sm"
                            >
                                + Add New Section
                            </button>
                        </div>
                    )}
                </div>

                {isSectionModalOpen && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] p-10 max-w-lg w-full shadow-2xl">
                            <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">New Section</h3>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-8">Group your lessons by topic</p>
                            <input
                                autoFocus
                                type="text"
                                placeholder="e.g. Fundamental Principles"
                                value={newSectionTitle}
                                onChange={e => setNewSectionTitle(e.target.value)}
                                className="w-full px-0 py-4 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-black bg-transparent text-gray-900"
                            />
                            <div className="flex gap-4 mt-12">
                                <button onClick={() => setIsSectionModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cancel</button>
                                <button onClick={handleAddSection} className="flex-1 py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl">Create</button>
                            </div>
                        </div>
                    </div>
                )}

                {isLessonModalOpen && (
                    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-md z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
                        <div className="bg-white rounded-[40px] p-10 max-w-xl w-full shadow-2xl max-h-[90vh] overflow-y-auto no-scrollbar">
                            <h3 className="text-3xl font-black text-gray-900 mb-2 uppercase tracking-tight">New Lesson</h3>
                            <p className="text-gray-400 font-bold uppercase text-[10px] tracking-widest mb-10">Add content to your section</p>

                            <div className="space-y-8">
                                <div className="group">
                                    <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">Lesson Title</label>
                                    <input
                                        type="text"
                                        value={lessonForm.title}
                                        onChange={e => setLessonForm(p => ({ ...p, title: e.target.value }))}
                                        className="w-full px-0 py-3 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-black bg-transparent text-gray-900"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button onClick={() => setLessonForm(p => ({ ...p, type: 'YOUTUBE' }))} className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${lessonForm.type === 'YOUTUBE' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-300'}`}>YouTube</button>
                                    <button onClick={() => setLessonForm(p => ({ ...p, type: 'PDF' }))} className={`py-4 rounded-2xl border-2 font-black text-[10px] uppercase tracking-widest transition-all ${lessonForm.type === 'PDF' ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-100 text-gray-300'}`}>PDF Resource</button>
                                </div>

                                {lessonForm.type === 'YOUTUBE' ? (
                                    <div className="group">
                                        <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2 group-focus-within:text-blue-600 transition-colors">YouTube Video ID</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. dQw4w9WgXcQ"
                                            value={lessonForm.videoId}
                                            onChange={e => setLessonForm(p => ({ ...p, videoId: e.target.value }))}
                                            className="w-full px-4 py-4 bg-gray-50 rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-600 font-bold text-gray-900"
                                        />
                                    </div>
                                ) : (
                                    <div className="p-8 border-2 border-dashed border-gray-100 rounded-[32px] bg-gray-50 text-center">
                                        <input type="file" accept=".pdf" id="pdf-up" className="hidden" onChange={e => setPdfFile(e.target.files?.[0] || null)} />
                                        {pdfFile ? (
                                            <div>
                                                <p className="text-xs font-black text-blue-600 mb-2 truncate">{pdfFile.name}</p>
                                                <button onClick={() => setPdfFile(null)} className="text-[9px] font-black text-red-500 uppercase tracking-widest">Remove</button>
                                            </div>
                                        ) : (
                                            <label htmlFor="pdf-up" className="cursor-pointer text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Click to upload PDF</label>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className="flex gap-4 mt-12">
                                <button onClick={() => setIsLessonModalOpen(false)} className="flex-1 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">Cancel</button>
                                <button onClick={handleAddLesson} disabled={uploadingPdf} className="flex-1 py-4 bg-gray-900 text-white font-black uppercase tracking-widest rounded-2xl disabled:opacity-50">{uploadingPdf ? 'Uploading...' : 'Add Lesson'}</button>
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
