'use client'
import React from 'react'

export default function FileCabinetLoader() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[40vh]">
      {/* File cabinet body */}
      <div className="relative w-32 h-32 bg-gray-200 rounded-lg shadow-lg flex items-end justify-center">
        {/* Drawer */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-28 h-12 bg-gray-300 rounded-b-lg border-t-4 border-gray-400 animate-pulse" />
        {/* Handle */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-gray-400 rounded-full" />
      </div>
      <div className="mt-6 text-gray-600 font-medium text-lg animate-pulse">Loading your file cabinet...</div>
    </div>
  )
}
