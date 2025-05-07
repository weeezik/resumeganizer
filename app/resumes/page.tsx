'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ResumeCategory, Resume } from '@/types'
import { createCategory, updateCategoryName, deleteCategory } from '@/lib/resumeUtils'
import { useAuth } from '@/context/AuthContext'
import RequireAuth from '@/components/RequireAuth'
import { ResumeList } from '@/components/ResumeList'
import { UploadResume } from '@/components/UploadResume'

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
        <aside className="w-80 bg-white border-r flex flex-col p-6 gap-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-semibold">Categories</span>
            <button
              className="text-blue-600 hover:underline text-sm"
              onClick={() => setShowAll(true)}
            >View All</button>
          </div>
          <div className="mb-4">
            <label className="block text-xs text-gray-500 mb-1">Sort by</label>
            <select
              className="w-full p-2 border rounded"
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 overflow-y-auto">
            {categories.map(cat => (
              <button
                key={cat.id}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg mb-1 transition text-left ${selectedCategory === cat.id && !showAll ? 'bg-blue-50' : 'hover:bg-gray-100'}`}
                onClick={() => { setSelectedCategory(cat.id); setShowAll(false); }}
              >
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: cat.color }} />
                <span className="flex-1 truncate">{cat.name}</span>
              </button>
            ))}
          </div>
          <button
            className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg"
            onClick={() => setIsAdding(true)}
          >+ Add Resume Category</button>
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
                        <ResumeCard key={resume.id} resume={resume} />
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
              <UploadResume categoryId={selectedCategory} />
              {resumes.length === 0 ? (
                <div className="mt-8 flex flex-col items-center justify-center border-2 border-dashed bg-white rounded-2xl p-8 min-h-[220px] min-w-[220px] shadow-md transition cursor-pointer hover:border-blue-400">
                  <span className="text-gray-500 text-lg">No resumes yet. Add your first resume!</span>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                  {resumes.map(resume => (
                    <ResumeCard key={resume.id} resume={resume} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="text-2xl text-gray-400 mb-4">Select a category to view resumes</div>
              <button
                className="bg-blue-600 text-white px-6 py-3 rounded-full shadow hover:bg-blue-700"
                onClick={() => setIsAdding(true)}
              >+ Add Resume Category</button>
            </div>
          )}
        </main>
      </div>
    </RequireAuth>
  )
}

// Helper ResumeCard for preview (simplified, you can expand as needed)
function ResumeCard({ resume }: { resume: Resume }) {
  return (
    <div className="bg-white rounded-xl shadow p-4 flex flex-col gap-2 border-t-4" style={{ borderTopColor: '#0061FE' }}>
      <div className="font-semibold text-lg truncate">{resume.fileName}</div>
      <div className="text-sm text-gray-600 truncate">{resume.company} — {resume.jobTitle}</div>
      <div className="text-xs text-gray-400">Updated: {resume.updatedAt?.toLocaleDateString()}</div>
      <a href={resume.fileUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm mt-2">View</a>
    </div>
  )
} 