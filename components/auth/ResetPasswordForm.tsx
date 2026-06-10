'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

type Status = 'waiting' | 'ready' | 'invalid'

export function ResetPasswordForm() {
  const router = useRouter()
  const [status, setStatus] = useState<Status>('waiting')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // Supabase fires PASSWORD_RECOVERY when it detects the reset token in the URL hash
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setStatus('ready')
      }
    })

    // If no event fires within 3 seconds the link is invalid or already used
    const timeout = setTimeout(() => {
      setStatus(prev => prev === 'waiting' ? 'invalid' : prev)
    }, 3000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(timeout)
    }
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/auth/login')
    }
  }

  if (status === 'waiting') {
    return (
      <div className="text-center py-8">
        <p className="text-zinc-400 text-sm animate-pulse">Verifying reset link…</p>
      </div>
    )
  }

  if (status === 'invalid') {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-5 text-center space-y-3">
        <p className="text-red-400 font-medium">Link invalid or expired</p>
        <p className="text-zinc-400 text-sm">
          Reset links expire after 1 hour and can only be used once.
        </p>
        <Link
          href="/auth/forgot-password"
          className="inline-block mt-2 text-yellow-400 text-sm hover:underline"
        >
          Request a new reset link
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-1">New password</label>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Confirm password</label>
        <input
          type="password"
          value={confirm}
          onChange={e => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
      </div>
      {error && <p className="text-red-400 text-sm">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-yellow-400 text-zinc-950 font-semibold py-2 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
      >
        {loading ? 'Saving…' : 'Set new password'}
      </button>
    </form>
  )
}
