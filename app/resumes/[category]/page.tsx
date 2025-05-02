"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Resume } from '@/types'
import { UploadResume } from '@/components/UploadResume'
import { ResumeList } from '@/components/ResumeList'
import Link from 'next/link'

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params?.category as string
  const [categoryName, setCategoryName] = useState('')
  const [resumes, setResumes] = useState<Resume[]>([])

  // Convert slug to display name (e.g., software-development -> Software Development)
  useEffect(() => {
    if (categorySlug) {
      setCategoryName(
        categorySlug
          .split('-')
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(' ')
      )
    }
  }, [categorySlug])

  // Fetch resumes for this category
  useEffect(() => {
    if (!categoryName) return
    const q = query(
      collection(db, 'resumes'),
      where('category', '==', categoryName),
      orderBy('updatedAt', 'desc')
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const resumesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Resume[]
      setResumes(resumesData)
    })
    return () => unsubscribe()
  }, [categoryName])

  return (
    <div className="min-h-screen bg-[#F6F5F5] flex flex-col">
      {/* Navigation Bar */}
      <nav className="flex items-center justify-between bg-white rounded-xl mt-6 mx-8 px-8 py-4 shadow-sm">
        <span className="text-2xl font-medium text-gray-900">Resumeganizer</span>
        <div className="flex gap-8 text-lg font-normal text-gray-900">
          <Link href="/landing#about" className="hover:underline">About</Link>
          <Link href="/resumes" className="hover:underline">Resumes</Link>
          <Link href="/landing#login" className="hover:underline">Login</Link>
          <Link href="/landing#signup" className="hover:underline">Signup</Link>
        </div>
      </nav>

      {/* Main Content Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-5xl bg-white rounded-[48px] border-4 border-[#0061FE] p-8 md:p-12 flex flex-col items-center shadow-lg">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-6">{categoryName}</h2>
          <div className="w-full border-b-2 border-[#0061FE] mb-8"></div>
          {/* Resume Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {resumes.map((resume) => (
              <div key={resume.id} className="bg-gray-100 rounded-xl p-4 flex flex-col gap-2 shadow">
                <div className="font-semibold text-lg truncate">{resume.fileName}</div>
                <div className="text-sm text-gray-700">Company: {resume.company || '-'}</div>
                <div className="text-sm text-gray-700">Position: {resume.jobTitle || '-'}</div>
                <div className="text-sm text-gray-700">Updated: {resume.updatedAt ? resume.updatedAt.toLocaleDateString() : '-'}</div>
                <div className="text-sm text-gray-700">Notes: {resume.notes || '-'}</div>
                <div className="text-sm text-gray-700">Status: {resume.status || '-'}</div>
                {/* TODO: Add edit/delete buttons here if needed */}
              </div>
            ))}
            {/* Upload Card */}
            <div className="flex flex-col items-center justify-center border border-gray-400 bg-white rounded-xl p-8 min-h-[200px] min-w-[200px] shadow cursor-pointer hover:border-blue-400 transition">
              <UploadResume categoryId={categoryName} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 