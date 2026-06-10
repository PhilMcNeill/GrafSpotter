import { ResetPasswordForm } from '@/components/auth/ResetPasswordForm'

export const metadata = { title: 'Set new password — GrafSpotter' }

export default function ResetPasswordPage() {
  return (
    <div className="flex-1 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-2">Set new password</h1>
        <p className="text-zinc-400 text-sm mb-6">Choose a new password for your account.</p>
        <ResetPasswordForm />
      </div>
    </div>
  )
}
