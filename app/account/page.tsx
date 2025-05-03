'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { UserCircleIcon } from '@heroicons/react/24/solid'

export default function AccountPage() {
  const { user } = useAuth()
  const router = useRouter()

  // Redirect to login if not logged in
  useEffect(() => {
    if (!user) {
      router.replace('/auth')
    }
  }, [user, router])

  if (!user) return null

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col items-center gap-4">
        <UserCircleIcon className="w-16 h-16 text-gray-400 mb-2" />
        <div className="text-lg font-semibold text-gray-900">Account</div>
        <div className="w-full flex flex-col gap-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-mono text-gray-900">{user.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Plan:</span>
            <span className="font-semibold text-blue-600">Free</span>
          </div>
        </div>
        <button
          onClick={() => signOut(auth)}
          className="mt-6 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  )
}
