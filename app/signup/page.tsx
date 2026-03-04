'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { authApi, University } from '../api/authApi';
import { useUser } from '../context/UserContext';
import { GuestRoute } from '../components/RouteGuard';
import AuthCarousel from '../components/AuthCarousel';

function SignUpContent() {
  const router = useRouter();
  const { login } = useUser();
  const [form, setForm] = useState({ fullName: '', email: '', universityId: '', password: '' });
  const [universities, setUniversities] = useState<University[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchUniversities = async () => {
      try {
        const data = await authApi.getUniversities();
        setUniversities(data);
      } catch (err) {
        console.error('Failed to fetch universities:', err);
      }
    };
    fetchUniversities();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const pwChecks = [
    { label: '8+ chars', ok: form.password.length >= 8 },
    { label: 'Uppercase', ok: /[A-Z]/.test(form.password) },
    { label: 'Lowercase', ok: /[a-z]/.test(form.password) },
    { label: 'Number', ok: /[0-9]/.test(form.password) },
    { label: 'Special char', ok: /[^A-Za-z0-9]/.test(form.password) },
  ];
  const passwordValid = pwChecks.every((c) => c.ok);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!passwordValid) {
      setError('Password must include uppercase, lowercase, number, and special character, and be at least 8 characters.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.signUp(form);
      await login(res.accessToken, res.refreshToken);
      // After signup, email is always unverified — go to OTP screen
      router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
    } catch (err: any) {
      setError(err.message || 'Sign up failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { url } = await authApi.getGoogleUrl();
      window.location.href = url;
    } catch {
      setError('Could not connect to Google. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-6xl w-full grid md:grid-cols-2 gap-12 items-center">
        <div className="hidden md:block h-[750px]">
          <AuthCarousel />
        </div>

        <div className="max-w-md w-full mx-auto">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">Sign up with email</h1>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-r-lg flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="w-5 h-5 mt-0.5 flex-shrink-0">
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm">Action failed</p>
                <p className="text-sm opacity-90">{error}</p>
              </div>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <input name="fullName" type="text" placeholder="Full name" value={form.fullName} onChange={handleChange} required
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white" />
            <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white" />

            <select
              name="universityId"
              value={form.universityId}
              onChange={handleChange}
              required
              className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="" disabled>Select your University</option>
              {universities.map((uni) => (
                <option key={uni.id} value={uni.id}>
                  {uni.name} ({uni.abbreviation})
                </option>
              ))}
            </select>

            <div>
              <input name="password" type="password" placeholder="Password" value={form.password} onChange={handleChange} required
                className="w-full px-4 py-4 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500 bg-white" />
              {form.password && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {pwChecks.map(({ label, ok }) => (
                    <span key={label} className={`text-xs px-2 py-1 rounded-full font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {ok ? '✓' : '○'} {label}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <button type="submit" disabled={isLoading || !passwordValid}
              className="w-full bg-blue-600 text-white py-4 rounded-lg font-semibold text-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed">
              {isLoading ? 'Creating account...' : 'Continue'}
            </button>
          </form>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300" /></div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-50 text-gray-500">Or sign up with</span>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={handleGoogleLogin} className="w-14 h-14 border-2 border-gray-300 rounded-lg flex items-center justify-center hover:border-gray-400 transition-colors">
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-6">
            By signing up, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:underline">Terms of Use</a> and{' '}
            <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>.
          </p>

          <div className="mt-6 text-center bg-gray-100 py-4 rounded-lg">
            <p className="text-gray-700">
              Already have an account?{' '}
              <Link href="/login" className="text-blue-600 font-semibold hover:underline">Log in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SignUp() {
  return (
    <GuestRoute>
      <SignUpContent />
    </GuestRoute>
  );
}