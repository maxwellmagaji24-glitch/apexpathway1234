'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi, InstructorApplication, University } from '../api/authApi';
import { useUser } from '../context/UserContext';
import { ProtectedRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

type AppState = 'loading' | 'form' | 'pending' | 'approved' | 'rejected';

function ApplyInstructorContent() {
    const router = useRouter();
    const { user, isInstructor, refreshUser } = useUser();
    const [appState, setAppState] = useState<AppState>('loading');
    const [application, setApplication] = useState<InstructorApplication | null>(null);
    const [step, setStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Step 1 fields
    const [universities, setUniversities] = useState<University[]>([]);
    const [university, setUniversity] = useState('');
    const [department, setDepartment] = useState('');
    const [level, setLevel] = useState('');
    const [studentIdFile, setStudentIdFile] = useState<File | null>(null);
    const [studentIdFileId, setStudentIdFileId] = useState('');
    const [uploadingId, setUploadingId] = useState(false);

    // Step 2 fields
    const [courseTitle, setCourseTitle] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [semester, setSemester] = useState('');
    const [grade, setGrade] = useState('A');
    const [proofFile, setProofFile] = useState<File | null>(null);
    const [proofFileId, setProofFileId] = useState('');
    const [uploadingProof, setUploadingProof] = useState(false);

    // Step 3 fields
    const [estimatedStudents, setEstimatedStudents] = useState('');
    const [studentsStruggle, setStudentsStruggle] = useState<boolean | null>(null);
    const [struggleExplanation, setStruggleExplanation] = useState('');
    const [whyStruggle, setWhyStruggle] = useState('');

    const checkStatus = useCallback(async () => {
        try {
            const result = await authApi.getInstructorApplication();
            if (!result) {
                setAppState('form');
            } else {
                setApplication(result);
                setAppState(result.status.toLowerCase() as AppState);
            }
        } catch {
            setAppState('form');
        }
    }, []);

    useEffect(() => {
        if (isInstructor) {
            setAppState('approved');
        } else {
            checkStatus();
        }
    }, [checkStatus, isInstructor]);

    // Fetch universities list
    useEffect(() => {
        authApi.getUniversities().then(setUniversities).catch(() => { });
    }, []);

    const handleFileUpload = (file: File, type: 'id' | 'proof') => {
        if (type === 'id') {
            setStudentIdFile(file);
            setStudentIdFileId(file.name); // Use name as a truthy indicator
        } else {
            setProofFile(file);
            setProofFileId(file.name);
        }
    };

    const handleSubmit = async () => {
        if (!studentIdFile || !proofFile) {
            setError('Please upload both your Student ID and Proof of Result.');
            return;
        }

        setIsSubmitting(true);
        setError('');
        try {
            await authApi.submitInstructorApplication(
                {
                    university,
                    department,
                    level,
                    studentIdCardFileId: '', // not needed when passing inline files
                    courseTitle,
                    courseCode,
                    semester,
                    grade,
                    proofOfResultFileId: '', // not needed when passing inline files
                    estimatedStudentCount: parseInt(estimatedStudents) || 0,
                    studentsStruggle: studentsStruggle ?? false,
                    struggleExplanation: struggleExplanation || '',
                    whyStudentsStruggle: whyStruggle || '',
                },
                {
                    studentIdCard: studentIdFile,
                    proofOfResult: proofFile,
                }
            );
            await refreshUser();
            await checkStatus();
        } catch (err: any) {
            setError(err.message || 'Submission failed');
        } finally {
            setIsSubmitting(false);
        }
    };

    const canProceedStep1 = university && department && level && studentIdFile;
    const canProceedStep2 = courseTitle && courseCode && semester && grade && proofFile;
    const canSubmit = estimatedStudents && studentsStruggle !== null;

    // ─── LOADING ───
    if (appState === 'loading') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
                </div>
                <Footer />
            </div>
        );
    }

    // ─── APPROVED ───
    if (appState === 'approved') {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 max-w-2xl mx-auto px-6 py-20 text-center">
                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-16">
                        <div className="flex justify-center mb-6">
                            <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
                            Congratulations, You&apos;re an Instructor!
                        </h1>
                        <p className="text-gray-600 mb-10 text-lg">
                            Your application has been approved. You can now create and publish courses on Apex.
                        </p>
                        <Link
                            href="/instructorsdashboard"
                            className="inline-flex items-center gap-2 px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                        >
                            Go to Instructor Dashboard
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ─── PENDING ───
    if (appState === 'pending' && application) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 max-w-2xl mx-auto px-6 py-12">
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/settings" className="hover:text-blue-600">Settings</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Instructor Application</span>
                    </nav>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
                        <div className="flex justify-center mb-6">
                            <svg className="w-16 h-16 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Application Under Review</h1>
                        <p className="text-gray-600 mb-10 text-lg max-w-md mx-auto">
                            Your instructor application has been submitted and is currently being reviewed by the Apex team.
                        </p>

                        <div className="text-left bg-gray-50 rounded-2xl p-8 space-y-4 mb-10">
                            <h3 className="font-bold text-gray-900 uppercase tracking-widest text-xs mb-4">Application Summary</h3>
                            {[
                                ['University', application.university],
                                ['Department', application.department],
                                ['Level', application.level],
                                ['Course', `${application.courseCode} · ${application.courseTitle}`],
                                ['Grade', application.grade],
                                ['Semester', application.semester],
                            ].map(([label, value]) => (
                                <div key={label} className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">{label}</span>
                                    <span className="text-gray-900 font-semibold">{value}</span>
                                </div>
                            ))}
                            <div className="pt-4 border-t border-gray-200 space-y-2">
                                <p className="text-sm font-medium text-gray-500">Documents Submitted</p>
                                <p className="text-sm text-green-600 font-medium flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Student ID Card</p>
                                <p className="text-sm text-green-600 font-medium flex items-center"><svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Proof of Result</p>
                            </div>
                        </div>

                        <div className="flex gap-3 p-4 bg-amber-50 rounded-xl border border-amber-100 text-left mb-8">
                            <svg className="w-6 h-6 text-amber-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            <p className="text-sm text-amber-700">
                                Please be patient. Applications are reviewed within <strong>2–5 business days</strong>. You will be notified by email.
                            </p>
                        </div>

                        <Link href="/" className="text-blue-600 font-bold hover:underline">
                            Back to Home
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ─── REJECTED ───
    if (appState === 'rejected' && application) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col">
                <Navbar />
                <div className="flex-1 max-w-2xl mx-auto px-6 py-12">
                    <nav className="flex items-center text-sm text-gray-500 mb-8">
                        <Link href="/" className="hover:text-blue-600">Home</Link>
                        <span className="mx-2">/</span>
                        <Link href="/settings" className="hover:text-blue-600">Settings</Link>
                        <span className="mx-2">/</span>
                        <span className="text-gray-900 font-medium">Instructor Application</span>
                    </nav>

                    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-12 text-center">
                        <div className="flex justify-center mb-6">
                            <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-3">Application Not Approved</h1>
                        <p className="text-gray-600 mb-8 text-lg max-w-md mx-auto">
                            Unfortunately, your instructor application was not approved at this time.
                        </p>

                        <div className="text-left bg-red-50 rounded-2xl p-6 mb-10 border border-red-100">
                            <p className="text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Reason from Apex Team</p>
                            <p className="text-sm text-red-700 leading-relaxed">
                                {application.rejectionReason ||
                                    'No specific reason was provided. Please ensure your documents are valid and your grade meets the minimum requirement.'}
                            </p>
                        </div>

                        <p className="text-gray-600 mb-8">You may re-apply with updated information.</p>
                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => { setAppState('form'); setStep(1); }}
                                className="px-10 py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
                            >
                                Apply Again
                            </button>
                            <Link href="/" className="text-gray-600 font-semibold hover:underline">
                                Back to Home
                            </Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // ─── FORM (multi-step) ───
    const emailVerified = user?.emailVerified;

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />
            <div className="flex-1 max-w-2xl mx-auto px-6 py-12">
                <nav className="flex items-center text-sm text-gray-500 mb-8">
                    <Link href="/" className="hover:text-blue-600">Home</Link>
                    <span className="mx-2">/</span>
                    <Link href="/settings" className="hover:text-blue-600">Settings</Link>
                    <span className="mx-2">/</span>
                    <span className="text-gray-900 font-medium">Become an Instructor</span>
                </nav>

                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-8 text-white text-center">
                        <div className="flex justify-center mb-3">
                            <svg className="w-10 h-10 text-blue-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
                            </svg>
                        </div>
                        <h1 className="text-2xl font-extrabold mb-1">Become an Instructor on Apex</h1>
                        <p className="text-blue-200 text-sm">Share your knowledge and earn from it</p>
                    </div>

                    {/* Email verification gate */}
                    {!emailVerified && (
                        <div className="m-6 flex gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                            <svg className="w-6 h-6 text-red-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            <div>
                                <p className="text-sm text-red-700 font-semibold">Please verify your email before applying.</p>
                                <Link href="/verify-email" className="text-xs text-red-600 underline">Go to verification</Link>
                            </div>
                        </div>
                    )}

                    {emailVerified && (
                        <div className="p-8">
                            {/* Progress Steps */}
                            <div className="flex items-center justify-center gap-2 mb-10">
                                {[1, 2, 3].map((s) => (
                                    <div key={s} className="flex items-center gap-2">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${step >= s ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-400'
                                            }`}>
                                            {step > s ? '✓' : s}
                                        </div>
                                        {s < 3 && <div className={`w-16 h-1 rounded-full transition-all ${step > s ? 'bg-blue-600' : 'bg-gray-200'}`} />}
                                    </div>
                                ))}
                            </div>

                            {error && (
                                <div className="mb-6 flex gap-2 p-4 bg-red-50 rounded-xl border border-red-100">
                                    <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <p className="text-sm text-red-600">{error}</p>
                                </div>
                            )}

                            {/* Step 1: Academic Background */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">Your Academic Background</h2>
                                        <p className="text-sm text-gray-500">Tell us about your university and student status.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">University / Institution</label>
                                        <select value={university} onChange={e => setUniversity(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                                            <option value="">Select your university</option>
                                            {universities.map(uni => (
                                                <option key={uni.id} value={uni.name}>{uni.name} ({uni.abbreviation})</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Department</label>
                                            <input type="text" value={department} onChange={e => setDepartment(e.target.value)}
                                                placeholder="e.g. Computer Science"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Level / Year</label>
                                            <select value={level} onChange={e => setLevel(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white">
                                                <option value="">Select level</option>
                                                {['100', '200', '300', '400', '500', '600', '700'].map(l => <option key={l} value={l}>{l} Level</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Student ID Card</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const f = e.target.files?.[0];
                                                    if (f) { setStudentIdFile(f); handleFileUpload(f, 'id'); }
                                                }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                                            />
                                            {uploadingId && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium">Uploading...</span>}
                                            {studentIdFileId && !uploadingId && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">✓</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-end pt-4">
                                        <button onClick={() => setStep(2)} disabled={!canProceedStep1}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 2: Course Details */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">The Course You Want to Teach</h2>
                                        <p className="text-sm text-gray-500">Tell us about the specific course you plan to create.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Title</label>
                                        <input type="text" value={courseTitle} onChange={e => setCourseTitle(e.target.value)}
                                            placeholder="e.g. Introduction to Data Structures"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Course Code</label>
                                            <input type="text" value={courseCode} onChange={e => setCourseCode(e.target.value)}
                                                placeholder="e.g. CSC301"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Semester</label>
                                            <input type="text" value={semester} onChange={e => setSemester(e.target.value)}
                                                placeholder="e.g. 2025/2026 First Semester"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Your Grade in this Course</label>
                                        <div className="flex gap-4">
                                            {['A', 'B'].map(g => (
                                                <label key={g} className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${grade === g ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}>
                                                    <input type="radio" name="grade" value={g} checked={grade === g} onChange={() => setGrade(g)} className="sr-only" />
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${grade === g ? 'border-blue-600' : 'border-gray-300'}`}>
                                                        {grade === g && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                    </div>
                                                    <span className="font-bold text-lg">{g}</span>
                                                    {g === 'B' && <span className="text-xs text-gray-400">(minimum)</span>}
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Upload Proof of Result</label>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                accept="image/*,.pdf"
                                                onChange={e => {
                                                    const f = e.target.files?.[0];
                                                    if (f) { setProofFile(f); handleFileUpload(f, 'proof'); }
                                                }}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
                                            />
                                            {uploadingProof && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-blue-600 font-medium">Uploading...</span>}
                                            {proofFileId && !uploadingProof && <span className="absolute right-4 top-1/2 -translate-y-1/2 text-green-500">✓</span>}
                                        </div>
                                    </div>
                                    <div className="flex justify-between pt-4">
                                        <button onClick={() => setStep(1)} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                            ← Back
                                        </button>
                                        <button onClick={() => setStep(3)} disabled={!canProceedStep2}
                                            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
                                            Next →
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Step 3: Motivation */}
                            {step === 3 && (
                                <div className="space-y-6">
                                    <div>
                                        <h2 className="text-lg font-bold text-gray-900 mb-1">Your Teaching Motivation</h2>
                                        <p className="text-sm text-gray-500">Help us understand why you want to teach and how you plan to help.</p>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">How many students do you expect to enroll?</label>
                                        <input type="number" value={estimatedStudents} onChange={e => setEstimatedStudents(e.target.value)}
                                            placeholder="e.g. 50" min="1"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Do students struggle with this subject?</label>
                                        <div className="flex gap-4">
                                            {[true, false].map(val => (
                                                <label key={String(val)} className={`flex items-center gap-3 px-6 py-3 rounded-xl border-2 cursor-pointer transition-all ${studentsStruggle === val ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-700 hover:border-gray-300'
                                                    }`}>
                                                    <input type="radio" name="struggle" checked={studentsStruggle === val} onChange={() => setStudentsStruggle(val)} className="sr-only" />
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${studentsStruggle === val ? 'border-blue-600' : 'border-gray-300'}`}>
                                                        {studentsStruggle === val && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                                                    </div>
                                                    <span className="font-semibold">{val ? 'Yes' : 'No'}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </div>
                                    {studentsStruggle && (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">If yes, how do students struggle?</label>
                                                <textarea value={struggleExplanation} onChange={e => setStruggleExplanation(e.target.value)}
                                                    rows={3} placeholder="Describe the difficulties students face..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Why do students struggle and how will you help?</label>
                                                <textarea value={whyStruggle} onChange={e => setWhyStruggle(e.target.value)}
                                                    rows={3} placeholder="Explain your approach and teaching strategy..."
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 resize-none" />
                                            </div>
                                        </>
                                    )}
                                    <div className="flex justify-between pt-4">
                                        <button onClick={() => setStep(2)} className="px-8 py-3 border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                            ← Back
                                        </button>
                                        <button onClick={handleSubmit} disabled={!canSubmit || isSubmitting}
                                            className="px-10 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-blue-200">
                                            {isSubmitting ? 'Submitting...' : 'Submit Application'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </div>
    );
}

export default function ApplyInstructorPage() {
    return (
        <ProtectedRoute>
            <ApplyInstructorContent />
        </ProtectedRoute>
    );
}
