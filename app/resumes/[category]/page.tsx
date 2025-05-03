"use client"

import React, { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Resume } from '@/types'
import { UploadResume } from '@/components/UploadResume'
import { ResumeList } from '@/components/ResumeList'
import Link from 'next/link'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'
import { updateResumeDetails, deleteResume } from '@/lib/resumeUtils'
import Navbar from '@/components/Navbar'

export default function CategoryPage() {
  const params = useParams()
  const categorySlug = params?.category as string
  const [categoryName, setCategoryName] = useState('')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    company: '',
    jobTitle: '',
    status: 'not applied',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [categoryColor, setCategoryColor] = useState('#0061FE')

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

  useEffect(() => {
    if (!categoryName) return;
    // Fetch the category color from Firestore
    const q = query(
      collection(db, 'categories'),
      where('name', '==', categoryName)
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (!snapshot.empty) {
        const data = snapshot.docs[0].data();
        setCategoryColor(data.color || '#0061FE');
      }
    });
    return () => unsubscribe();
  }, [categoryName]);

  const accentColor = categoryColor;

  const handleEdit = (resume: Resume) => {
    setEditingId(resume.id)
    setEditForm({
      company: resume.company || '',
      jobTitle: resume.jobTitle || '',
      status: resume.status || 'not applied',
      notes: resume.notes || '',
    })
  }

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditForm(prev => ({ ...prev, [name]: value }))
  }

  const handleEditSave = async (resume: Resume) => {
    setLoading(true)
    try {
      await updateResumeDetails(resume.id, {
        ...editForm,
        status: editForm.status as Resume['status'],
      })
      setEditingId(null)
    } catch (error) {
      console.error('Error saving edit:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
  }

  const handleDelete = async (resume: Resume) => {
    setLoading(true)
    try {
      await deleteResume(resume.id)
    } catch (error) {
      console.error('Error deleting resume:', error)
    } finally {
      setLoading(false)
    }
  }

  const previewedResume = resumes.find(r => r.fileUrl === previewUrl);

  return (
    <div className="min-h-screen bg-[#F6F5F5] flex flex-col">
      {/* Navigation Bar */}
      <Navbar />

      {/* Main Content Box */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12 bg-gradient-to-br from-[#f6f8fc] to-[#e9ecf3]">
        <div
          className="w-full max-w-5xl bg-white rounded-3xl border-2 shadow-xl p-8 md:p-12 flex flex-col items-center"
          style={{ borderColor: accentColor }}
        >
          <h2 className="text-4xl font-extrabold text-center mb-6 text-gray-900 tracking-tight" style={{ letterSpacing: '-0.01em' }}>
            {categoryName}
          </h2>
          <div className="w-full border-b-2 mb-8" style={{ borderColor: accentColor }}></div>
          {/* Resume Grid */}
          <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-8 mb-8 items-stretch">
            {resumes.map((resume) => (
              <div
                key={resume.id}
                className="bg-gray-50 rounded-2xl p-6 flex flex-col shadow-md transition-transform hover:-translate-y-1 hover:shadow-lg border-t-4"
                style={{ borderTopColor: accentColor }}
              >
                {editingId === resume.id ? (
                  <form onSubmit={e => { e.preventDefault(); handleEditSave(resume) }} className="flex flex-col gap-2">
                    <input
                      name="company"
                      value={editForm.company}
                      onChange={handleEditChange}
                      className="p-2 rounded border border-gray-300 placeholder-gray-400 text-gray-900"
                      placeholder="Company"
                      disabled={loading}
                    />
                    <input
                      name="jobTitle"
                      value={editForm.jobTitle}
                      onChange={handleEditChange}
                      className="p-2 rounded border border-gray-300 placeholder-gray-400 text-gray-900"
                      placeholder="Job Title"
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
                      placeholder="Notes"
                      rows={2}
                      disabled={loading}
                    />
                    <div className="flex gap-2 mt-auto pt-2">
                      <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={handleEditCancel} disabled={loading}>Cancel</button>
                      <button type="submit" className="px-2 py-1 rounded bg-blue-500 hover:bg-blue-600 text-white" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="font-semibold text-lg truncate text-gray-900">{resume.fileName}</div>
                    <div className="text-base text-gray-800">Company: <span className="font-normal">{resume.company || '-'}</span></div>
                    <div className="text-base text-gray-800">Position: <span className="font-normal">{resume.jobTitle || '-'}</span></div>
                    <div className="text-base text-gray-800">Updated: <span className="font-normal">{resume.updatedAt ? resume.updatedAt.toLocaleDateString() : '-'}</span></div>
                    <div className="text-base text-gray-800">Notes: <span className="font-normal">{resume.notes || '-'}</span></div>
                    <div className="text-base text-gray-800">Status: <span className="font-normal">{resume.status || '-'}</span></div>
                    <div className="flex gap-2 mt-auto pt-2">
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:text-blue-800 text-sm rounded transition"
                        onClick={() => handleEdit(resume)}
                      >
                        <PencilIcon className="w-4 h-4" /> Edit
                      </button>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-red-500 hover:text-red-700 text-sm rounded transition"
                        onClick={() => handleDelete(resume)}
                      >
                        <TrashIcon className="w-4 h-4" /> Delete
                      </button>
                      <button
                        className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 text-sm rounded transition"
                        onClick={() => setPreviewUrl(resume.fileUrl)}
                      >
                        Preview
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {/* Upload Card */}
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed bg-white rounded-2xl p-8 min-h-[220px] min-w-[220px] shadow-md transition cursor-pointer hover:border-blue-400"
              style={{ borderColor: accentColor }}
            >
              <UploadResume categoryId={categoryName} />
            </div>
          </div>
        </div>
      </main>

      {previewUrl && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  {previewedResume?.company || '-'}
                </span>
                <span className="text-gray-700 text-sm">
                  {previewedResume?.jobTitle || '-'}
                </span>
                <span className="text-gray-500 text-xs">
                  Updated: {previewedResume?.updatedAt ? previewedResume.updatedAt.toLocaleDateString() : '-'}
                </span>
              </div>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => setPreviewUrl(null)}
              >
                Close
              </button>
            </div>
            <iframe
              src={previewUrl.endsWith('.pdf')
                ? previewUrl
                : `https://docs.google.com/gview?url=${encodeURIComponent(previewUrl)}&embedded=true`}
              title="Document Preview"
              className="flex-1 w-full rounded"
              style={{ minHeight: '60vh' }}
            />
          </div>
        </div>
      )}
    </div>
  )
} 