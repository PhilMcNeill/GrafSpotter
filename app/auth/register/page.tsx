import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'

export default function RegisterPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Create account</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-yellow-400 hover:underline">Log in</Link>
        </p>
        <AuthForm mode="register" />
      </div>
    </div>
  )
}
