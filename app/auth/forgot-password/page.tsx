import { ForgotPasswordForm } from '@/components/auth/ForgotPasswordForm'
import Link from 'next/link'

export const metadata = { title: 'Forgot password — GrafSpotter' }

export default function ForgotPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Reset your password</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Enter your email and we&apos;ll send you a reset link.{' '}
          <Link href="/auth/login" className="text-yellow-400 hover:underline">Back to login</Link>
        </p>
        <ForgotPasswordForm />
      </div>
    </div>
  )
}
