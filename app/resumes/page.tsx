'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, onSnapshot, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ResumeCategory } from '@/types'
import { createCategory, updateCategoryName, deleteCategory } from '@/lib/resumeUtils'

const categoryColors = [
  'bg-[#0061FE]', // Software Development
  'bg-[#F000F0]', // Project Management
  'bg-[#FE9D00]', // Hostel/Farm Work
  'bg-[#00FE1E]', // Master
]

export default function ResumesPage() {
  const [categories, setCategories] = useState<ResumeCategory[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
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
    router.push(`/resumes/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`)
  }

  const handleAddCategory = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmed = newCategory.trim()
    if (!trimmed) return
    setLoading(true)
    try {
      await createCategory(trimmed)
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
  }

  const handleSaveEdit = async (cat: ResumeCategory) => {
    const trimmed = editValue.trim()
    if (!trimmed || trimmed === cat.name) {
      setEditingId(null)
      return
    }
    setLoading(true)
    try {
      await updateCategoryName(cat.id, trimmed)
      setEditingId(null)
    } catch (err) {
      alert('Failed to update category. Please try again.')
    } finally {
      setLoading(false)
    }
  }

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
            <div key={cat.id} className="relative w-full">
              {editingId === cat.id ? (
                <form
                  onSubmit={e => { e.preventDefault(); handleSaveEdit(cat) }}
                  className={`w-full flex items-center gap-2 rounded-t-[48px] rounded-b-[48px] bg-white border-2 border-blue-300 py-4 px-8`}
                >
                  <input
                    type="text"
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-xl text-gray-700"
                    autoFocus
                    disabled={loading}
                  />
                  <button
                    type="button"
                    className="text-gray-500 px-3 py-1 rounded hover:text-gray-700"
                    onClick={() => setEditingId(null)}
                    disabled={loading}
                  >Cancel</button>
                  <button
                    type="submit"
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                    disabled={loading}
                  >Save</button>
                </form>
              ) : (
                <div
                  role="button"
                  tabIndex={0}
                  className={`w-full rounded-t-[48px] rounded-b-[48px] ${categoryColors[i % categoryColors.length]} text-white text-2xl font-medium py-6 px-8 shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-between`}
                  style={{ zIndex: categories.length - i }}
                  onClick={() => handleCategoryClick(cat)}
                  onKeyPress={e => { if (e.key === 'Enter') handleCategoryClick(cat) }}
                >
                  <span>{cat.name}</span>
                  <span className="flex gap-2 ml-4">
                    <button
                      type="button"
                      className="text-white/80 hover:text-white"
                      onClick={e => { e.stopPropagation(); handleEditCategory(cat) }}
                    >Edit</button>
                    <button
                      type="button"
                      className="text-white/80 hover:text-red-200"
                      onClick={e => { e.stopPropagation(); handleDeleteCategory(cat) }}
                    >Delete</button>
                  </span>
                </div>
              )}
            </div>
          ))}
          {isAdding ? (
            <form onSubmit={handleAddCategory} className="w-full flex items-center gap-2 rounded-t-[48px] rounded-b-[48px] bg-white border-2 border-dashed border-gray-300 py-4 px-8 mt-2">
              <input
                type="text"
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                placeholder="Category name"
                className="flex-1 bg-transparent outline-none text-xl text-gray-700"
                autoFocus
                disabled={loading}
              />
              <button
                type="button"
                className="text-gray-500 px-3 py-1 rounded hover:text-gray-700"
                onClick={() => { setIsAdding(false); setNewCategory('') }}
                disabled={loading}
              >Cancel</button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                disabled={loading}
              >{loading ? 'Adding...' : 'Add'}</button>
            </form>
          ) : (
            <button
              className="w-full rounded-t-[48px] rounded-b-[48px] bg-white text-gray-700 text-2xl font-medium py-6 px-8 border-2 border-dashed border-gray-300 mt-2 hover:bg-gray-50 transition"
              onClick={() => setIsAdding(true)}
            >
              Add a Resume Category
            </button>
          )}
        </div>
      </main>
    </div>
  )
} 