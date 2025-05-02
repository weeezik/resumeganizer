"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Resume } from '@/types'
import { UploadResume } from '@/components/UploadResume'
import Link from 'next/link'
import { PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { updateResumeDetails, deleteResume } from '@/lib/resumeUtils'
// import { Document, Page, pdfjs } from 'react-pdf'
// Set workerSrc to the local file in the public directory
// pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
//pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params?.category as string
  const [categoryName, setCategoryName] = useState('')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<any>({})
  const [loading, setLoading] = useState(false)

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

  // File cabinet color accent
  const accentColor = '#0061FE'

  const handleEdit = (resume: Resume) => {
    setEditingId(resume.id)
    setEditForm({
      company: resume.company || '',
      jobTitle: resume.jobTitle || '',
      notes: resume.notes || '',
      status: resume.status || 'not applied',
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value })
  }

  const handleEditSave = async (resume: Resume) => {
    setLoading(true)
    try {
      await updateResumeDetails(resume.id, editForm)
      setEditingId(null)
    } catch (err) {
      alert('Failed to update resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  const handleDelete = async (resume: Resume) => {
    if (!window.confirm('Delete this resume? This cannot be undone.')) return
    setLoading(true)
    try {
      await deleteResume(resume.id)
    } catch (err) {
      alert('Failed to delete resume. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
        <div className="w-full max-w-5xl bg-white rounded-[48px] border-4" style={{ borderColor: accentColor }}>
          <div className="flex flex-col items-center p-8 md:p-12">
            <h2 className="text-4xl font-bold text-gray-900 text-center mb-2 tracking-tight" style={{ letterSpacing: '-0.01em' }}>{categoryName}</h2>
            <div className="w-full border-b-2" style={{ borderColor: accentColor }}></div>
          </div>
          {/* Resume Grid as file cabinet drawers */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 px-8 pb-12">
            {resumes.map((resume, idx) => (
              <div
                key={resume.id}
                className="relative bg-gray-50 rounded-2xl shadow-md flex flex-row gap-6 p-6 pt-10 transition-transform hover:-translate-y-2 hover:shadow-xl border-t-8 items-start"
                style={{ borderTopColor: accentColor, marginTop: idx ? '-24px' : '0' }}
              >
                {/* File tab */}
                <div className="absolute -top-6 left-6 bg-[#F6F5F5] px-4 py-1 rounded-t-lg border-2" style={{ borderColor: accentColor }}>
                  <span className="text-sm font-semibold text-gray-700">Resume</span>
                </div>
                {/* PDF Thumbnail + Filename */}
                <div className="flex flex-col items-center min-w-[120px] max-w-[120px]">
                  <div className="w-[120px] h-[150px] bg-gray-300 rounded mb-2 flex items-center justify-center overflow-hidden">
                    {resume.fileUrl && resume.fileName?.toLowerCase().endsWith('.pdf') ? (
                      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                        <rect width="48" height="48" rx="8" fill="#6b7280" />
                        <text x="50%" y="60%" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" dy=".3em">PDF</text>
                      </svg>
                    ) : resume.fileUrl && (resume.fileName?.toLowerCase().endsWith('.doc') || resume.fileName?.toLowerCase().endsWith('.docx')) ? (
                      <svg width="48" height="48" fill="none" viewBox="0 0 48 48">
                        <rect width="48" height="48" rx="8" fill="#2563eb" />
                        <text x="50%" y="60%" textAnchor="middle" fill="#fff" fontSize="18" fontWeight="bold" dy=".3em">DOC</text>
                      </svg>
                    ) : null}
                  </div>
                  <div className="text-xs text-gray-700 truncate w-full text-center">{resume.fileName}</div>
                </div>
                {/* Details and Actions */}
                <div className="flex-1 flex flex-col justify-between min-h-[150px]">
                  {editingId === resume.id ? (
                    <form onSubmit={e => { e.preventDefault(); handleEditSave(resume) }} className="flex flex-col gap-2">
                      <input
                        name="company"
                        value={editForm.company}
                        onChange={handleEditChange}
                        className="p-2 rounded border border-gray-300 placeholder-gray-400 text-gray-900"
                        placeholder="Enter company name"
                        disabled={loading}
                      />
                      <input
                        name="jobTitle"
                        value={editForm.jobTitle}
                        onChange={handleEditChange}
                        className="p-2 rounded border border-gray-300 placeholder-gray-400 text-gray-900"
                        placeholder="Enter job position"
                        disabled={loading}
                      />
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange}
                        className="p-2 rounded border border-gray-300 text-gray-900"
                        disabled={loading}
                      >
                        <option value="not applied">Not Applied</option>
                        <option value="applied">Applied</option>
                        <option value="interviewed">Interviewed</option>
                        <option value="got an offer">Got an Offer</option>
                      </select>
                      <textarea
                        name="notes"
                        value={editForm.notes}
                        onChange={handleEditChange}
                        className="p-2 rounded border border-gray-300 placeholder-gray-400 text-gray-900"
                        placeholder="Add any notes about this application..."
                        rows={2}
                        disabled={loading}
                      />
                      <div className="flex gap-2 mt-2">
                        <button type="button" className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handleEditCancel} disabled={loading}>Cancel</button>
                        <button type="submit" className="px-3 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <div className="text-sm text-gray-700 mb-1">Company: {resume.company || '-'}</div>
                      <div className="text-sm text-gray-700 mb-1">Position: {resume.jobTitle || '-'}</div>
                      <div className="text-sm text-gray-700 mb-1">Updated: {resume.updatedAt ? resume.updatedAt.toLocaleDateString() : '-'}</div>
                      <div className="text-sm text-gray-700 mb-1">Notes: {resume.notes || '-'}</div>
                      <div className="text-sm text-gray-700 mb-3">Status: {resume.status || '-'}</div>
                      <div className="flex gap-2 mt-auto">
                        <button className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 text-sm rounded transition" onClick={() => handleEdit(resume)}>
                          <PencilIcon className="w-4 h-4" /> Edit
                        </button>
                        <button className="flex items-center gap-1 px-2 py-1 text-red-500 hover:text-red-700 text-sm rounded transition" onClick={() => handleDelete(resume)}>
                          <TrashIcon className="w-4 h-4" /> Delete
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
            {/* Upload Card */}
            <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 bg-white rounded-2xl p-8 min-h-[220px] min-w-[220px] shadow-md hover:border-blue-400 transition cursor-pointer">
              <div className="flex flex-col items-center gap-2">
                <PlusIcon className="w-8 h-8 text-gray-400 mb-2" />
                <span className="font-semibold text-gray-700 text-lg">New Resume</span>
                <span className="text-sm text-gray-500 mb-2">Drag or upload</span>
              </div>
              <UploadResume categoryId={categoryName} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 