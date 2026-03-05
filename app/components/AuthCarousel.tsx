'use client';

import { useState, useEffect } from 'react';

const images = [
    "/black_student_studying_1.png",
    "/black_student_collaboration_2.png",
    "/black_student_success_3.png"
];

const quotes = [
    "Learn from the brightest minds in your school.",
    "Master your course codes with ease.",
    "Join thousands of students on Apex Pathway.",
    "Share your knowledge and earn as a tutor."
];

export default function AuthCarousel() {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentIndex((prev) => (prev + 1) % images.length);
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="relative w-full h-full min-h-[600px] rounded-3xl overflow-hidden shadow-2xl bg-gray-100 border border-gray-200">
            {images.map((src, index) => (
                <div
                    key={src}
                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentIndex ? 'opacity-100' : 'opacity-0'
                        }`}
                >
                    <img
                        src={src}
                        alt={`Slide ${index + 1}`}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-12 left-10 right-10">
                        <p className="text-white text-2xl font-black leading-tight uppercase tracking-tight">
                            {quotes[index]}
                        </p>
                    </div>
                </div>
            ))}

            {/* Progress Indicators */}
            <div className="absolute bottom-6 left-10 flex gap-2">
                {images.map((_, index) => (
                    <div
                        key={index}
                        className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? 'w-8 bg-blue-500' : 'w-2 bg-white/40'
                            }`}
                    />
                ))}
            </div>
        </div>
    );
}
