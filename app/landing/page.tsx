'use client'

import React from 'react'
import Link from 'next/link'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'

const exampleCategories = [
  { name: 'Software Development', color: '#A8D5E2' },
  { name: 'Project Management', color: '#B5EAD7' },
  { name: 'Hostel/Farm Work', color: '#C7CEEA' },
  { name: "Master's Degree", color: '#FFDAC1' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F5F5] flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-4 md:px-8 py-8 md:py-16 gap-12">
        {/* Illustration */}
        <div className="mb-8 md:mb-0 flex-shrink-0 flex items-center justify-center">
          <div className="bg-blue-100 rounded-full p-6 shadow-lg animate-fade-in">
            <DocumentDuplicateIcon className="w-24 h-24 text-blue-400 animate-bounce-slow" aria-hidden="true" />
          </div>
        </div>
        {/* Text & CTA */}
        <div className="max-w-xl w-full">
          <h1 className="text-4xl md:text-6xl font-light mb-6 leading-tight text-gray-900">
            An online file cabinet<br />for your resumes.
          </h1>
          <p className="text-lg md:text-xl text-gray-800 mb-8">
            Resumeganizer helps you organize and manage different versions of your resume — tailored to each job you apply to. No more searching your folders. Keep everything in one place.
          </p>
          <Link
            href="/resumes"
            className="inline-block bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg mb-8 focus:outline-none focus:ring-2 focus:ring-blue-400"
            aria-label="Get Started"
          >
            Get Started
          </Link>
          {/* Category Pills */}
          <div className="flex flex-col gap-4 mt-8 w-full max-w-md">
            {exampleCategories.map((cat) => (
              <div
                key={cat.name}
                className="w-full rounded-full text-gray-900 text-xl md:text-2xl font-medium py-3 md:py-4 px-6 md:px-8 shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-200"
                style={{ backgroundColor: cat.color }}
                tabIndex={0}
                aria-label={cat.name}
              >
                {cat.name}
              </div>
            ))}
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-12px); }
        }
        .animate-bounce-slow {
          animation: bounce-slow 2.5s infinite;
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fade-in {
          animation: fade-in 1s ease;
        }
      `}</style>
    </div>
  )
} 