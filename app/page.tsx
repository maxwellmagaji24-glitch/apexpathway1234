'use client';
import { useState } from 'react';
import { useRef } from 'react';
import Image from "next/image";
import Link from 'next/link'
export default function Home() {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: -350, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 350, behavior: 'smooth' });
    }
  };
const [openFaq, setOpenFaq] = useState(0);
  const faqs = [
  {
    question: "What is Apex Pathway?",
    answer: "Apex Pathway is a student-led course platform where top-performing students create and teach courses to help their peers succeed academically.",
    defaultOpen: true,
  },
  {
    question: "Who creates the courses?",
    answer: "Courses are created by high-achieving students who have excelled in their respective departments. Every tutor is vetted to ensure quality and academic accuracy.",
  },
  {
    question: "Are the courses tailored to my school's curriculum?",
    answer: "Yes! All courses are designed specifically around your school's curriculum and course codes, so what you learn maps directly to what you'll be tested on.",
  },
  {
    question: "How do I access a course after payment?",
    answer: "Once payment is confirmed, the course is instantly unlocked in your dashboard. You can start watching immediately from any device.",
  },
  {
    question: "Are the courses video-based or text-based?",
    answer: "Most courses are video-based with supporting notes and resources. Some courses also include quizzes and practice questions to reinforce learning.",
  },
  {
    question: "Can I contact the tutor if I have questions?",
    answer: "Yes, each course has a Q&A section where you can post questions directly to the tutor. Tutors typically respond within 24–48 hours.",
  },
];

   const courses = [
    {
      id: 1,
      code: "MAT 101",
      instructor: "Chidinma Okeke",
      dept: "Mechatronics Engineering, 400 Level",
      description: "Build a strong foundation in algebra. Learn core concepts like...Read more",
      price: "₦ 4,000",
      lessons: 16,
      students: 20,
      image: "/course-image-1.png",
      avatar: "/instructor-1.png",
      gradient: "from-blue-400 to-blue-600",
    },
    {
      id: 2,
      code: "CSC 102",
      instructor: "Michael Adebanjo",
      dept: "Computer Science, 300 Level",
      description: "A guide to computing principles, programming basics, and what it means to thi...Read more",
      price: "₦ 5,500",
      lessons: 16,
      students: 20,
      image: "/course-image-2.png",
      avatar: "/instructor-2.png",
      gradient: "from-gray-700 to-gray-900",
    },
    {
      id: 3,
      code: "LAW 205",
      instructor: "Tolu Jacobs",
      dept: "Law, 500 Level",
      description: "Understand the legal system, core principles of justice, and how to think lik...Read more",
      price: "₦ 6,000",
      lessons: 16,
      students: 20,
      image: "/course-image-3.png",
      avatar: "/instructor-3.png",
      gradient: "from-amber-600 to-amber-800",
    },
    {
      id: 4,
      code: "ANA 205",
      instructor: "Aisha Bello",
      dept: "Anatomy, 400 Level",
      description: "Learn the foundational structures of the human body with clear...Read more",
      price: "₦ 4,500",
      lessons: 16,
      students: 20,
      image: "/course-image-4.png",
      avatar: "/instructor-4.png",
      gradient: "from-pink-400 to-pink-600",
    },
    {
      id: 5,
      code: "ENG 301",
      instructor: "Emeka Okonkwo",
      dept: "Electrical Engineering, 300 Level",
      description: "Dive into circuit theory, signal processing, and the fundamentals of...Read more",
      price: "₦ 5,000",
      lessons: 18,
      students: 24,
      image: "/course-image-5.png",
      avatar: "/instructor-5.png",
      gradient: "from-emerald-400 to-emerald-700",
    },
    {
      id: 6,
      code: "ECO 202",
      instructor: "Fatima Suleiman",
      dept: "Economics, 200 Level",
      description: "Explore micro and macroeconomic theory, market structures, and how polic...Read more",
      price: "₦ 3,500",
      lessons: 14,
      students: 30,
      image: "/course-image-6.png",
      avatar: "/instructor-6.png",
      gradient: "from-violet-500 to-violet-800",
    },
  ];
  

  return (

    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
           <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Logo */}
            <div className="flex items-center space-x-8">
              <Link href="/">
                <div className="w-12 h-12 flex items-center justify-center cursor-pointer">
                  {/* Logo image - replace with your actual logo */}
                  <img 
                    src="/Apex Pathway 1.png" 
                    alt="Apex Pathway Logo" 
                    className="w-full h-full object-contain"
                  />
                </div>
              </Link>
              
              {/* Explore link */}
              <a href="#" className="text-gray-700 hover:text-gray-900 font-normal">
                Explore
              </a>
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
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-600 placeholder-gray-400"
                />
              </div>
            </div>

            {/* Right Side Navigation */}
            <div className="flex items-center space-x-8">
              <Link href="/about" className="text-gray-700 hover:text-gray-900 font-normal">
                About
              </Link>
              <a href="#" className="text-gray-700 hover:text-gray-900 font-normal">
                FAQs
              </a>
              <a href="#" className="text-blue-600 hover:text-blue-700 font-normal">
                Become a Tutor
              </a>
              
              {/* Cart Icon */}
              <button className="text-gray-600 hover:text-gray-900">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </button>
              
              {/* Auth Buttons */}
             
            <Link href="/login">
          <button className="px-8 py-2.5 rounded-full font-medium transition-colors hover:bg-blue-50 relative text-blue-600"
            style={{ border: '2.4px solid transparent', background: 'linear-gradient(white, white) padding-box, linear-gradient(180deg, #3B7EFF 5.36%, #013CAC 55.33%, #2863D2 120.49%) border-box' }}>
            Log In
          </button>
        </Link>

        <Link href="/signup">
          <button className="px-8 py-2.5 rounded-full font-medium transition-colors text-white relative"
            style={{ border: '4.8px solid transparent', background: 'linear-gradient(180deg, #0144C5 0%, #002977 100%) padding-box, linear-gradient(180deg, #3B7EFF 5.36%, #013CAC 55.33%, #2863D2 120.49%) border-box' }}>
            Sign Up
          </button>
        </Link>
                    </div>
                  </div>
                </div>
              </header>



      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24">
        {/* Tagline */}
        <div className="flex items-center justify-center mb-8">
          <svg className="w-6 h-6 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          <span className="text-gray-600">Smarter learning, simplified</span>
        </div>

        {/* Main Heading */}
        <div className="text-center mb-6">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight tracking-tight">
            {/* Image placeholder for "Learn" - dark rounded box */}
          <span
            className="inline-flex items-center justify-center rounded-[18px] align-middle mr-3 text-white"
            style={{
              width: '215.2px',
              height: '88.8px',
              padding: '20.4px 21.6px',
              gap: '12px',
              border: '6px solid transparent',
              background: 'linear-gradient(#2A2A2A, #2A2A2A) padding-box, linear-gradient(180deg, #0F0F0F 0%, #626262 106.55%) border-box',
            }}
          >
            Learn
    </span>
            <span className="text-gray-900 align-middle">from the</span>
            {/* Image placeholder for "Brightest" - blue rounded box */}
            <span
            className="inline-flex items-center justify-center rounded-[24px] align-middle ml-3 text-white"
            style={{
              width: '315.6px',
              height: '101px',
              paddingRight: '34.8px',
              paddingLeft: '34.8px',
              gap: '12px',
              border: '4.8px solid transparent',
              background: 'linear-gradient(90deg, #004EE5 0%, #012C7E 84.23%) padding-box, linear-gradient(179.12deg, #1F6BFF -3.57%, rgba(0, 41, 120, 0.74) 58.71%, #004FE6 109.51%) border-box',
              transform: 'rotate(-2deg)',
            }}
>
  Brightest
</span>

            <br />
            <span className="text-blue-600">Students</span>
            <span className="text-gray-900"> in Your School.</span>
          </h1>
        </div>

        {/* Subheading */}
        <p className="text-center text-gray-800 text-xl max-w-4xl mx-auto mb-10 leading-relaxed">
          Apex Pathway connects you with top-performing student tutors who create courses and
          study tools to help you ace every semester.
        </p>

        {/* CTA Button */}
       <div className="flex justify-center mb-16">
  <button
    className="text-white text-lg font-semibold flex items-center hover:opacity-90 transition-opacity"
    style={{
      width: '256.6px',
      height: '64.2px',
      padding: '15.6px 34.8px',
      gap: '7.2px',
      borderRadius: '43.2px',
      border: '4.8px solid transparent',
      background: 'linear-gradient(180deg, #0149D5 0%, #00256C 100%) padding-box, linear-gradient(180deg, #206DFF 5.36%, #0039A7 55.33%, #3D78E8 120.49%) border-box',
    }}
  >
    Browse Courses
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  </button>
</div>

        {/* Bottom Section */}
        <div className="grid md:grid-cols-2 gap-8 items-start max-w-6xl mx-auto">
          {/* Left Side - Feature Card + Video/Image */}
          <div className="relative">
            {/* Video/Image Container */}
            <div className="relative w-full aspect-[4/3] bg-gradient-to-br white rounded-2xl overflow-hidden shadow-xl">
            <img 
                  src="Frame 1618873765.png" 
                  alt="Course card example" 
                  className="w-full h-full object-contain"
                />
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center p-8">
                  <div className="w-24 h-24 bg-white/20 rounded-full mx-auto mb-4"></div>
                  <p className="text-sm opacity-75">Teacher Image/Video Placeholder</p>
                  <p className="text-xs opacity-50 mt-2">Replace with actual image</p>
                </div>
              </div>
              
              {/* Video Controls Bar */}
              <div className="absolute bottom-0 left-0 right-0 bg-gray-900/95 px-4 py-3">
                <div className="flex items-center justify-between text-white text-sm">
                  <div className="flex items-center space-x-3">
                    <button className="hover:text-blue-400">
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </button>
                    <button className="hover:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                      </svg>
                    </button>
                    <span className="text-xs">03:28 / 08:00</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <button className="hover:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>
                    <button className="hover:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </button>
                    <button className="hover:text-blue-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Feature Card - Positioned on top left */}
            <div className="absolute -top-4 -left-6 bg-white rounded-2xl shadow-lg p-5 max-w-[200px] z-20">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-3">
                <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3z" />
                </svg>
              </div>
              <p className="text-gray-900 text-sm leading-snug text-center">
                Courses taught<br />by top <span className="text-blue-600 font-semibold">5%</span> of<br />students across<br />departments.
              </p>
            </div>
          </div>

          {/* Right Side - Course Progress */}
          <div className="bg-white rounded-2xl shadow-xl p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-5">Your Course Progress</h2>
            
            {/* Progress Card - Tilted */}
            <div className="bg-gradient-to-r from-blue-900 to-blue-700 rounded-xl p-5 mb-6 text-white relative overflow-hidden transform rotate-[-1.5deg] shadow-lg">
              <div className="relative z-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-3xl font-bold">25%</span>
                  <span className="text-sm opacity-90">4/20 lessons</span>
                </div>
                <div className="w-full bg-blue-800/40 rounded-full h-2">
                  <div className="bg-white rounded-full h-2" style={{ width: '25%' }}></div>
                </div>
              </div>
            </div>

            {/* Course Outline */}
            <h3 className="text-lg font-bold text-gray-900 mb-4">Course Outline</h3>
            
            {/* Lesson Items */}
            <div className="space-y-3">
              {/* Lesson 1 - Completed */}
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Introduction</span>
                </div>
                <span className="text-sm text-gray-500">05:30</span>
              </div>

              {/* Lesson 2 - In Progress */}
              <div className="flex items-center justify-between p-4 bg-white border-2 border-blue-500 rounded-xl">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-white border-2 border-blue-600 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-900">Basic Concepts</span>
                </div>
              </div>

              {/* Lesson 3 - Locked */}
              <div className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-xl opacity-50">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                    <svg className="w-4 h-4 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                    </svg>
                  </div>
                  <span className="font-medium text-gray-600">Algebra Foundations</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section - Dark Navy Background */}
      <section className="bg-[#0A1628] py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            {/* Left - Title */}
            <div>
              <h2 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
                Built by Students, For Students...
              </h2>
              <h3 className="text-5xl md:text-6xl font-bold text-white leading-tight">
                Because We Learn Differently.
              </h3>
            </div>
            
            {/* Right - Description */}
            <div className="flex items-center">
              <p className="text-white text-lg leading-relaxed">
                Apex Pathway was created to help university students thrive, not just during exam weeks, but all year round. We empower the best-performing students to teach what they know, in the way you'll actually understand it.
              </p>
            </div>
          </div>

          {/* Subheading */}
          <h4 className="text-white text-2xl font-normal mb-8">
            What You Get with Apex, right From the Start...
          </h4>

          {/* Feature Cards Grid - Top Row */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Card 1 - Peer-to-Peer Learning (LEFT - TALL) */}
           <div className="bg-gradient-to-br from-[#dde3f0] via-[#e8edf5] to-[#f0f3f8] rounded-3xl p-8 relative overflow-hidden h-[340px]">
  
  {/* Left Content */}
  <div className="relative z-10 flex flex-col justify-between h-full w-[45%]">
    <div>
      <h3 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
        Peer-to-Peer Learning
      </h3>
      <p className="text-gray-500 text-base leading-relaxed">
        Courses created by top-performing students, designed for your real struggles.
      </p>
    </div>

    {/* 3D Blue Pill Button */}
    <div>
      <button
      
          className="text-white text-lg font-semibold flex items-center hover:opacity-90 transition-opacity"
    style={{
      width: '256.6px',
      height: '64.2px',
      padding: '15.6px 34.8px',
      gap: '7.2px',
      borderRadius: '43.2px',
      border: '4.8px solid transparent',
      background: 'linear-gradient(180deg, #0149D5 0%, #00256C 100%) padding-box, linear-gradient(180deg, #206DFF 5.36%, #0039A7 55.33%, #3D78E8 120.49%) border-box',
    }}
        
      >
        Start Learning
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  </div>

  {/* Tilted Image - Right Side */}
  <div
    className="absolute right-[-30px] top-0 bottom-0 w-[58%] flex items-center justify-center"
    style={{
      transform: "rotate(10deg) translateY(-10px) ",
      transformOrigin: "bottom right",
    }}
  >
    <img
      src="/Course cards.png"
      alt="Course card example"
      className="w-full h-full object-contain drop-shadow-2xl"
      style={{ filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.15))" }}
    />
  </div>
</div>

            {/* Card 2 - Quality-First Courses (RIGHT - SHORT) */}
            <div
  className="rounded-3xl p-8 relative overflow-hidden h-[340px]"
  style={{
    background: "linear-gradient(135deg, #dde3f0 0%, #e8edf5 50%, #f0f3f8 100%)",
  }}
>
                <div className="relative z-10 w-[55%]">
    <h3 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
      Quality-First Courses
    </h3>

                 <p className="text-gray-500 text-base leading-relaxed">
      No fluff. Just curated, easy-to-follow content, built to help you pass, fast.
    </p>
  </div>
              
              {/* Image Placeholder - Right side */}
              <div className="absolute right-[-10px] bottom-[-10px] w-[65%]">
                <img 
                  src="/Frame 1618873787.png" 
                  alt="Video player preview" 
                  className="w-full h-full object-contain"
                  style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.12))" }}
                />
              </div>
            </div>
          </div>

          {/* Bottom Row - Two Cards */}
          <div className="grid md:grid-cols-2 gap-8">
            {/* Card 3 - One-Time Payment (LEFT - SHORT) */}
            <div className="bg-gradient-to-br from-gray-100 to-white rounded-3xl p-8 relative overflow-hidden h-[280px]">
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  One-Time Payment. Full Access.
                </h3>
                <p className="text-gray-700 text-base max-w-[240px]">
                  Pay once, access forever.<br />
                  No monthly fees or<br />
                  login stress.
                </p>
              </div>
              
              {/* Image Placeholder - Bottom right */}
               <div className="absolute right-[-20px] bottom-[-20px] w-[65%]">
                <img 
                  src="/Frame 2147223422 copy.png" 
                  alt="Payment illustration" 
                  className="w-full h-full object-contain"
                   style={{ filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.10))" }}
                />
              </div>
            </div>

            {/* Card 4 - Learn at Your Pace (RIGHT - TALL) */}
<div
  className="rounded-3xl p-8 relative overflow-hidden h-[340px]"
  style={{
    background: "linear-gradient(135deg, #dde3f0 0%, #e8edf5 50%, #f0f3f8 100%)",
  }}
>
                <div className="relative z-10 flex flex-col justify-between h-full w-[45%]">
    <div>
      <h3 className="text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
        Learn at Your Pace
      </h3>
      <p className="text-gray-500 text-base leading-relaxed">
        No deadlines. No pressure.<br />
        Learn when you want,<br />
        however you want.
      </p>
    </div>

                
                {/* Button with high z-index */}
                <div>
      <button
        className="flex items-center gap-2 px-7 py-4 text-white text-base font-semibold rounded-full transition-all active:translate-y-[2px]"
         
    style={{
      width: '256.6px',
      height: '64.2px',
      padding: '15.6px 34.8px',
      gap: '7.2px',
      borderRadius: '43.2px',
      border: '4.8px solid transparent',
      background: 'linear-gradient(180deg, #0149D5 0%, #00256C 100%) padding-box, linear-gradient(180deg, #206DFF 5.36%, #0039A7 55.33%, #3D78E8 120.49%) border-box',
    }}
      >
        Explore Courses
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      </button>
    </div>
  </div>
              
              {/* Image Placeholder - Bottom right */}
              <div
    className="absolute right-[-30px] top-[20px] bottom-[-20px] w-[62%]"
    style={{
      transform: "rotate(-6deg) translateY(10px)",
      transformOrigin: "bottom right",
    }}
  >
                <img 
                  src="/Frame 1618873743.png" 
                  alt="Progress card illustration" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses Section */}
      <section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex justify-between items-start mb-12">
            {/* Left - Title */}
            <div>
              <p className="text-blue-700 text-lg mb-2">Ready to level up?</p>
              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                Find a Course
              </h2>
              <h3 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                You'll Actually Finish...
              </h3>
            </div>
            
            {/* Right - Description and Navigation */}
            <div className="text-right">
              <p className="text-gray-700 text-lg mb-6">
                Short, relatable, and exam-ready.<br />
                Our top students break it down for you.
              </p>
              
              {/* Navigation Arrows */}
              <div className="flex justify-end space-x-3">
                <button 
                  onClick={scrollLeft}
                  className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  onClick={scrollRight}
                  className="w-12 h-12 bg-blue-900 text-white rounded-full flex items-center justify-center hover:bg-blue-800 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Course Cards Slider with Fade Effect */}
          return (
    <div className="relative mb-12 -mx-4 px-0">
      {/* Left Fade */}
      <div className="absolute left-0 top-0 bottom-4 w-24 bg-gradient-to-r from-gray-50 to-transparent z-10 pointer-events-none" />

      {/* Right Fade */}
      <div className="absolute right-0 top-0 bottom-4 w-24 bg-gradient-to-l from-gray-50 to-transparent z-10 pointer-events-none" />

      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide pb-4 gap-5 px-6"
        style={{ scrollSnapType: "x mandatory" }}
      >
        {courses.map((course) => (
          <div
            key={course.id}
            className="flex-none bg-white rounded-2xl shadow-lg overflow-hidden"
            style={{
              width: "calc((100vw - 96px) / 3.4)",
              minWidth: "260px",
              maxWidth: "340px",
              scrollSnapAlign: "start",
            }}
          >
            {/* Card Image */}
            <div className={`h-48 bg-gradient-to-br ${course.gradient} relative`}>
              <img
                src={course.image}
                alt="Course"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Card Body */}
            <div className="p-5">
              {/* Instructor Row */}
              <div className="flex items-center mb-3">
                <div className="w-9 h-9 bg-gray-300 rounded-full mr-3 flex-shrink-0">
                  <img
                    src={course.avatar}
                    alt="Instructor"
                    className="w-full h-full rounded-full object-cover"
                  />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm leading-tight">{course.instructor}</p>
                  <p className="text-xs text-gray-500">{course.dept}</p>
                </div>
              </div>

              {/* Course Code */}
              <h4 className="text-2xl font-bold text-gray-900 mb-1">{course.code}</h4>

              {/* Description */}
              <p className="text-gray-500 text-xs mb-3 leading-relaxed">{course.description}</p>

              {/* Meta */}
              <div className="flex items-center gap-4 mb-4 text-xs text-gray-500">
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                  </svg>
                  {course.lessons} Lessons
                </div>
                <div className="flex items-center">
                  <svg className="w-3.5 h-3.5 mr-1 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                  </svg>
                  {course.students} Students
                </div>
              </div>

              {/* Price + CTA */}
                          <div
              style={{
                background: "linear-gradient(180deg, #51EF00 5.36%, #2E8800 55.33%, #41BF00 120.49%)",
                borderRadius: "9999px",
                padding: "4.8px",
                display: "inline-flex",
              }}
            >
              <button
                style={{
                  background: "linear-gradient(180deg, #41C000 0%, #379805 100%)",
                  borderRadius: "9999px",
                }}
                className="px-4 py-2 text-white text-sm font-semibold flex items-center"
              >
                Add to Cart
                <svg className="w-3.5 h-3.5 ml-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );


          {/* View All Courses Button */}
          <div className="flex justify-center">
             <div
                style={{
                  background: "linear-gradient(180deg, #206DFF 5.36%, #0039A7 55.33%, #3D78E8 120.49%)",
                  borderRadius: "9999px",
                  padding: "4.8px",
                  display: "inline-flex",
                }}
  >
          <button
                style={{
                  background: "linear-gradient(180deg, #0149D5 0%, #00256C 100%)",
                  borderRadius: "9999px",
                }}
                className="px-10 py-4 text-white text-lg font-semibold flex items-center shadow-lg"
              >
                View All Courses
                <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>
                        </div>
                      </div>
                      </div>
                    </section>

    {/* CTA Section with Full-Width Background Image */}
<section className="relative w-full h-[600px] overflow-hidden">
  {/* Full-Width Background Image Placeholder */}
  <div className="absolute inset-0 w-full h-full">
    <img 
      src="/courseprogress1.png" 
      alt="Academic Journey Background" 
      className="w-full h-full object-cover"
    />
  </div>
  
  {/* Buttons Overlay */}
  <div className="relative z-10 h-full flex items-end pb-16 pl-22">
    <div className="space-y-4">

      {/* Become a Tutor */}
      <div
        style={{
          background: "linear-gradient(180deg, rgba(234, 234, 234, 0.72) -9.84%, #919191 57.38%, rgba(253, 253, 253, 0.98) 124.59%)",
          borderRadius: "9999px",
          padding: "4.8px",
          display: "inline-flex",
        }}
      >
        <button
          style={{ background: "#FFFFFF", borderRadius: "9999px" }}
          className="px-10 py-4 text-blue-900 text-lg font-semibold flex items-center shadow-lg"
        >
          Become a Tutor
          <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
          </svg>
        </button>
      </div>

      {/* Browse Courses */}
      <div style={{ display: "block" }}>
        <div
          style={{
            background: "linear-gradient(180deg, #206DFF 5.36%, #0039A7 55.33%, #3D78E8 120.49%)",
            borderRadius: "9999px",
            padding: "4.8px",
            display: "inline-flex",
          }}
        >
          <button
            style={{
              background: "linear-gradient(180deg, #0149D5 0%, #00256C 100%)",
              borderRadius: "9999px",
            }}
            className="px-10 py-4 text-white text-lg font-semibold flex items-center shadow-lg"
          >
            Browse Courses
            <svg className="w-5 h-5 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</section>

   {/* FAQ Section */}
<section className="bg-gradient-to-br from-gray-50 to-gray-100 py-20 px-4 sm:px-6 lg:px-8">
  <div className="max-w-5xl mx-auto">
    {/* Header */}
    <div className="flex justify-between items-start mb-12">
      <div className="flex-1">
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Still <span className="text-blue-600">Wondering</span> if It's for You?
        </h2>
        <h3 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mt-2">
          Let's Clear That Up...
        </h3>
      </div>
      <div className="text-right ml-12">
        <p className="text-gray-700 text-base">
          Here's everything you need<br />
          to know before diving in.
        </p>
      </div>
    </div>

    {/* FAQ Accordion */}
    <div className="space-y-3">
      {[
        { q: "What is Apex Pathway?", a: "Apex Pathway is a student-led course platform where top-performing students create and teach courses to help their peers succeed academically." },
        { q: "Who creates the courses?", a: "Courses are created by high-achieving students who have excelled in their respective departments. Every tutor is vetted to ensure quality and academic accuracy." },
        { q: "Are the courses tailored to my school's curriculum?", a: "Yes! All courses are designed specifically around your school's curriculum and course codes, so what you learn maps directly to what you'll be tested on." },
        { q: "How do I access a course after payment?", a: "Once payment is confirmed, the course is instantly unlocked in your dashboard. You can start watching immediately from any device." },
        { q: "Are the courses video-based or text-based?", a: "Most courses are video-based with supporting notes and resources. Some courses also include quizzes and practice questions to reinforce learning." },
        { q: "Can I contact the tutor if I have questions?", a: "Yes, each course has a Q&A section where you can post questions directly to the tutor. Tutors typically respond within 24–48 hours." },
      ].map((faq, index) => {
        const isOpen = openFaq === index;
        return (
          <div
            key={index}
            onMouseEnter={() => setOpenFaq(index)}
            className={`rounded-2xl overflow-hidden transition-colors duration-300 ${
              isOpen
                ? "bg-blue-900"
                : "bg-white border-2 border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h4 className={`text-xl font-semibold ${isOpen ? "text-white" : "text-gray-900"}`}>
                  {faq.q}
                </h4>
                <button className={`flex-shrink-0 ml-4 ${isOpen ? "text-white hover:text-gray-200" : "text-gray-900"} transition-colors`}>
                  {isOpen ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Smooth answer reveal */}
              <div style={{ display: "grid", gridTemplateRows: isOpen ? "1fr" : "0fr", transition: "grid-template-rows 0.4s ease" }}>
                <div className="overflow-hidden">
                  <p className="text-white text-base leading-relaxed pt-3">
                    {faq.a}
                  </p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </div>
</section>

    {/* Final CTA Section with Background Image */}
<section className="relative w-full h-[500px] overflow-hidden">
  {/* Background Image Placeholder */}
  <div className="absolute inset-0 w-full h-full">
    <img 
      src="/70cad74b34407dc27fa08c4bb7956cb273c09357.jpg" 
      alt="Students learning" 
      className="w-full h-full object-cover"
    />
    {/* Darker overlay */}
    <div className="absolute inset-0 bg-black/83"></div>
  </div>
  
  {/* Content Overlay */}
  <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4">
    <h2 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
      Start Learning Smarter.<br />
      Right Now.
    </h2>
    <p className="text-white text-lg md:text-xl max-w-4xl mb-10 leading-relaxed">
      Get access to clear, practical lessons taught by top-performing student tutors, designed to help you<br />
      understand faster, retain more, and stay ahead all semester long.
    </p>
    
    {/* CTA Buttons */}
    <div className="flex gap-4">

      {/* Browse Courses */}
      <div style={{ background: "linear-gradient(180deg, #206DFF 5.36%, #0039A7 55.33%, #3D78E8 120.49%)", borderRadius: "9999px", padding: "4.8px", display: "inline-flex" }}>
        <button style={{ background: "linear-gradient(180deg, #0149D5 0%, #00256C 100%)", borderRadius: "9999px" }} className="px-10 py-4 text-white text-lg font-semibold shadow-lg">
          Browse Courses
        </button>
      </div>

      {/* Become a Tutor */}
      <div style={{ background: "linear-gradient(180deg, rgba(234, 234, 234, 0.72) -9.84%, #919191 57.38%, rgba(253, 253, 253, 0.98) 124.59%)", borderRadius: "9999px", padding: "4.8px", display: "inline-flex" }}>
        <button style={{ background: "#FFFFFF", borderRadius: "9999px" }} className="px-10 py-4 text-blue-900 text-lg font-semibold shadow-lg">
          Become a Tutor
        </button>
      </div>

    </div>
  </div>
</section>


      {/* Footer */}
      <footer className="bg-[#0A1E3D] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Column 1 - Logo and Description */}
            <div>
              <div className="flex items-center mb-4">
                <div className="">
  <img 
                    src="/Apex Pathway 1.png" 
                    alt="Apex Pathway Logo" 
                    className="w-full h-full object-contain"
                  />
               
                </div>
                <span className="text-2xl font-bold">Apex Pathway</span>
              </div>
              <p className="text-gray-300 mb-6 leading-relaxed">
                Learn from the brightest students in your school.
              </p>
              
              {/* Social Icons */}
              <div className="flex space-x-3">
                <a href="#" className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073z" />
                    <path d="M12 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="w-10 h-10 border-2 border-white rounded-full flex items-center justify-center hover:bg-white hover:text-blue-900 transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Column 2 - Quick Links */}
            <div>
              <h3 className="text-xl font-bold mb-6">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Home</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Explore Courses</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Become a Tutor</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">FAQs</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">About Us</a>
                </li>
              </ul>
            </div>

            {/* Column 3 - Resources */}
            <div>
              <h3 className="text-xl font-bold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Contact</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Privacy Policy</a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-white transition-colors">Terms & Conditions</a>
                </li>
              </ul>
            </div>

            {/* Column 4 - Newsletter */}
            <div>
              <h3 className="text-xl font-bold mb-4">Stay Updated</h3>
              <p className="text-gray-300 mb-6">
                Join our learning community and stay in the loop.
              </p>
              <div className="flex">
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  className="flex-1 px-4 py-3 rounded-l-full text-gray-900 focus:outline-none"
                />
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 transition-colors rounded-r-full font-semibold">
                  Subscribe
                </button>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-700 pt-8 text-center">
            <p className="text-gray-400 flex items-center justify-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clipRule="evenodd" />
              </svg>
              2025 Apex Pathway. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}