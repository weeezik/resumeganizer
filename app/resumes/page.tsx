'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ResumeCategory } from '@/types'

const categoryColors = [
  'bg-[#0061FE]', // Software Development
  'bg-[#F000F0]', // Project Management
  'bg-[#FE9D00]', // Hostel/Farm Work
  'bg-[#00FE1E]', // Master
]

export default function ResumesPage() {
  const [categories, setCategories] = useState<ResumeCategory[]>([])
  const router = useRouter()

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ResumeCategory[]
      setCategories(categoriesData)
    })
    return () => unsubscribe()
  }, [])

  const handleCategoryClick = (category: ResumeCategory) => {
    // Route to category-specific page (e.g., /resumes/software-development)
    router.push(`/resumes/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`)
  }

  return (
    <div className="min-h-screen bg-[#F6F5F5] flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between bg-white rounded-xl mt-6 mx-8 px-8 py-4 shadow-sm">
        <span className="text-2xl font-medium text-gray-900">Resumeganizer</span>
        <div className="flex gap-8 text-lg font-normal text-gray-900">
          <a href="/landing#about" className="hover:underline">About</a>
          <Link href="/resumes" className="hover:underline">Resumes</Link>
          <a href="/landing#login" className="hover:underline">Login</a>
          <a href="/landing#signup" className="hover:underline">Signup</a>
        </div>
      </nav>

      {/* Category Cards */}
      <main className="flex-1 flex flex-col items-center justify-start px-8 py-12">
        <div className="w-full max-w-2xl flex flex-col gap-6 mt-8">
          {categories.length === 0 && (
            <div className="text-center text-gray-500 text-lg">No categories yet.</div>
          )}
          {categories.map((cat, i) => (
            <button
              key={cat.id}
              className={`w-full rounded-t-[48px] rounded-b-[48px] ${categoryColors[i % categoryColors.length]} text-white text-2xl font-medium py-6 px-8 shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400`}
              style={{ zIndex: categories.length - i }}
              onClick={() => handleCategoryClick(cat)}
            >
              {cat.name}
            </button>
          ))}
          <button className="w-full rounded-t-[48px] rounded-b-[48px] bg-white text-gray-700 text-2xl font-medium py-6 px-8 border-2 border-dashed border-gray-300 mt-2 hover:bg-gray-50 transition">
            Add a Resume Category
          </button>
        </div>
      </main>
    </div>
  )
} 