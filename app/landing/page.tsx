import React from 'react'

const categories = [
  { name: 'Software Development', color: 'bg-[#0061FE]' },
  { name: 'Project Management', color: 'bg-[#F000F0]' },
  { name: 'Hostel/Farm Work', color: 'bg-[#FE9D00]' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F6F5F5] flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between bg-white rounded-xl mt-6 mx-8 px-8 py-4 shadow-sm">
        <span className="text-2xl font-medium text-gray-900">Resumeganizer</span>
        <div className="flex gap-8 text-lg font-normal text-gray-900">
          <a href="#about" className="hover:underline">About</a>
          <a href="#resumes" className="hover:underline">Resumes</a>
          <a href="#login" className="hover:underline">Login</a>
          <a href="#signup" className="hover:underline">Signup</a>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col md:flex-row items-center justify-center px-8 py-12 gap-12">
        {/* Left: Headline and Text */}
        <div className="max-w-xl">
          <h1 className="text-5xl md:text-6xl font-light mb-6 leading-tight text-gray-900">
            An online file cabinet<br />for your resumes.
          </h1>
          <p className="text-xl text-gray-800">
            Resumeganizer helps job seekers organize and track different versions of their resume when applying to multiple roles. An online file cabinet for your resumes. Keep every version organized and in one place.
          </p>
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