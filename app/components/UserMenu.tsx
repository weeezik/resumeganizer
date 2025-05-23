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
      <Link href="/account" aria-label="Account">
        <UserCircleIcon className="w-7 h-7 text-gray-400 hover:text-blue-500 transition" />
      </Link>
    </div>
  )
}
