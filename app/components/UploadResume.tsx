'use client'

import { useState, useRef } from 'react'
import { uploadResume } from '@/lib/resumeUtils'

export function UploadResume({ categoryId }: { categoryId: string }) {
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
        await uploadResume(file, categoryId)
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
        className={`border-2 border-dashed rounded-lg p-8 text-center ${
          isDragging
            ? 'border-blue-500 bg-blue-50'
            : isUploading
            ? 'border-gray-400 bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
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