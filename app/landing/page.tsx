'use client'

import React from 'react'
import Link from 'next/link'
import { DocumentDuplicateIcon } from '@heroicons/react/24/outline'

// Use Inter font via next/font
import { Inter } from 'next/font/google'
const inter = Inter({ subsets: ['latin'] })

const exampleCategories = [
  { name: 'Software Development', color: '#A8D5E2' },
  { name: 'Project Management', color: '#B5EAD7' },
  { name: 'Hostel/Farm Work', color: '#C7CEEA' },
  { name: "Master's Degree", color: '#FFDAC1' },
]

export default function LandingPage() {
  return (
    <div className={`${inter.className} min-h-screen bg-[#F6F5F5] flex flex-col`}>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        {/* Hero Card */}
        <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl flex flex-col md:flex-row items-center md:items-stretch overflow-hidden">
          {/* Illustration */}
          <div className="flex items-center justify-center bg-blue-50 md:bg-gradient-to-b md:from-blue-50 md:to-white p-8 md:p-12">
            <DocumentDuplicateIcon className="w-28 h-28 md:w-40 md:h-40 text-blue-400 animate-bounce-slow" aria-hidden="true" />
          </div>
          {/* Text & CTA */}
          <div className="flex-1 flex flex-col justify-center p-8 md:p-12">
            <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
              All your resumes in one place.
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              Organize, label, and track every version of your resume—tailored to each job you apply to. No more searching your folders. Keep everything in one place.
            </p>
            <Link
              href="/resumes"
              className="inline-block bg-blue-600 hover:bg-blue-700 hover:scale-105 transition-transform text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              aria-label="Get Started"
            >
              Get Started
            </Link>
            {/* Category Pills */}
            <div className="flex flex-wrap gap-3 mt-8">
              {exampleCategories.map((cat) => (
                <span
                  key={cat.name}
                  className="rounded-full text-gray-900 text-base md:text-lg font-medium py-2 px-5 shadow-md"
                  style={{ backgroundColor: cat.color }}
                  tabIndex={0}
                  aria-label={cat.name}
                >
                  {cat.name}
                </span>
              ))}
            </div>
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
      `}</style>
    </div>
  )
} 