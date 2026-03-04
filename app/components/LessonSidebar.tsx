'use client';

import { useState } from 'react';
import { Section, Lesson } from '../api/authApi';
import ProgressBar from './ProgressBar';

interface LessonSidebarProps {
    courseTitle: string;
    instructorName: string;
    percent: number;
    totalLessons: number;
    completedLessons: number;
    sections: Section[];
    currentLessonId: string;
    onLessonClick: (lessonId: string) => void;
}

export default function LessonSidebar({
    courseTitle,
    instructorName,
    percent,
    totalLessons,
    completedLessons,
    sections,
    currentLessonId,
    onLessonClick,
}: LessonSidebarProps) {
    // Keep track of expanded sections
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>(() => {
        // Expand the section containing the current lesson by default
        const initial: Record<string, boolean> = {};
        sections.forEach((s) => {
            if (s.lessons.some((l) => l.id === currentLessonId)) {
                initial[s.id] = true;
            }
        });
        return initial;
    });

    const toggleSection = (sectionId: string) => {
        setExpandedSections((prev) => ({
            ...prev,
            [sectionId]: !prev[sectionId],
        }));
    };

    return (
        <div className="flex flex-col h-full bg-white overflow-hidden">
            {/* Header Info */}
            <div className="p-6 border-b border-gray-100">
                <h2 className="text-lg font-bold text-gray-900 leading-tight mb-1 uppercase tracking-tight">
                    {courseTitle}
                </h2>
                <p className="text-sm text-gray-500 mb-6 font-medium">by {instructorName}</p>

                <ProgressBar percent={percent} size="sm" />
                <p className="text-xs text-gray-500 mt-2 font-medium">
                    {completedLessons} of {totalLessons} lessons
                </p>
            </div>

            {/* Sections List */}
            <div className="flex-1 overflow-y-auto">
                {sections.map((section, idx) => {
                    const isExpanded = expandedSections[section.id];
                    const completedInSection = section.lessons.filter(l => l.completed).length;

                    return (
                        <div key={section.id} className="border-b border-gray-50">
                            {/* Section Header */}
                            <button
                                onClick={() => toggleSection(section.id)}
                                className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                            >
                                <div className="flex-1 min-w-0 mr-2">
                                    <h3 className="text-sm font-bold text-gray-800 truncate">
                                        Section {idx + 1}: {section.title}
                                    </h3>
                                    <p className="text-[10px] text-gray-500 font-semibold uppercase tracking-wider mt-0.5">
                                        {completedInSection} / {section.lessons.length} complete
                                    </p>
                                </div>
                                <svg
                                    className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {/* Lessons In Section */}
                            {isExpanded && (
                                <div className="bg-white">
                                    {section.lessons.map((lesson) => {
                                        const isActive = lesson.id === currentLessonId;

                                        return (
                                            <button
                                                key={lesson.id}
                                                onClick={() => onLessonClick(lesson.id)}
                                                className={`w-full flex items-center gap-3 px-4 py-3.5 transition-all text-left border-l-4 ${isActive
                                                    ? 'bg-blue-50 border-blue-600'
                                                    : 'border-transparent hover:bg-gray-50'
                                                    }`}
                                            >
                                                {/* Status Icon */}
                                                <div className="flex-shrink-0">
                                                    {lesson.completed ? (
                                                        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
                                                            <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                                            </svg>
                                                        </div>
                                                    ) : isActive ? (
                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                                        </div>
                                                    ) : (
                                                        <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                                                    )}
                                                </div>

                                                {/* Lesson Content */}
                                                <div className="flex-1 min-w-0">
                                                    <p className={`text-sm ${isActive ? 'font-bold text-blue-700' : 'font-medium text-gray-700'} truncate`}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded text-gray-500 font-bold uppercase">
                                                            {lesson.type}
                                                        </span>
                                                        {lesson.durationText && (
                                                            <span className="text-[10px] text-gray-400 font-medium">
                                                                {lesson.durationText}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Play Icon for Active */}
                                                {isActive && (
                                                    <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                                                        <path d="M8 5v14l11-7z" />
                                                    </svg>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
