"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from 'next/link';
import { authApi, InstructorAnalyticsResponse, InstructorAnalyticsCourse } from '../api/authApi';
import { InstructorRoute } from '../components/RouteGuard';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const formatNaira = (kobo: number) =>
  "₦ " + ((kobo || 0) / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 });

const STATUS_CONFIG: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  PUBLISHED: { label: "Published", bg: "#ecfdf5", color: "#065f46", dot: "#10b981" },
  PENDING: { label: "Pending", bg: "#fffbeb", color: "#92400e", dot: "#f59e0b" },
  DRAFT: { label: "Draft", bg: "#f3f4f6", color: "#374151", dot: "#9ca3af" },
};

const PERIODS = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];

const SortIcon = ({ col, sortBy, sortDir }: { col: string; sortBy: string | null; sortDir: string }) => {
  if (sortBy !== col) return <span className="ml-1 opacity-30 text-xs">↕</span>;
  return <span className="ml-1 text-blue-600 text-xs">{sortDir === "asc" ? "↑" : "↓"}</span>;
};

function InstructorAnalyticsContent() {
  const [period, setPeriod] = useState("Last 30 Days");
  const [sortBy, setSortBy] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState("desc");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [data, setData] = useState<InstructorAnalyticsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const result = await authApi.getInstructorAnalytics();
        setData(result);
      } catch (err) {
        console.error("Failed to fetch instructor analytics", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const { summary, courses } = data || {
    summary: { totalStudents: 0, totalCourses: 0, netProfitKobo: 0 },
    courses: []
  };

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  const sorted = useMemo(() => {
    if (!sortBy) return courses;
    return [...courses].sort((a, b) => {
      let va: number, vb: number;
      if (sortBy === "students") {
        va = a.studentCount;
        vb = b.studentCount;
      } else if (sortBy === "earnings") {
        va = a.revenueKobo;
        vb = b.revenueKobo;
      } else {
        return 0;
      }
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [courses, sortBy, sortDir]);

  const toggleSort = useCallback((col: string) => {
    setSortBy(prev => {
      if (prev === col) {
        setSortDir(d => d === "asc" ? "desc" : "asc");
        return prev;
      }
      setSortDir("desc");
      return col;
    });
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-inter">
      <Navbar />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <style>{`
          .stat-card { transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
          .stat-card:hover { transform: translateY(-4px); box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1) !important; }
          .row-hover:hover { background-color: #f9fafb !important; }
        `}</style>

        <nav className="flex items-center text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/instructorsdashboard" className="hover:text-blue-600">Instructor Dashboard</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">Analytics</span>
        </nav>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-10">
          <div>
            <p className="text-[10px] font-bold tracking-widest text-blue-600 uppercase mb-1">
              Performance Insights
            </p>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">
              Instructor Analytics
            </h1>
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              className="flex items-center gap-3 px-5 py-2.5 rounded-xl border border-gray-200 bg-white shadow-sm font-bold text-gray-700 hover:border-blue-300 hover:text-blue-600 transition-all text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              {period}
              <svg className={`w-3 h-3 opacity-40 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {dropdownOpen && (
              <div className="absolute top-full right-0 mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-2xl py-2 min-w-[180px] animate-in fade-in slide-in-from-top-2 duration-200 overflow-hidden">
                {PERIODS.map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setDropdownOpen(false); }}
                    className={`w-full text-left px-5 py-3 text-sm font-semibold transition-colors ${p === period ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:bg-gray-50"}`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {[
            { label: "Total Students", value: isLoading ? "..." : summary.totalStudents.toLocaleString(), color: "bg-blue-600" },
            { label: "Total Courses", value: isLoading ? "..." : summary.totalCourses, color: "bg-indigo-600" },
            { label: "Total Profit", value: isLoading ? "..." : formatNaira(summary.netProfitKobo), color: "bg-emerald-600" },
          ].map(({ label, value, color }) => (
            <div
              key={label}
              className="stat-card bg-white rounded-3xl p-8 border border-gray-100 shadow-sm"
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-[10px] font-black uppercase tracking-wider text-gray-400">{label}</span>
                <div className={`w-2 h-2 rounded-full ${color}`} />
              </div>
              <p className="text-3xl font-black text-gray-900 tracking-tight">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-12">
          <div className="px-8 py-6 border-b border-gray-50 bg-gray-50/50">
            <h2 className="text-lg font-black text-gray-900 tracking-tight">
              Detailed Course Metrics
            </h2>
          </div>

          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-20 text-center text-gray-400 font-bold uppercase tracking-widest animate-pulse">
                Analyzing Performance Data...
              </div>
            ) : (
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50/30">
                    {[
                      { label: "Course Title", col: null },
                      { label: "Status", col: null },
                      { label: "Lessons", col: null },
                      { label: "Completion", col: null },
                      { label: "Students", col: "students" },
                      { label: "Earnings", col: "earnings" },
                    ].map(({ label, col }) => (
                      <th
                        key={label}
                        onClick={col ? () => toggleSort(col) : undefined}
                        className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-50 ${col ? "cursor-pointer hover:text-blue-600 transition-colors" : ""}`}
                      >
                        <div className="flex items-center">
                          {label}
                          {col && <SortIcon col={col} sortBy={sortBy} sortDir={sortDir} />}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {sorted.map((course: InstructorAnalyticsCourse) => {
                    const st = STATUS_CONFIG[course.status] || STATUS_CONFIG.DRAFT;
                    return (
                      <tr key={course.id} className="row-hover transition-colors group">
                        <td className="px-8 py-6">
                          <p className="font-bold text-gray-900 text-[15px] line-clamp-1">{course.title}</p>
                        </td>
                        <td className="px-8 py-6">
                          <span
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-[10px] uppercase tracking-wider"
                            style={{ backgroundColor: st.bg, color: st.color }}
                          >
                            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: st.dot }} />
                            {st.label}
                          </span>
                        </td>
                        <td className="px-8 py-6 font-bold text-gray-400 text-sm">
                          {course.lessonsCount}
                        </td>
                        <td className="px-8 py-6">
                          <div className="flex items-center gap-3">
                            <div className="flex-1 min-w-[100px] h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all duration-1000"
                                style={{
                                  width: `${course.avgCompletion}%`,
                                  backgroundColor: course.avgCompletion > 70 ? "#10b981" : course.avgCompletion > 40 ? "#f59e0b" : "#94a3b8"
                                }}
                              />
                            </div>
                            <span className="text-xs font-black text-gray-500">{course.avgCompletion}%</span>
                          </div>
                        </td>
                        <td className="px-8 py-6 font-black text-gray-900 text-sm">
                          {course.studentCount.toLocaleString()}
                        </td>
                        <td className="px-8 py-6 font-black text-blue-600 text-sm whitespace-nowrap">
                          {formatNaira(course.revenueKobo)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>

          <div className="px-8 py-5 bg-gray-50/30 border-t border-gray-50 flex justify-between items-center">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              Generated at {new Date().toLocaleTimeString()}
            </p>
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
              {sorted.length} Items listed
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default function InstructorAnalytics() {
  return (
    <InstructorRoute>
      <InstructorAnalyticsContent />
    </InstructorRoute>
  );
}