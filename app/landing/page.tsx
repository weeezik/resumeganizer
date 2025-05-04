import React from 'react'
import Link from 'next/link'

const categories = [
  { name: 'Software Development', color: 'bg-[#0061FE]' },
  { name: 'Project Management', color: 'bg-[#F000F0]' },
  { name: 'Agriculture and Farm Work', color: 'bg-[#FE9D00]' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F5F5] flex flex-col">
      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-12 gap-12">
        {/* Left: Headline and Text */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight text-gray-900">
            An online file cabinet<br />for your resumes.
          </h1>
          <p className="text-xl text-gray-800 mb-8">
          Resumeganizer helps you organize and manage different versions of your resume — 
          tailored to each job you apply to. No more searching your folders. Keep everything in one place.
          </p>
          <a
            href="/resumes"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold px-8 py-4 rounded-full shadow-lg transition mb-8"
          >
            Get Started
          </a>
        </div>
        {/* Right: Category Pills */}
        <div className="flex flex-col gap-6 items-end w-full max-w-md">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className={`w-full rounded-full ${cat.color} text-white text-2xl font-medium py-4 px-8 shadow-lg`}
            >
              {cat.name}
            </div>
          ))}
        </div>
      </main>
    </div>
  )
} 