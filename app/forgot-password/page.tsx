'use client';

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authApi } from '../api/authApi';
import { GuestRoute } from '../components/RouteGuard';

function ForgotPasswordContent() {
    const router = useRouter();
    const [step, setStep] = useState<1 | 2>(1);
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Step 1: Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await authApi.forgotPassword({ email });
            setSuccess('A reset code has been sent to your email.');
            setTimeout(() => {
                setSuccess('');
                setStep(2);
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to send reset code. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    // OTP input handlers
    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);
        if (value && index < 5) inputRefs.current[index + 1]?.focus();
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        if (!pasted) return;
        const newOtp = [...otp];
        pasted.split('').forEach((char, i) => { newOtp[i] = char; });
        setOtp(newOtp);
        inputRefs.current[Math.min(pasted.length, 5)]?.focus();
    };

    // Step 2: Reset password
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        const code = otp.join('');
        if (code.length < 6) {
            setError('Please enter the full 6-digit code.');
            return;
        }
        setError('');
        setIsLoading(true);

        try {
            await authApi.resetPassword({ email, otp: code, newPassword });
            setSuccess('Password reset successfully! Redirecting to login...');
            setTimeout(() => router.push('/login'), 2000);
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
            <div className="max-w-md w-full mx-auto">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">
                    {step === 1 ? 'Forgot your password?' : 'Reset your password'}
                </h1>
                <p className="text-gray-500 text-center mb-8">
                    {step === 1
                        ? "Enter your email and we'll send you a reset code."
                        : `Enter the 6-digit code sent to ${email} and your new password.`}
                </p>

                {/* Error / Success */}
                {error && (
                    <div className="mb-5 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}
                {success && (
                    <div className="mb-5 p-3 bg-green-50 border border-green-200 text-green-600 rounded-lg text-sm text-center">
                        {success}
                    </div>
                )}

                {step === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-5">
                        <input
                            type="email"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Sending...' : 'Send Reset Code'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-6">
                        {/* OTP Input */}
                        <div className="flex justify-center gap-3" onPaste={handlePaste}>
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    ref={(el) => { inputRefs.current[index] = el; }}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={1}
                                    value={digit}
                                    onChange={(e) => handleChange(index, e.target.value)}
                                    onKeyDown={(e) => handleKeyDown(index, e)}
                                    className={`w-12 h-14 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-colors
                    ${digit ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-300 bg-white text-gray-900'}
                    focus:border-blue-500`}
                                />
                            ))}
                        </div>

                        {/* New Password */}
                        <input
                            type="password"
                            placeholder="New password (min 8 chars, upper, lower, number, symbol)"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            minLength={8}
                            className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white"
                        />

                        <button
                            type="submit"
                            disabled={isLoading || otp.some((d) => d === '')}
                            className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Resetting...' : 'Reset Password'}
                        </button>
                    </form>
                )}

                {/* Back to login */}
                <div className="mt-8 text-center bg-gray-100 py-4 rounded-lg">
                    <p className="text-gray-700 text-sm">
                        Remember your password?{' '}
                        <Link href="/login" className="text-blue-600 font-semibold hover:underline">
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

export default function ForgotPasswordPage() {
    return (
        <GuestRoute>
            <ForgotPasswordContent />
        </GuestRoute>
    );
}
