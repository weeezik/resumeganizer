'use client'

import { useState, useEffect } from 'react'
import { collection, onSnapshot, query, orderBy, Firestore } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { createCategory } from '@/lib/resumeUtils'
import { ResumeCategory } from '@/types'
import { ResumeList } from '@/components/ResumeList'
import { UploadResume } from '@/components/UploadResume'

// Type assertion for db
const firestore: Firestore = db;

export default function Home() {
  const [categories, setCategories] = useState<ResumeCategory[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  useEffect(() => {
    // Subscribe to categories collection without ordering for now
    const q = query(collection(firestore, 'categories'))
    
    console.log('Attempting to connect to Firebase...')
    
    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        console.log('Firebase connected successfully!')
        console.log('Categories found:', snapshot.size)
        
        const categoriesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as ResumeCategory[]
        // Sort on the client side instead
        categoriesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        setCategories(categoriesData)
      },
      (error) => {
        console.error('Firebase connection error:', {
          code: error.code,
          message: error.message,
          name: error.name,
          stack: error.stack,
        })
        alert(`Error connecting to database: ${error.message}. Check your Firebase configuration.`)
      }
    )

    return () => unsubscribe()
  }, [])

  const handleAddCategory = async (e?: React.FormEvent) => {
    e?.preventDefault()
    const trimmedName = newCategoryName.trim()
    setNewCategoryName('')  // Clear immediately
    if (!trimmedName) return
    
    try {
      await createCategory(trimmedName)
      setIsAddingCategory(false)
    } catch (error) {
      console.error('Error creating category:', error)
      alert('Failed to create category. Please try again.')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddCategory(e)
    }
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Resumeganizer</h1>
        
        <div className="grid gap-6">
          {/* Resume Categories */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Resume Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {categories.map((category) => (
                <CategoryCard 
                  key={category.id}
                  category={category}
                  isSelected={selectedCategory === category.id}
                  onClick={() => setSelectedCategory(category.id)}
                />
              ))}
            </div>
          </section>

          {/* Add Category Button/Form */}
          <section>
            {isAddingCategory ? (
              <div className="p-4 border-2 border-dashed border-gray-300 rounded-lg">
                <input
                  type="text"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Category name"
                  className="w-full p-2 border rounded mb-2"
                  autoFocus
                />
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => {
                      setIsAddingCategory(false)
                      setNewCategoryName('')
                    }}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  >
                    Add Category
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingCategory(true)}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-gray-400 hover:text-gray-600 transition-colors"
              >
                + Add a Resume Category
              </button>
            )}
          </section>

          {/* Selected Category Content */}
          {selectedCategory && (
            <section className="mt-8">
              <div className="grid gap-6">
                <UploadResume categoryId={selectedCategory} />
                <ResumeList categoryId={selectedCategory} />
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  )
}

function CategoryCard({ 
  category,
  isSelected,
  onClick
}: { 
  category: ResumeCategory
  isSelected: boolean
  onClick: () => void
}) {
  return (
    <div
      onClick={onClick}
      className={`p-4 border-2 rounded-lg transition-all cursor-pointer min-h-[56px] flex items-center justify-center
        ${isSelected ? 'border-blue-500 bg-blue-50 shadow-md text-blue-700' : 'border-gray-400 bg-black text-gray-100 hover:border-blue-300'}
      `}
    >
      <h3 className="font-medium">
        {category.name}
      </h3>
    </div>
  )
}
