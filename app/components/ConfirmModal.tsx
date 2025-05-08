import React from 'react';

export default function ConfirmModal({
  open,
  title = "Are you sure?",
  message,
  onConfirm,
  onCancel,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  confirmColor = "bg-red-600 hover:bg-red-700",
}: {
  open: boolean,
  title?: string,
  message: string,
  onConfirm: () => void,
  onCancel: () => void,
  confirmLabel?: string,
  cancelLabel?: string,
  confirmColor?: string,
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl shadow-lg p-6 max-w-sm w-full flex flex-col items-center">
        <div className="font-bold text-lg mb-2">{title}</div>
        <div className="text-gray-800 mb-4 text-center">{message}</div>
        <div className="flex gap-2">
          <button
            className={`px-4 py-2 rounded text-white ${confirmColor}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
          <button
            className="px-4 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300"
            onClick={onCancel}
          >
            {cancelLabel}
          </button>
        </div>
      </div>
    </div>
  );
} 