'use client'
import { useAuth } from '@/context/AuthContext'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { UserCircleIcon } from '@heroicons/react/24/solid'
import Link from 'next/link'

export default function UserMenu() {
  const { user } = useAuth()

  if (!user) {
    return <Link href="/auth" className="hover:underline">Login/Signup</Link>
  }

  return (
    <div className="flex items-center gap-2">
      <UserCircleIcon className="w-7 h-7 text-gray-400" />
      <button
        onClick={() => signOut(auth)}
        className="ml-4 text-red-600 hover:underline text-sm"
      >
        Logout
      </button>
    </div>
  )
}
