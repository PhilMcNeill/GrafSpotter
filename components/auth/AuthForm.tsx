'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})
type Fields = z.infer<typeof schema>

export function AuthForm({ mode }: { mode: 'login' | 'register' }) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Fields>({ resolver: zodResolver(schema) })

  async function onSubmit(data: Fields) {
    setServerError(null)
    const supabase = createClient()

    if (mode === 'register') {
      const { error } = await supabase.auth.signUp(data)
      if (error) { setServerError(error.message); return }
      setSuccess(true)
    } else {
      const { error } = await supabase.auth.signInWithPassword(data)
      if (error) { setServerError('Invalid email or password'); return }
      router.push('/map')
      router.refresh()
    }
  }

  if (success) {
    return (
      <div className="text-center py-8">
        <p className="text-green-400 font-medium">Account created!</p>
        <p className="text-zinc-400 text-sm mt-2">Check your email to confirm your address, then log in.</p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Email</label>
        <input
          {...register('email')}
          type="email"
          autoComplete="email"
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
        {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
      </div>
      <div>
        <label className="block text-sm text-zinc-400 mb-1">Password</label>
        <input
          {...register('password')}
          type="password"
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-yellow-400"
        />
        {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
      </div>
      {serverError && <p className="text-red-400 text-sm">{serverError}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-yellow-400 text-zinc-950 font-semibold py-2 rounded-lg hover:bg-yellow-300 transition-colors disabled:opacity-50"
      >
        {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
      </button>
    </form>
  )
}
