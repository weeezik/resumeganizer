'use client'

import { useState, useEffect } from 'react'
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { updateResumeDetails, deleteResume } from '@/lib/resumeUtils'
import { Resume } from '@/types'

export function ResumeList({ categoryId }: { categoryId: string }) {
  const [resumes, setResumes] = useState<Resume[]>([])
  const [editingResume, setEditingResume] = useState<string | null>(null)

  useEffect(() => {
    // Subscribe to resumes for this category
    const q = query(
      collection(db, 'resumes'),
      where('category', '==', categoryId),
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
  }, [categoryId])

  const handleUpdateResume = async (resumeId: string, updates: Partial<Resume>) => {
    try {
      await updateResumeDetails(resumeId, updates)
      setEditingResume(null)
    } catch (error) {
      console.error('Error updating resume:', error)
      alert('Failed to update resume. Please try again.')
    }
  }

  const handleDeleteResume = async (resumeId: string) => {
    if (!confirm('Are you sure you want to delete this resume?')) return

    try {
      await deleteResume(resumeId)
    } catch (error) {
      console.error('Error deleting resume:', error)
      alert('Failed to delete resume. Please try again.')
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Your Resumes</h2>
      
      {resumes.length === 0 ? (
        <p className="text-gray-500">No resumes uploaded yet.</p>
      ) : (
        <div className="grid gap-4">
          {resumes.map((resume) => (
            <ResumeCard
              key={resume.id}
              resume={resume}
              isEditing={editingResume === resume.id}
              onEdit={() => setEditingResume(resume.id)}
              onSave={(updates) => handleUpdateResume(resume.id, updates)}
              onDelete={() => handleDeleteResume(resume.id)}
              onCancel={() => setEditingResume(null)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function ResumeCard({
  resume,
  isEditing,
  onEdit,
  onSave,
  onDelete,
  onCancel,
}: {
  resume: Resume
  isEditing: boolean
  onEdit: () => void
  onSave: (updates: Partial<Resume>) => void
  onDelete: () => void
  onCancel: () => void
}) {
  const [editForm, setEditForm] = useState({
    company: resume.company || '',
    jobTitle: resume.jobTitle || '',
    status: resume.status,
    notes: resume.notes || '',
  })

  if (isEditing) {
    return (
      <div className="p-4 border rounded-lg">
        <div className="space-y-3">
          <input
            type="text"
            value={editForm.company}
            onChange={(e) => setEditForm({ ...editForm, company: e.target.value })}
            placeholder="Company"
            className="w-full p-2 border rounded"
          />
          <input
            type="text"
            value={editForm.jobTitle}
            onChange={(e) => setEditForm({ ...editForm, jobTitle: e.target.value })}
            placeholder="Position"
            className="w-full p-2 border rounded"
          />
          <select
            value={editForm.status}
            onChange={(e) => setEditForm({ ...editForm, status: e.target.value as Resume['status'] })}
            className="w-full p-2 border rounded"
          >
            <option value="not applied">Not Applied</option>
            <option value="applied">Applied</option>
            <option value="interviewed">Interviewed</option>
          </select>
          <textarea
            value={editForm.notes}
            onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
            placeholder="Notes"
            className="w-full p-2 border rounded"
            rows={3}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1 text-gray-600 hover:text-gray-800"
            >
              Cancel
            </button>
            <button
              onClick={() => onSave(editForm)}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 border rounded-lg">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium">
            <a
              href={resume.fileUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-500"
            >
              {resume.fileName}
            </a>
          </h3>
          {resume.company && (
            <p className="text-sm text-gray-600">Company: {resume.company}</p>
          )}
          {resume.jobTitle && (
            <p className="text-sm text-gray-600">Position: {resume.jobTitle}</p>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Updated: {resume.updatedAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded text-sm ${getStatusColor(resume.status)}`}>
            {resume.status}
          </span>
          <button
            onClick={onEdit}
            className="p-1 text-gray-500 hover:text-gray-700"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-red-500 hover:text-red-700"
          >
            Delete
          </button>
        </div>
      </div>
      {resume.notes && (
        <div className="mt-2 text-sm text-gray-600">
          <p>Notes: {resume.notes}</p>
        </div>
      )}
    </div>
  )
}

function getStatusColor(status: Resume['status']) {
  switch (status) {
    case 'applied':
      return 'bg-blue-100 text-blue-800'
    case 'interviewed':
      return 'bg-green-100 text-green-800'
    case 'not applied':
      return 'bg-gray-100 text-gray-800'
  }
} 