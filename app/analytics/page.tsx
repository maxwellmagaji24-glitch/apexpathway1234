"use client";

import { useState, useMemo } from "react";

const mockData = {
  summary: {
    totalStudents: 1240,
    totalCourses: 12,
    netProfitKobo: 45000000,
  },
  courses: [
    { id: 1, title: "MAT101: Calculus Fundamentals", status: "PUBLISHED", studentCount: 452, revenueKobo: 12050000, lessonsCount: 24, avgCompletion: 78 },
    { id: 2, title: "PHY201: Classical Physics", status: "PUBLISHED", studentCount: 310, revenueKobo: 9520000, lessonsCount: 18, avgCompletion: 65 },
    { id: 3, title: "CHM301: Organic Chemistry", status: "PENDING", studentCount: 198, revenueKobo: 8100000, lessonsCount: 30, avgCompletion: 42 },
    { id: 4, title: "BIO101: Cell Biology", status: "PUBLISHED", studentCount: 180, revenueKobo: 7200000, lessonsCount: 20, avgCompletion: 55 },
    { id: 5, title: "STA201: Statistics & Probability", status: "DRAFT", studentCount: 0, revenueKobo: 0, lessonsCount: 15, avgCompletion: 0 },
    { id: 6, title: "CS101: Intro to Programming", status: "PUBLISHED", studentCount: 100, revenueKobo: 6800000, lessonsCount: 28, avgCompletion: 88 },
  ],
};

const formatNaira = (kobo) =>
  "₦ " + (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 2 });

const STATUS_CONFIG = {
  PUBLISHED: { label: "Published", bg: "rgba(16,185,129,0.15)", color: "#6ee7b7", dot: "#10b981" },
  PENDING:   { label: "Pending",   bg: "rgba(245,158,11,0.15)", color: "#fcd34d", dot: "#f59e0b" },
  DRAFT:     { label: "Draft",     bg: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)", dot: "rgba(255,255,255,0.25)" },
};

const PERIODS = ["Last 7 Days", "Last 30 Days", "Last 90 Days", "All Time"];

export default function InstructorAnalytics() {
  const [period, setPeriod] = useState("Last 30 Days");
  const [sortBy, setSortBy] = useState(null);
  const [sortDir, setSortDir] = useState("desc");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const { summary, courses } = mockData;

  const sorted = useMemo(() => {
    if (!sortBy) return courses;
    return [...courses].sort((a, b) => {
      const va = sortBy === "students" ? a.studentCount : a.revenueKobo;
      const vb = sortBy === "students" ? b.studentCount : b.revenueKobo;
      return sortDir === "asc" ? va - vb : vb - va;
    });
  }, [courses, sortBy, sortDir]);

  const toggleSort = (col) => {
    if (sortBy === col) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortBy(col); setSortDir("desc"); }
  };

  const SortIcon = ({ col }) => {
    if (sortBy !== col) return <span style={{ color: "rgba(255,255,255,0.2)", marginLeft: 4 }}>↕</span>;
    return <span style={{ color: "#fff", marginLeft: 4 }}>{sortDir === "asc" ? "↑" : "↓"}</span>;
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#001338",
      fontFamily: "'Inter', 'Segoe UI', sans-serif",
      padding: "48px 24px",
      color: "#fff",
      display: "flex",
      justifyContent: "center",
      alignItems: "flex-start",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .stat-card { transition: transform 0.18s, box-shadow 0.18s; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(0,0,0,0.4) !important; }
        .sort-btn { cursor: pointer; user-select: none; }
        .sort-btn:hover { color: #fff !important; }
        .row-hover:hover { background: rgba(255,255,255,0.04) !important; }
        .dropdown-item:hover { background: rgba(255,255,255,0.07) !important; }
      `}</style>

      <div style={{ width: "100%", maxWidth: 1100 }}>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 36 }}>
          <div>
            <p style={{ fontSize: 11, fontWeight: 600, letterSpacing: "0.14em", color: "rgba(255,255,255,0.35)", textTransform: "uppercase", marginBottom: 6 }}>
              Overview
            </p>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
              Instructor Analytics
            </h1>
          </div>

          <div style={{ position: "relative" }}>
            <button
              onClick={() => setDropdownOpen(o => !o)}
              style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "9px 16px", borderRadius: 8,
                border: "1px solid rgba(255,255,255,0.15)",
                background: "rgba(255,255,255,0.05)",
                fontSize: 13, fontWeight: 600, color: "#fff", cursor: "pointer",
              }}
            >
              {period}
              <span style={{ fontSize: 9, opacity: 0.5 }}>▼</span>
            </button>
            {dropdownOpen && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", right: 0, zIndex: 50,
                background: "#001f50", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 10, overflow: "hidden",
                boxShadow: "0 8px 32px rgba(0,0,0,0.5)", minWidth: 160
              }}>
                {PERIODS.map(p => (
                  <div
                    key={p}
                    className="dropdown-item"
                    onClick={() => { setPeriod(p); setDropdownOpen(false); }}
                    style={{
                      padding: "10px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer",
                      color: p === period ? "#fff" : "rgba(255,255,255,0.55)",
                      background: p === period ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                  >
                    {p}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 18, marginBottom: 32 }}>
          {[
            { label: "Total Students", value: summary.totalStudents.toLocaleString() },
            { label: "Total Courses",  value: summary.totalCourses },
            { label: "Total Profit",   value: formatNaira(summary.netProfitKobo) },
          ].map(({ label, value }) => (
            <div
              key={label}
              className="stat-card"
              style={{
                background: "rgba(255,255,255,0.05)",
                borderRadius: 14,
                padding: "28px 28px",
                border: "1px solid rgba(255,255,255,0.09)",
              }}
            >
              <p style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 12px" }}>
                {label}
              </p>
              <p style={{ fontSize: 28, fontWeight: 800, color: "#fff", letterSpacing: "-0.02em", margin: 0 }}>
                {value}
              </p>
            </div>
          ))}
        </div>

        <div style={{
          background: "rgba(255,255,255,0.04)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.09)",
          overflow: "hidden",
        }}>
          <div style={{ padding: "22px 28px 18px", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: "#fff", margin: 0 }}>
              My Courses Performance
            </h2>
          </div>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.02)" }}>
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
                    className={col ? "sort-btn" : ""}
                    onClick={col ? () => toggleSort(col) : undefined}
                    style={{
                      padding: "12px 20px",
                      textAlign: "left",
                      fontSize: 10,
                      fontWeight: 700,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: sortBy === col ? "#fff" : "rgba(255,255,255,0.3)",
                      borderBottom: "1px solid rgba(255,255,255,0.07)",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {label}
                    {col && <SortIcon col={col} />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((course, i) => {
                const st = STATUS_CONFIG[course.status];
                return (
                  <tr
                    key={course.id}
                    className="row-hover"
                    style={{
                      background: "transparent",
                      transition: "background 0.12s",
                      borderBottom: i < sorted.length - 1 ? "1px solid rgba(255,255,255,0.04)" : "none",
                    }}
                  >
                    <td style={{ padding: "15px 20px", fontWeight: 600, fontSize: 14, color: "#fff" }}>
                      {course.title}
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "4px 10px", borderRadius: 20,
                        background: st.bg, color: st.color,
                        fontSize: 11, fontWeight: 700, letterSpacing: "0.05em"
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: "50%", background: st.dot, display: "inline-block" }} />
                        {st.label}
                      </span>
                    </td>
                    <td style={{ padding: "15px 20px", fontSize: 14, color: "rgba(255,255,255,0.45)" }}>
                      {course.lessonsCount}
                    </td>
                    <td style={{ padding: "15px 20px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <div style={{ width: 80, height: 5, borderRadius: 99, background: "rgba(255,255,255,0.1)", overflow: "hidden" }}>
                          <div style={{
                            height: "100%", borderRadius: 99,
                            width: `${course.avgCompletion}%`,
                            background: course.avgCompletion > 70 ? "#10b981" : course.avgCompletion > 40 ? "#f59e0b" : "rgba(255,255,255,0.2)"
                          }} />
                        </div>
                        <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.45)", minWidth: 30 }}>
                          {course.avgCompletion}%
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "15px 20px", fontSize: 14, fontWeight: 600, color: "#fff" }}>
                      {course.studentCount.toLocaleString()}
                    </td>
                    <td style={{ padding: "15px 20px", fontSize: 14, fontWeight: 700, color: "#6ee7b7" }}>
                      {formatNaira(course.revenueKobo)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div style={{ padding: "14px 24px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", justifyContent: "flex-end" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", margin: 0 }}>
              Showing {sorted.length} of {courses.length} courses
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}