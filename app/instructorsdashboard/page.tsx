'use client';

import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authApi, InstructorAnalyticsResponse, BASE_URL } from '../api/authApi';
import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useUser } from '../context/UserContext';
import { InstructorRoute } from '../components/RouteGuard';

function InstructorDashboardContent() {
  const { user } = useUser();
  const userName = user?.fullName?.split(' ')[0] || 'Instructor';
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userAvatar, setUserAvatar] = useState<string | null>(user?.avatarId ? `${BASE_URL}/uploads/public/${user.avatarId}` : null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [analytics, setAnalytics] = useState<InstructorAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const data = await authApi.getInstructorAnalytics();
        setAnalytics(data);
      } catch (err) {
        console.error("Failed to load dashboard analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"><span className="w-2 h-2 rounded-full bg-green-500 mr-1.5 inline-block"></span>PUBLISHED</span>;
      case 'PENDING':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800"><span className="w-2 h-2 rounded-full bg-yellow-500 mr-1.5 inline-block"></span>PENDING REVIEW</span>;
      case 'DRAFT':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800"><span className="w-2 h-2 rounded-full bg-gray-500 mr-1.5 inline-block"></span>DRAFT</span>;
      case 'REJECTED':
        return <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-800"><span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 inline-block"></span>REJECTED</span>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Promotional Banner */}
      {/* <div className="bg-blue-600 text-white py-3 px-4 text-center relative">
        <p className="text-sm">
          <span className="font-semibold">Ends in 5h 39m 44s.</span> Prices as low as ₦7,900 | Get new skills risk-free.
        </p>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:text-gray-200">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div> */}

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-6">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">›</span>
          <span className="text-gray-900">Instructor Dashboard</span>
        </div>

        {/* Page Title */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center text-white font-black text-2xl overflow-hidden shadow-xl shadow-blue-100 flex-shrink-0">
            {userAvatar ? (
              <img src={userAvatar} alt={userName} className="w-full h-full object-cover" />
            ) : (
              userName[0].toUpperCase()
            )}
          </div>
          <div>
            <h1 className="text-4xl font-black text-gray-900 mb-1 uppercase tracking-tight">Instructor Dashboard</h1>
            <p className="text-xl text-gray-600 font-medium">Greetings, {userName}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12 text-center sm:text-left">
          {/* Total Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Courses</p>
            <p className="text-3xl font-black text-gray-900">{isLoading ? '...' : analytics?.summary.totalCourses || 0}</p>
          </div>

          {/* Total Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Total Students</p>
            <p className="text-3xl font-black text-gray-900">{isLoading ? '...' : analytics?.summary.totalStudents || 0}</p>
          </div>

          {/* Net Earnings */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Net Earnings (your 70%)</p>
            <p className="text-3xl font-black text-gray-900">₦ {isLoading ? '...' : ((analytics?.summary.netProfitKobo || 0) / 100).toLocaleString('en-NG')}</p>
          </div>
        </div>

        {/* My Courses Section */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">MY COURSES</h2>
            <Link href="/courseeditor">
              <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                NEW COURSE
              </button>
            </Link>
          </div>

          {/* Course List */}
          {isLoading ? (
            <div className="p-12 flex justify-center items-center">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : (analytics?.courses.length || 0) > 0 ? (
            <div className="space-y-4">
              {analytics?.courses.map((course) => (
                <div key={course.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 md:p-8">
                  <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                    {/* Thumbnail */}
                    <div className="w-full md:w-48 h-32 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0 shadow-inner">
                      {(course as any).thumbnail ? (
                        <img
                          src={(course as any).thumbnail}
                          alt={course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-xs uppercase tracking-widest">
                          No Thumbnail
                        </div>
                      )}
                    </div>

                    {/* Course Details */}
                    <div className="flex-1 w-full">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-4">
                        <div>
                          <h3 className="text-xl md:text-2xl font-black text-gray-900 mb-2 leading-tight">{course.title}</h3>
                          {getStatusBadge(course.status)}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-y-3 gap-x-6 text-xs font-bold text-gray-500 mb-6 uppercase tracking-wider">
                        <span>{course.studentCount} Students</span>
                        <span>{course.lessonsCount} Lessons</span>
                        {course.status === 'PUBLISHED' && (
                          <span className="text-emerald-600">
                            ₦ {((course.revenueKobo || 0) / 100).toLocaleString('en-NG')} Revenue
                          </span>
                        )}
                      </div>

                      {/* Progress Bar - Only for published courses */}
                      {course.status === 'PUBLISHED' && (
                        <div className="mb-4">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-gray-600">Average completion</span>
                            <span className="text-xs font-semibold text-gray-900">{course.avgCompletion}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${course.avgCompletion}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Action Button */}
                      <div className="flex justify-end">
                        <Link href={`/courseeditor/${course.id}`}>
                          <button className="px-6 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition-colors flex items-center">
                            {course.status === 'PUBLISHED' ? 'MANAGE' : 'EDIT'}
                            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Empty State
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Create your first course!</h3>
              <p className="text-gray-600 mb-6">Start sharing your knowledge with students today.</p>
              <Link href="/courseeditor">
                <button className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors">
                  CREATE COURSE
                </button>
              </Link>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function InstructorDashboard() {
  return (
    <InstructorRoute>
      <InstructorDashboardContent />
    </InstructorRoute>
  );
}