'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { collection, onSnapshot, doc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { ResumeCategory } from '@/types'
import { createCategory, updateCategoryName, deleteCategory } from '@/lib/resumeUtils'
import { useAuth } from '@/context/AuthContext'
import RequireAuth from '@/components/RequireAuth'

const categoryColors = [
  '#0061FE', // Software Development
  '#F000F0', // Project Management
  '#FE9D00', // Hostel/Farm Work
  '#00FE1E', // Master's Degree
  '#cd9552', // Bachelor's Degree
  '#e8a827', // High School Diploma
  '#33e1b2', // Other
]

export default function ResumesPage() {
  const [categories, setCategories] = useState<ResumeCategory[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [newCategory, setNewCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [editColor, setEditColor] = useState<string>('');
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

  const handleCategoryClick = (category: ResumeCategory) => {
    router.push(`/resumes/${encodeURIComponent(category.name.toLowerCase().replace(/\s+/g, '-'))}`)
  }

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
      <div className="min-h-screen bg-[#F6F5F5] flex flex-col">

        {/* Category Cards */}
        <main className="flex-1 flex flex-col items-center justify-start px-8 py-12">
          <div className="w-full max-w-2xl flex flex-col gap-6 mt-8">
            {categories.length === 0 && (
              <div className="text-center text-gray-500 text-lg">No categories yet.</div>
            )}
            {categories.map((cat, i) => {
              // Only needed inside the edit form
              const usedColors = categories.filter(c => c.id !== cat.id).map(c => c.color);
              const availableColors = categoryColors.filter(color => !usedColors.includes(color) || color === editColor);

              return (
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
                      <div className="flex gap-2">
                        {availableColors.map(color => (
                          <button
                            key={color}
                            type="button"
                            className={`w-8 h-8 rounded-full border-2 ${editColor === color ? 'border-black' : 'border-gray-300'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setEditColor(color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
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
                      className="w-full rounded-t-[48px] rounded-b-[48px] text-white text-2xl font-medium py-6 px-8 shadow-lg transition-transform hover:scale-[1.03] focus:outline-none focus:ring-2 focus:ring-blue-400 flex items-center justify-between"
                      style={{ backgroundColor: cat.color, zIndex: categories.length - i }}
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
              );
            })}
            {isAdding ? (
              <form onSubmit={handleAddCategory} className="w-full flex flex-col md:flex-row items-center gap-2 rounded-t-[48px] rounded-b-[48px] bg-white border-2 border-dashed border-gray-300 py-4 px-8 mt-2">
                <div className="flex flex-1 flex-col md:flex-row items-center gap-2 w-full">
                  <input
                    type="text"
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    placeholder="Category name"
                    className="flex-1 bg-transparent outline-none text-xl text-gray-700"
                    autoFocus
                    disabled={loading}
                  />
                  <div className="flex gap-2">
                    {categoryColors.map(color => (
                      <button
                        key={color}
                        type="button"
                        className={`w-8 h-8 rounded-full border-2 ${selectedColor === color ? 'border-black' : 'border-gray-300'}`}
                        style={{ backgroundColor: color }}
                        onClick={() => setSelectedColor(color)}
                        aria-label={`Select color ${color}`}
                      />
                    ))}
                  </div>
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
                </div>
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
    </RequireAuth>
  )
} 