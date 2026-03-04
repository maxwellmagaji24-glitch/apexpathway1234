'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import Footer from '../components/Footer';

export default function About() {
  const [currentFounder, setCurrentFounder] = useState(0);

  const founders = [
    {
      name: "Founder One",
      role: "CEO & Co-Founder",
      quote: "I'm the Founder of a Tech company now and I have to fully concentrate on our Go To Market, Product Design, Investment Raise, Team, and everything else.",
      image: "/founder-1.png"
    },
    {
      name: "Founder Two",
      role: "CTO & Co-Founder",
      quote: "Building innovative solutions that transform education and empower students to reach their full potential through peer-to-peer learning.",
      image: "/founder-2.png"
    },
    {
      name: "Founder Three",
      role: "COO & Co-Founder",
      quote: "Creating a platform where top-performing students can share their knowledge and help their peers succeed academically.",
      image: "/founder-3.png"
    },
    {
      name: "Founder Four",
      role: "CMO & Co-Founder",
      quote: "Passionate about connecting students with the right resources and making quality education accessible to everyone.",
      image: "/founder-4.png"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentFounder((prev) => (prev + 1) % founders.length);
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [founders.length]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Black Banner */}
      <div className="bg-gray-900 text-white py-3 px-4 text-center">
        <p className="text-sm">
          Founders stories, straight to your inbox - sign up to the{' '}
          <span className="font-semibold">We Are Founders</span> newsletter.{' '}
          <button className="ml-2 px-4 py-1 bg-blue-600 rounded text-sm hover:bg-blue-700 transition-colors">
            Subscribe
          </button>
        </p>
      </div>

      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="w-12 h-12 flex items-center justify-center cursor-pointer">
                  <img
                    src="/apex-logo.png"
                    alt="Apex Pathway"
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
            </div>

            {/* Center - Search Bar */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for courses or topics..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500"
                />
              </div>
            </div>

            {/* Right Side - Actions */}
            <div className="flex items-center space-x-6">
              {/* Cart Icon */}
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>

              <div className="flex items-center space-x-4">
                <Link href="/login">
                  <button className="px-8 py-2.5 text-blue-600 border-2 border-blue-600 rounded-full hover:bg-blue-50 transition-colors font-medium">
                    Log In
                  </button>
                </Link>
                <Link href="/signup">
                  <button className="px-8 py-2.5 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium">
                    Sign Up
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          {/* Left Side - Text Content */}
          <div className="space-y-8">
            {/* Badge */}
            <div className="inline-block">
              <span className="px-4 py-2 bg-blue-100 text-blue-600 rounded-full text-sm font-semibold">
                NEW
              </span>
              <span className="ml-2 text-gray-600">
                Read our latest interview with{' '}
                <a href="#" className="text-blue-600 hover:underline">
                  Jemma of Diverse Talent
                </a>
              </span>
            </div>

            {/* Main Heading with Fade Transition */}
            <div className="transition-opacity duration-1000 ease-in-out">
              <h1 className="text-6xl font-bold text-gray-900 mb-4">
                We Are<br />Founders
              </h1>
              <p className="text-gray-600 text-lg mb-6">
                Every founder has a story to share.
              </p>
            </div>

            {/* Founder Quote with Fade Transition */}
            <div
              key={currentFounder}
              className="animate-fadeIn"
            >
              <p className="text-gray-700 text-lg leading-relaxed mb-6 italic">
                "{founders[currentFounder].quote}"
              </p>
              <div className="mb-8">
                <p className="text-xl font-bold text-gray-900">
                  {founders[currentFounder].name}
                </p>
                <p className="text-gray-600">
                  {founders[currentFounder].role}
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <button className="px-8 py-4 bg-blue-600 text-white font-semibold rounded hover:bg-blue-700 transition-colors flex items-center group">
              Read More About {founders[currentFounder].name.split(' ')[1]}'s Story
              <svg className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Indicator Dots */}
            <div className="flex space-x-2 pt-4">
              {founders.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentFounder(index)}
                  className={`h-2 rounded-full transition-all duration-300 ${index === currentFounder
                    ? 'w-8 bg-blue-600'
                    : 'w-2 bg-gray-300 hover:bg-gray-400'
                    }`}
                  aria-label={`Go to founder ${index + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Right Side - Image with Fade Transition */}
          <div className="relative">
            <div
              key={currentFounder}
              className="animate-fadeIn"
            >
              <img
                src={founders[currentFounder].image}
                alt={founders[currentFounder].name}
                className="w-full h-[600px] object-cover rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </main >

      {/* Add custom animations to globals.css */}
      < style jsx global > {`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 1s ease-in-out;
        }
      `}</style >
      <Footer />
    </div >
  );
}