'use client'
import React from 'react'

type ErrorModalProps = {
  message: string
  onClose: () => void
  actionLabel?: string
  onAction?: () => void
}

export default function ErrorModal({ message, onClose, actionLabel, onAction }: ErrorModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
        <div className="text-red-600 font-bold text-lg mb-2">Error</div>
        <div className="text-gray-800 mb-4 text-center">{message}</div>
        <div className="flex gap-2">
          {onAction && actionLabel && (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              onClick={onAction}
            >
              {actionLabel}
            </button>
          )}
          <button
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded hover:bg-gray-300"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
