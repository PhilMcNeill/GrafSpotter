import { SubmitForm } from '@/components/submission/SubmitForm'

export const metadata = { title: 'Submit — GrafSpotter' }

export default function SubmitPage() {
  return (
    <div className="max-w-lg mx-auto w-full px-4 py-8">
      <h1 className="text-2xl font-bold mb-1">Submit a sighting</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Upload a photo and we&apos;ll try to detect the writer name automatically.
      </p>
      <SubmitForm />
    </div>
  )
}
