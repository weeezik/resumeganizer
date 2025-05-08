'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ResumeCategory, Resume } from '@/types'
import { createCategory, updateCategoryName, deleteCategory, updateResumeDetails, deleteResume } from '@/lib/resumeUtils'
import { useAuth } from '@/context/AuthContext'
import RequireAuth from '@/components/RequireAuth'
import { ResumeList } from '@/components/ResumeList'
import { UploadResume } from '@/components/UploadResume'
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline'

const categoryColors = [
  '#0061FE', // Software Development
  '#F000F0', // Project Management
  '#FE9D00', // Hostel/Farm Work
  '#00FE1E', // Master's Degree
  '#cd9552', // Bachelor's Degree
  '#33e1b2', // Other
]

const SORT_OPTIONS = [
  { label: 'Date', value: 'date' },
  { label: 'Alphabetical', value: 'alpha' },
]

export default function ResumesPage() {
  const [categories, setCategories] = useState<ResumeCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState('date')
  const [resumes, setResumes] = useState<Resume[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
  const [showAll, setShowAll] = useState(false)
  const [showColorModal, setShowColorModal] = useState(false);
  const [colorModalForId, setColorModalForId] = useState<string | null>(null);
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (!user) {
      router.replace('/auth')
    }
  }, [user, router])

  useEffect(() => {
    if (!user) return
    const q = query(
      collection(db, 'categories'),
      where('userId', '==', user.uid)
    )
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const categoriesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ResumeCategory[]
      setCategories(categoriesData)
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    if (!user) return
    let q
    if (showAll) {
      q = query(collection(db, 'resumes'), where('userId', '==', user.uid))
    } else if (selectedCategory) {
      q = query(collection(db, 'resumes'), where('userId', '==', user.uid), where('category', '==', selectedCategory))
    } else {
      setResumes([])
      return
    }
    const unsubscribe = onSnapshot(q, (snapshot) => {
      let resumesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
        updatedAt: doc.data().updatedAt?.toDate(),
      })) as Resume[]
      if (sortBy === 'date') {
        resumesData = resumesData.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      } else {
        resumesData = resumesData.sort((a, b) => (a.company || '').localeCompare(b.company || ''))
      }
      setResumes(resumesData)
    })
    return () => unsubscribe()
  }, [user, selectedCategory, showAll, sortBy])

  const handleAddCategory = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = newCategory.trim()
    if (!trimmed || !selectedColor) {
      alert('Please enter a name and select a color.');
      return;
    }
    if (!user) return;
    setLoading(true)
    try {
      await createCategory(trimmed, selectedColor, user.uid)
      setNewCategory('')
      setIsAdding(false)
    } catch (err) {
      alert('Failed to add category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleEditCategory = (cat: ResumeCategory) => {
    setEditingId(cat.id)
    setEditValue(cat.name)
    setEditColor(cat.color)
  }

  const handleSaveEdit = async (cat: ResumeCategory) => {
    const trimmed = editValue.trim();
    if (!trimmed || !editColor) {
      alert('Please enter a name and select a color.');
      return;
    }
    setLoading(true);
    try {
      await updateCategoryName(cat.id, trimmed, editColor);
      setEditingId(null);
    } catch (err) {
      alert('Failed to update category. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (cat: ResumeCategory) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return
    setLoading(true)
    try {
      await deleteCategory(cat.id)
    } catch (err) {
      alert('Failed to delete category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <RequireAuth>
      <div className="min-h-screen bg-[#F6F5F5] flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white rounded-r-lg shadow-md flex flex-col p-6 gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Categories</span>
            <button
              className="flex items-center gap-1 px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full font-medium text-sm shadow-sm hover:bg-blue-100 transition"
              onClick={() => setShowAll(true)}
            >
              View All
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Sort by</label>
            <div className="relative">
              <select
                className="w-full appearance-none bg-gray-50 border border-gray-300 rounded-lg py-2 pl-3 pr-10 text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              {/* Chevron Icon */}
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto flex flex-col">
            {categories.map(cat => (
              <div
                key={cat.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition text-left ${selectedCategory === cat.id && !showAll ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                style={{ cursor: 'pointer' }}
                onClick={() => { if (editingId !== cat.id) { setSelectedCategory(cat.id); setShowAll(false); } }}
              >
                {editingId === cat.id ? (
                  // Edit mode
                  <form
                    className="flex-1 flex items-center gap-2 relative"
                    onSubmit={e => { e.preventDefault(); handleSaveEdit(cat); }}
                    onClick={e => e.stopPropagation()}
                  >
                    <input
                      type="text"
                      value={editValue}
                      onChange={e => setEditValue(e.target.value)}
                      className="flex-1 p-1 border rounded text-sm"
                      placeholder="Category name"
                      autoFocus
                    />
                    <button
                      type="button"
                      className="w-6 h-6 rounded-full border-2 border-gray-300"
                      style={{ backgroundColor: editColor }}
                      onClick={() => setColorModalForId(cat.id)}
                      aria-label="Select color"
                    />
                    {colorModalForId === cat.id && (
                      <div className="absolute left-0 top-10 z-50 bg-white rounded shadow p-2 border" style={{ minWidth: 160 }}>
                        <div className="grid grid-cols-6 gap-1 mb-2">
                          {categoryColors.map(color => (
                            <button
                              key={color}
                              type="button"
                              className={`w-6 h-6 rounded border-2 ${editColor === color ? 'border-black' : 'border-gray-300'} hover:border-blue-500 transition`}
                              style={{ backgroundColor: color }}
                              onClick={() => {
                                setEditColor(color);
                                setShowColorModal(false);
                              }}
                              aria-label={`Select color ${color}`}
                            />
                          ))}
                        </div>
                        <div className="flex justify-end">
                          <button
                            type="button"
                            className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                            onClick={() => setColorModalForId(null)}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    )}
                    <button
                      type="submit"
                      className="px-2 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      className="px-2 py-1 text-xs bg-gray-200 rounded hover:bg-gray-300"
                      onClick={() => setEditingId(null)}
                    >
                      Cancel
                    </button>
                  </form>
                ) : (
                  // View mode
                  <>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                    <span className="flex-1 truncate">{cat.name}</span>
                    <button
                      className="p-1 text-gray-400 hover:text-blue-600"
                      onClick={e => { e.stopPropagation(); handleEditCategory(cat); }}
                      aria-label={`Edit ${cat.name}`}
                    >
                      <PencilIcon className="w-4 h-4" />
                    </button>
                    <button
                      className="p-1 text-gray-400 hover:text-red-500"
                      onClick={e => { e.stopPropagation(); handleDeleteCategory(cat); }}
                      aria-label={`Delete ${cat.name}`}
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </>
                )}
              </div>
            ))}
            {!isAdding && (
              <button
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
                onClick={() => setIsAdding(true)}
              >
                + Add Resume Category
              </button>
            )}
            {isAdding && (
              <form
                onSubmit={handleAddCategory}
                className="mt-2 flex flex-col gap-2 bg-gray-50 p-3 rounded-lg border"
              >
                <input
                  type="text"
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value)}
                  placeholder="Category name"
                  className="p-2 border rounded"
                  autoFocus
                  disabled={loading}
                />
                <div className="flex gap-2">
                  {categoryColors.map(color => (
                    <button
                      key={color}
                      type="button"
                      className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-black' : 'border-gray-300'}`}
                      style={{ backgroundColor: color }}
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Select color ${color}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    className="px-3 py-1 text-gray-600 hover:text-gray-800"
                    onClick={() => { setIsAdding(false); setNewCategory('') }}
                    disabled={loading}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={loading}
                  >Add</button>
                </div>
              </form>
            )}
          </div>
        </aside>
        {/* Main Content */}
        <main className="flex-1 p-10 overflow-y-auto">
          {showAll ? (
            <div>
              <h2 className="text-2xl font-bold mb-6">All Resumes</h2>
              {categories.map(cat => {
                const catResumes = resumes.filter(r => r.category === cat.id)
                if (catResumes.length === 0) return null
                return (
                  <div key={cat.id} className="mb-8">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span className="font-semibold text-lg">{cat.name}</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {catResumes.map(resume => (
                        <ResumeCard
                          key={resume.id}
                          resume={resume}
                          color={cat.color}
                        />
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : selectedCategory ? (
            <div>
              <div className="flex items-center gap-2 mb-6">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: categories.find(c => c.id === selectedCategory)?.color }} />
                <h2 className="text-2xl font-bold">{categories.find(c => c.id === selectedCategory)?.name}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {resumes.map(resume => {
                  const category = categories.find(c => c.id === resume.category);
                  return (
                    <ResumeCard
                      key={resume.id}
                      resume={resume}
                      color={category?.color || '#0061FE'}
                    />
                  );
                })}
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-400 rounded-xl bg-white p-4 min-h-[220px] min-w-[220px] shadow-md transition">
                  <UploadResume categoryId={selectedCategory} />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-2xl text-gray-400 mb-4">Select a category to view resumes</div>
              {!isAdding && (
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700"
                  onClick={() => setIsAdding(true)}
                >+ Add Resume Category</button>
              )}
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  )
}

// Helper ResumeCard for preview (simplified, you can expand as needed)
function ResumeCard({ resume, color }: { resume: Resume, color: string }) {
  const [editing, setEditing] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    company: resume.company || '',
    jobTitle: resume.jobTitle || '',
    status: resume.status || 'not applied',
    notes: resume.notes || '',
  });
  const [loading, setLoading] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [showModal, setShowModal] = React.useState(false);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditForm(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSave = async () => {
    setLoading(true);
    try {
      await updateResumeDetails(resume.id, {
        ...editForm,
        status: editForm.status as Resume['status'],
      });
      setEditing(false);
    } catch (error) {
      alert('Error saving edit.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this resume?')) return;
    setLoading(true);
    try {
      await deleteResume(resume.id);
    } catch (error) {
      alert('Error deleting resume.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border-t-4"
      style={{ borderTopColor: color }}
    >
      {editing ? (
        <form onSubmit={e => { e.preventDefault(); handleEditSave(); }} className="flex flex-col gap-2">
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
            <button type="button" className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700" onClick={() => setEditing(false)} disabled={loading}>Cancel</button>
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
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 text-red-500 hover:text-red-700 text-sm rounded transition"
              onClick={handleDelete}
            >
              Delete
            </button>
            <button
              className="flex items-center gap-1 px-2 py-1 text-green-600 hover:text-green-800 text-sm rounded transition"
              onClick={() => setShowModal(true)}
            >
              View
            </button>
          </div>
        </>
      )}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-3xl w-full h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <div className="flex flex-col">
                <span className="font-semibold text-gray-900">
                  {resume.company || '-'}
                </span>
                <span className="text-gray-700 text-sm">
                  {resume.jobTitle || '-'}
                </span>
                <span className="text-gray-500 text-xs">
                  Updated: {resume.updatedAt ? resume.updatedAt.toLocaleDateString() : '-'}
                </span>
              </div>
              <button
                className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
            </div>
            <iframe
              src={resume.fileUrl.endsWith('.pdf')
                ? resume.fileUrl
                : `https://docs.google.com/gview?url=${encodeURIComponent(resume.fileUrl)}&embedded=true`}
              title="Document Preview"
              className="flex-1 w-full rounded"
              style={{ minHeight: '60vh' }}
            />
          </div>
        </div>
      )}
    </div>
  );
} 