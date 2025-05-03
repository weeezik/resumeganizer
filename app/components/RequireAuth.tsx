'use client'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import FileCabinetLoader from './FileCabinetLoader'

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user === null) {
      router.replace('/auth')
    }
  }, [user, router])

  if (user === null) return <FileCabinetLoader />
  if (!user) return <FileCabinetLoader />

  return <>{children}</>
}
