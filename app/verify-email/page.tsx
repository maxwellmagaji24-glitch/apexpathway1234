'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { authApi } from '../api/authApi';
import { useUser } from '../context/UserContext';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout, refreshUser } = useUser();
  const email = searchParams.get('email') || '';

  // If user is already verified, skip straight to dashboard
  useEffect(() => {
    if (user && user.emailVerified) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown <= 0) { setCanResend(true); return; }
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  // Auto-submit when all 6 digits are filled
  useEffect(() => {
    if (otp.every((d) => d !== '')) {
      handleVerify();
    }
  }, [otp]);

  const handleChange = (index: number, value: string) => {
    // Allow only single digit
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // take last char in case of paste on single box
    setOtp(newOtp);
    // Move focus forward
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

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length < 6) return;
    setError('');
    setIsVerifying(true);

    try {
      await authApi.verifyEmail({ email, otp: code });
      setSuccess('Email verified! Redirecting...');
      await refreshUser();
      setTimeout(() => router.push('/dashboard'), 1000);
    } catch (err: any) {
      setError(err.message || 'Invalid OTP. Please try again.');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    setError('');
    setIsResending(true);

    try {
      await authApi.resendVerification({ email });
      setSuccess('A new code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.message || 'Failed to resend. Please try again.');
    } finally {
      setIsResending(false);
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
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 text-center mb-2">Check your email</h1>
        <p className="text-gray-500 text-center mb-2">
          We sent a 6-digit code to
        </p>
        <p className="text-blue-600 font-semibold text-center mb-8">{email}</p>

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

        {/* OTP Input Boxes */}
        <div className="flex justify-center gap-3 mb-8" onPaste={handlePaste}>
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

        {/* Verify Button */}
        <button
          onClick={handleVerify}
          disabled={isVerifying || otp.some((d) => d === '')}
          className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify Email'}
        </button>

        {/* Resend */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm mb-1">Didn't receive the code?</p>
          {canResend ? (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="text-blue-600 font-semibold text-sm hover:underline disabled:opacity-50"
            >
              {isResending ? 'Sending...' : 'Resend code'}
            </button>
          ) : (
            <p className="text-gray-400 text-sm">
              Resend in <span className="font-semibold text-gray-600">{countdown}s</span>
            </p>
          )}
        </div>

        {/* Wrong email? */}
        <div className="mt-8 text-center bg-gray-100 py-4 px-4 rounded-lg space-y-2">
          <p className="text-gray-700 text-sm">
            Wrong email?{' '}
            <a href="/signup" className="text-blue-600 font-semibold hover:underline">
              Go back to Sign Up
            </a>
          </p>
          <p className="text-gray-700 text-sm">
            Or{' '}
            <button
              onClick={() => { logout(); router.push('/login'); }}
              className="text-blue-600 font-semibold hover:underline"
            >
              Log out and go to Login
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmail() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}