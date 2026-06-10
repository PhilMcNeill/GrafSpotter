import Link from 'next/link'
import { AuthForm } from '@/components/auth/AuthForm'

export default function LoginPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Log in</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Don&apos;t have an account?{' '}
          <Link href="/auth/register" className="text-yellow-400 hover:underline">Sign up</Link>
        </p>
        <AuthForm mode="login" />
        <p className="text-center mt-4">
          <Link href="/auth/forgot-password" className="text-zinc-500 text-sm hover:text-zinc-300 transition-colors">
            Forgot your password?
          </Link>
        </p>
      </div>
    </div>
  )
}
