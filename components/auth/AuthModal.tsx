'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
})
type Fields = z.infer<typeof schema>

const label = 'block text-[11px] tracking-[0.3em] uppercase text-[#dfdfdf] mb-2'
const input = 'w-full bg-[#2a2b2b] border-0 px-4 py-3 text-[11px] tracking-[0.2em] uppercase text-[#dfdfdf] placeholder-[#555] focus:outline-none focus:ring-1 focus:ring-[#555]'
const btn = 'w-full bg-[#424242] text-[#dfdfdf] text-[11px] tracking-[0.3em] uppercase py-3 hover:bg-[#555] transition-colors disabled:opacity-40'

export function AuthModal({ onClose }: { onClose?: () => void }) {
  const router = useRouter()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<Fields>({
    resolver: zodResolver(schema),
  })

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
      onClose?.()
      router.refresh()
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <p className="text-[11px] tracking-[0.3em] uppercase text-[#dfdfdf]">Check your email</p>
        <p className="text-[10px] tracking-[0.2em] uppercase text-[#555]">Confirm your address then log in</p>
        <button onClick={() => { setSuccess(false); setMode('login') }} className={btn}>Log in</button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Mode toggle */}
      <div className="grid grid-cols-2 gap-px bg-[#111]">
        {(['login', 'register'] as const).map(m => (
          <button
            key={m}
            onClick={() => { setMode(m); setServerError(null) }}
            className={`py-3 text-[10px] tracking-[0.3em] uppercase transition-colors ${
              mode === m ? 'bg-[#424242] text-[#dfdfdf]' : 'bg-[#2a2b2b] text-[#555] hover:text-[#dfdfdf]'
            }`}
          >
            {m === 'login' ? 'Log in' : 'Register'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className={label}>Email</label>
          <input {...register('email')} type="email" autoComplete="email" className={input} />
          {errors.email && <p className="text-[9px] tracking-[0.2em] uppercase text-red-400 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className={label}>Password</label>
          <input {...register('password')} type="password" autoComplete={mode === 'login' ? 'current-password' : 'new-password'} className={input} />
          {errors.password && <p className="text-[9px] tracking-[0.2em] uppercase text-red-400 mt-1">{errors.password.message}</p>}
        </div>
        {serverError && <p className="text-[9px] tracking-[0.2em] uppercase text-red-400">{serverError}</p>}
        <button type="submit" disabled={isSubmitting} className={btn}>
          {isSubmitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
        </button>
      </form>

      {mode === 'login' && (
        <Link href="/auth/forgot-password" className="block text-center text-[9px] tracking-[0.25em] uppercase text-[#444] hover:text-[#dfdfdf] transition-colors">
          Forgot password
        </Link>
      )}
    </div>
  )
}
