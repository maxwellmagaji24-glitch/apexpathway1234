'use client';

import Link from 'next/link';
import { useState, useRef, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useUser } from '../context/UserContext';
import { ProtectedRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { authApi, BASE_URL, UPLOAD_URL, EnrolledCourse, PublicCourse } from '../api/authApi';

function DashboardContent() {
  const { user } = useUser();
  const userName = user?.fullName?.split(' ')[0] || 'User';
  const searchParams = useSearchParams();
  const router = useRouter();
  const searchQuery = searchParams.get('q') || "";

  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatarId) {
      setUserAvatar(`${UPLOAD_URL}/public/${user.avatarId}`);
    } else {
      setUserAvatar(null);
    }
  }, [user]);

  const [courses, setCourses] = useState<EnrolledCourse[]>([]);
  const [exploreCourses, setExploreCourses] = useState<PublicCourse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isExploreLoading, setIsExploreLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const fetchCourses = async () => {
      try {
        const data = await authApi.getMyCourses();
        if (mounted) setCourses(data);
      } catch (err) {
        console.error("Failed to load enrolled courses", err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };
    fetchCourses();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchExplore = async () => {
      try {
        const data = await authApi.getExploreCourses();
        if (mounted) setExploreCourses(data);
      } catch (err) {
        console.error("Failed to load explore courses", err);
      } finally {
        if (mounted) setIsExploreLoading(false);
      }
    };
    fetchExplore();
    return () => { mounted = false; };
  }, []);

  // Filter courses based on search query
  const filteredCourses = courses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredExploreCourses = exploreCourses.filter(course =>
    course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.courseCode?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* Breadcrumb */}
        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <span className="text-gray-900 font-medium">Dashboard</span>
        </nav>

        {/* Welcome Section */}
        <div className="mb-8 md:mb-12">
          <div className="flex flex-col sm:flex-row items-center sm:items-center mb-2 text-center sm:text-left">
            <div className="w-16 h-16 md:w-20 md:h-20 bg-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 sm:mb-0 sm:mr-6 overflow-hidden shadow-lg border-4 border-white">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt="User avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span>{userName.substring(0, 2).toUpperCase()}</span>
              )}
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 tracking-tight">Welcome back, {userName}</h1>
              <p className="text-gray-500 font-medium">Ready to continue your learning journey?</p>
            </div>
          </div>
        </div>

        {/* Continue Learning Section */}
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold text-gray-900">
              {searchQuery ? `Search results for "${searchQuery}"` : "Continue Learning"}
            </h2>
          </div>

          {/* Search Results Count */}
          {searchQuery && (
            <p className="text-gray-600 mb-4">
              Found {filteredCourses.length} course{filteredCourses.length !== 1 ? 's' : ''}
            </p>
          )}

          {/* Course Cards */}
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <Link key={course.id} href={`/courses/${course.id}/lessons/start`} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer block">
                  <div className="relative">
                    <img
                      src={course.thumbnailUrl ? `${UPLOAD_URL}/public/${course.thumbnailUrl}` : '/course-thumb-1.png'}
                      alt="Course thumbnail"
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <svg className="w-8 h-8 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                        </svg>
                      </div>
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-gray-900 mb-1">{course.title}</h3>
                    <p className="text-sm text-gray-600 mb-2 truncate">By {course.instructorName}</p>

                    {/* Progress Bar */}
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-gray-600 mb-1 font-semibold">
                        <span>{course.progress?.percent || 0}% Complete</span>
                        <span>{course.progress?.completedLessons || 0} / {course.progress?.totalLessons || 0} Lessons</span>
                      </div>
                      <progress
                        className="w-full h-2 rounded-full overflow-hidden [&::-webkit-progress-bar]:bg-gray-100 [&::-webkit-progress-value]:bg-blue-600 [&::-moz-progress-bar]:bg-blue-600"
                        value={course.progress?.percent || 0}
                        max="100"
                      />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : !searchQuery ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No enrolled courses yet</h3>
              <p className="text-gray-500 mb-1">Browse the courses below and start learning!</p>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-600">
                We couldn't find any courses matching "{searchQuery}". Try searching for something else.
              </p>
              <button
                onClick={() => router.push('/dashboard')}
                className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        {/* ── Explore Courses Section ── */}
        <div className="mb-8">
          <div className="flex justify-between items-end mb-8">
            <div>
              <p className="text-blue-700 text-sm font-semibold mb-1">Ready to level up?</p>
              <h2 className="text-3xl font-bold text-gray-900">Explore Courses</h2>
            </div>
          </div>

          {isExploreLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
          ) : filteredExploreCourses.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {searchQuery ? `No courses matching "${searchQuery}"` : 'No courses available yet'}
              </h3>
              <p className="text-gray-500">Check back later as our instructors are constantly publishing new content.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredExploreCourses.map((course) => (
                <Link
                  key={course.id}
                  href={`/courses/${course.id}`}
                  className="flex-none bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Card Image */}
                  <div className="h-48 bg-gray-100 relative overflow-hidden">
                    {course.thumbnailId ? (
                      <img
                        src={`${UPLOAD_URL}/public/${course.thumbnailId}`}
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
                        <svg className="w-12 h-12 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5">
                    {/* Instructor Row */}
                    <div className="flex items-center mb-3">
                      <div className="w-9 h-9 bg-gray-200 rounded-full mr-3 flex-shrink-0 overflow-hidden flex items-center justify-center">
                        {course.instructor.avatarId ? (
                          <img
                            src={`${BASE_URL}/uploads/public/${course.instructor.avatarId}`}
                            alt={course.instructor.fullName}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-[10px] font-black text-blue-600">
                            {course.instructor.fullName.substring(0, 2).toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-gray-900 text-sm leading-tight truncate">{course.instructor.fullName}</p>
                        <p className="text-xs text-gray-500 truncate">{course.instructor.instructorProfile?.department || ''}</p>
                      </div>
                    </div>

                    {/* Course Code */}
                    <h4 className="text-xl font-bold text-gray-900 mb-1">{course.courseCode || course.title}</h4>

                    {/* Description */}
                    <p className="text-gray-500 text-xs mb-3 leading-relaxed line-clamp-2">{course.description}</p>

                    {/* Meta */}
                    <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                      <div className="flex items-center">
                        <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                        {course._count.lessons || 0} Lessons
                      </div>

                    </div>

                    {/* Price + CTA */}
                    <div className="flex items-center justify-between">
                      <div className="text-xl font-bold text-gray-900 mt-auto pt-4 flex items-center justify-between">
                        ₦{((course.priceKobo || 0) / 100).toLocaleString()}
                      </div>
                      <div
                        style={{
                          background: "linear-gradient(180deg, #51EF00 5.36%, #2E8800 55.33%, #41BF00 120.49%)",
                          borderRadius: "9999px",
                          padding: "3px",
                          display: "inline-flex",
                        }}
                      >
                        <span
                          style={{
                            background: "linear-gradient(180deg, #41C000 0%, #379805 100%)",
                            borderRadius: "9999px",
                          }}
                          className="px-4 py-2 text-white text-xs font-semibold flex items-center"
                        >
                          View Details
                          <svg className="w-3 h-3 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Suspense fallback={
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <div className="h-20 bg-white border-b border-gray-200 w-full" />
          <div className="flex-1 flex justify-center items-center">
            <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        </div>
      }>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}