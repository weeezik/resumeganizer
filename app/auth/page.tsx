'use client'
import React, { useState, useEffect } from 'react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import ErrorModal from '@/components/ErrorModal'

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [modal, setModal] = useState<{ message: string, action?: () => void, actionLabel?: string } | null>(null)
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.replace('/resumes')
    }
  }, [user, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password)
      } else {
        await createUserWithEmailAndPassword(auth, email, password)
      }
      router.replace('/resumes')
    } catch (err: any) {
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        setModal({
          message: "No account found with this email. Would you like to sign up?",
          action: () => {
            setIsLogin(false)
            setModal(null)
          },
          actionLabel: "Sign up"
        })
      } else if (err.code === 'auth/wrong-password') {
        setModal({
          message: "Incorrect password. Please try again or reset your password.",
          action: undefined,
          actionLabel: ""
        })
      } else if (err.code === 'auth/email-already-in-use') {
        setModal({
          message: "This email is already registered. Please log in instead.",
          action: () => {
            setIsLogin(true)
            setModal(null)
          },
          actionLabel: "Login"
        })
      } else {
        setModal({
          message: `Error doesn't fit any criteria: ${err.message}`,
          action: undefined,
          actionLabel: ""
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to your account' : 'Create a new account'}
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Email"
            className="p-3 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            autoFocus
          />
          <input
            type="password"
            placeholder="Password"
            className="p-3 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          {error && <div className="text-red-500 text-sm">{error}</div>}
          <button
            type="submit"
            className="bg-blue-600 text-white py-2 rounded font-semibold hover:bg-blue-700 transition"
            disabled={loading}
          >
            {loading ? (isLogin ? 'Logging in...' : 'Signing up...') : (isLogin ? 'Login' : 'Sign Up')}
          </button>
        </form>
        <div className="mt-4 text-center">
          {isLogin ? (
            <>
              Don&apos;t have an account?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setIsLogin(false)}>
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="text-blue-600 hover:underline" onClick={() => setIsLogin(true)}>
                Login
              </button>
            </>
          )}
        </div>
      </div>
      {modal && (
        <ErrorModal
          message={modal.message}
          onClose={() => setModal(null)}
          actionLabel={modal.actionLabel}
          onAction={modal.action}
        />
      )}
    </div>
  )
}
