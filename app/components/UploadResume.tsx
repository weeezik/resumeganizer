'use client'

import { useState, useRef } from 'react'
import { useAuth } from '@/context/AuthContext'
import { getStorage, ref, uploadBytes } from "firebase/storage";

export function UploadResume({ categoryId }: { categoryId: string }) {
  const { user } = useAuth()
  const [isDragging, setIsDragging] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      await handleFiles(files)
    }
  }

  const handleFiles = async (files: File[]) => {
    setIsUploading(true)
    
    try {
      for (const file of files) {
        if (!user) return
        await uploadResume(file, user.uid)
      }
    } catch (error) {
      console.error('Error uploading files:', error)
      alert('Failed to upload one or more files. Please try again.')
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    }
  }

  return (
    <div className="w-full">
      <div
        className={`rounded-lg p-8 text-center transition-shadow duration-200 ${
          isDragging
            ? 'bg-blue-50 ring-2 ring-blue-300'
            : isUploading
            ? 'bg-gray-50'
            : 'hover:ring-2 hover:ring-gray-300 cursor-pointer'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => !isUploading && fileInputRef.current?.click()}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileInput}
          accept=".pdf,.doc,.docx"
          className="hidden"
          multiple
          disabled={isUploading}
        />
        <div className="space-y-2">
          {isUploading ? (
            <p className="text-gray-600">Uploading...</p>
          ) : (
            <>
              <p className="text-gray-600">
                Drag and drop your resume files here, or click to select files
              </p>
              <p className="text-sm text-gray-500">
                Supported formats: PDF, DOC, DOCX
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export async function uploadResume(file: File, userId: string) {
  const storage = getStorage();
  const filePath = `resumes/${userId}/${file.name}`;
  const fileRef = ref(storage, filePath);

  // Optionally add metadata
  const metadata = {
    customMetadata: {
      userId: userId,
    },
  };

  await uploadBytes(fileRef, file, metadata);
  // Do NOT create a Firestore document here!
} 