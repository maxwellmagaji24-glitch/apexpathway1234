'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { authApi, InstructorCreateCoursePayload } from '../api/authApi';
import { InstructorRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Link from 'next/link';

function CourseEditorContent() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [formData, setFormData] = useState<InstructorCreateCoursePayload>({
        title: "",
        description: "",
        priceKobo: 0,
        courseCode: "",
        thumbnailId: "",
        language: "English",
        whatYouWillLearn: [""],
        previewVideoId: ""
    });

    const [priceNaira, setPriceNaira] = useState("");

    const handlePriceChange = (val: string) => {
        if (parseFloat(val) < 0) return;
        setPriceNaira(val);
        const num = parseFloat(val);
        setFormData(prev => ({ ...prev, priceKobo: isNaN(num) ? 0 : Math.floor(num * 100) }));
    };

    const handleLearnChange = (index: number, val: string) => {
        const newList = [...formData.whatYouWillLearn];
        newList[index] = val;
        setFormData(prev => ({ ...prev, whatYouWillLearn: newList }));
    };

    const addLearnItem = () => {
        setFormData(prev => ({ ...prev, whatYouWillLearn: [...prev.whatYouWillLearn, ""] }));
    };

    const removeLearnItem = (index: number) => {
        if (formData.whatYouWillLearn.length <= 1) return;
        const newList = formData.whatYouWillLearn.filter((_, i) => i !== index);
        setFormData(prev => ({ ...prev, whatYouWillLearn: newList }));
    };

    const [uploading, setUploading] = useState(false);

    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreviewUrl, setThumbnailPreviewUrl] = useState<string | null>(null);

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnailId' | 'previewVideoId') => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (field === 'thumbnailId') {
            setThumbnailFile(file);
            setThumbnailPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title || !formData.description || !formData.courseCode || (!formData.thumbnailId && !thumbnailFile)) {
            setError("Please fill in all required fields and upload a thumbnail.");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            // Pass the thumbnail file directly — the API sends it inline as multipart/form-data
            const createdCourse = await authApi.createCourse(formData, thumbnailFile || undefined);
            router.push(`/courseeditor/${createdCourse.id}`);
        } catch (err: any) {
            setError(err.message || "Failed to create course.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <Navbar />

            <main className="flex-1 max-w-4xl mx-auto w-full px-6 lg:px-8 py-12 pb-20">
                <Link href="/instructorsdashboard" className="text-sm text-gray-500 hover:text-blue-600 mb-6 flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to Dashboard
                </Link>

                <div className="mb-10">
                    <h1 className="text-4xl font-black text-gray-900 mb-2">CREATE NEW COURSE</h1>
                    <p className="text-gray-600 font-medium">Step 1: Set up your base course details</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 font-medium text-sm flex items-center gap-3">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Left Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">Course Title*</label>
                                <input
                                    type="text"
                                    placeholder="e.g. Advanced React Architecture"
                                    value={formData.title}
                                    onChange={e => setFormData(p => ({ ...p, title: e.target.value }))}
                                    className="w-full px-0 py-2 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-bold bg-transparent text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                    required
                                />
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">Course Code*</label>
                                <input
                                    type="text"
                                    placeholder="e.g. REACT-001"
                                    value={formData.courseCode}
                                    onChange={e => setFormData(p => ({ ...p, courseCode: e.target.value }))}
                                    className="w-full px-0 py-2 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-lg font-bold bg-transparent uppercase text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal placeholder:normal-case"
                                    required
                                />
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">Price (₦)*</label>
                                <input
                                    type="number"
                                    min="0"
                                    placeholder="0.00"
                                    value={priceNaira}
                                    onChange={e => handlePriceChange(e.target.value)}
                                    className="w-full px-0 py-2 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-xl font-bold bg-transparent text-gray-900 placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                    required
                                />
                            </div>

                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-2">Language*</label>
                                <select
                                    value={formData.language}
                                    onChange={e => setFormData(p => ({ ...p, language: e.target.value }))}
                                    className="w-full px-0 py-2 border-b-2 border-gray-100 focus:border-blue-600 focus:outline-none text-lg font-bold bg-transparent text-gray-900"
                                >
                                    <option value="English">English</option>
                                    <option value="Yoruba">Yoruba</option>
                                    <option value="Igbo">Igbo</option>
                                    <option value="Hausa">Hausa</option>
                                    <option value="French">French</option>
                                </select>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="space-y-6">
                            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-full flex flex-col">
                                <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-4">Course Thumbnail*</label>
                                <div className={`flex-1 border-2 border-dashed ${thumbnailPreviewUrl || formData.thumbnailId ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'} rounded-2xl flex flex-col items-center justify-center p-8 transition-colors overflow-hidden relative`}>
                                    {thumbnailPreviewUrl || formData.thumbnailId ? (
                                        <div className="absolute inset-0 w-full h-full flex flex-col items-center justify-center bg-gray-900 group">
                                            {/* Preview Image */}
                                            {thumbnailPreviewUrl && (
                                                <img
                                                    src={thumbnailPreviewUrl}
                                                    alt="Thumbnail preview"
                                                    className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity"
                                                />
                                            )}

                                            {/* Action UI Over Image */}
                                            <div className="relative z-10 flex flex-col items-center justify-center h-full w-full">
                                                <svg className="w-12 h-12 text-white mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                <p className="text-white font-bold text-sm shadow-sm">IMAGE READY</p>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setThumbnailFile(null);
                                                        setThumbnailPreviewUrl(null);
                                                        setFormData(p => ({ ...p, thumbnailId: "" }));
                                                    }}
                                                    className="mt-4 text-xs font-bold text-red-400 uppercase hover:text-red-300 hover:underline bg-black/50 px-3 py-1 rounded"
                                                >Change</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                className="hidden"
                                                id="thumbnail-upload"
                                                onChange={e => handleFileUpload(e, 'thumbnailId')}
                                            />
                                            <label
                                                htmlFor="thumbnail-upload"
                                                className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <span className={`px-6 py-2 bg-white border-2 border-gray-200 rounded-xl text-xs font-black uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all ${uploading ? 'opacity-50' : ''}`}>
                                                    {uploading ? 'UPLOADING...' : 'SELECT IMAGE'}
                                                </span>
                                                <p className="mt-4 text-[10px] font-bold text-gray-400 text-center px-4 uppercase tracking-tighter">Recommended: 1280x720 (16:9)</p>
                                            </label>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <label className="block text-xs font-black uppercase tracking-widest text-gray-700 mb-4">Description*</label>
                        <textarea
                            rows={6}
                            placeholder="Tell students what makes this course special..."
                            value={formData.description}
                            onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                            className="w-full px-4 py-4 bg-white border border-gray-200 focus:ring-2 focus:ring-blue-600 rounded-2xl text-gray-900 font-medium placeholder-gray-400 placeholder:text-sm placeholder:font-normal resize-none transition-all"
                            required
                        />
                    </div>

                    <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-center mb-6">
                            <label className="block text-xs font-black uppercase tracking-widest text-gray-700">What You Will Learn*</label>
                            <button
                                type="button"
                                onClick={addLearnItem}
                                className="px-5 py-2.5 bg-blue-50 text-blue-600 text-sm font-black uppercase tracking-widest flex items-center gap-2 rounded-xl border-2 border-blue-200 hover:bg-blue-100 hover:border-blue-400 transition-all active:scale-95"
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
                                </svg>
                                Add Item
                            </button>
                        </div>
                        <div className="space-y-4">
                            {formData.whatYouWillLearn.map((item, idx) => (
                                <div key={idx} className="flex gap-4">
                                    <input
                                        type="text"
                                        placeholder={`Learning point #${idx + 1}`}
                                        value={item}
                                        onChange={e => handleLearnChange(idx, e.target.value)}
                                        className="flex-1 px-4 py-3 bg-white border border-gray-200 focus:ring-2 focus:ring-blue-600 rounded-xl text-gray-900 font-bold placeholder-gray-400 placeholder:text-sm placeholder:font-normal"
                                        required
                                    />
                                    {formData.whatYouWillLearn.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeLearnItem(idx)}
                                            className="p-3 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-end gap-6 pt-10">
                        <Link href="/instructorsdashboard">
                            <button
                                type="button"
                                className="px-8 py-4 border-2 border-gray-100 text-gray-500 font-black uppercase tracking-widest rounded-2xl hover:bg-gray-50 transition-all text-sm"
                            >
                                Discard
                            </button>
                        </Link>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-10 py-4 bg-blue-600 text-white font-black uppercase tracking-widest rounded-2xl hover:bg-blue-700 transition-all shadow-xl shadow-blue-100 disabled:opacity-50 active:scale-95 text-sm"
                        >
                            {isLoading ? 'Creating...' : 'Continue to Curriculum'}
                        </button>
                    </div>
                </form>
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
