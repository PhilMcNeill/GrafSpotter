import { SubmitForm } from '@/components/submission/SubmitForm'

export const metadata = { title: 'Submit — GrafSpotter' }

export default function SubmitPage() {
  return (
    <div className="fixed inset-0 flex bg-[#141415]">
      {/* Sidebar panel */}
      <div
        className="flex-shrink-0 h-full flex flex-col border-r border-[#222323] overflow-y-auto"
        style={{ width: 'clamp(220px, 20.8vw, 400px)' }}
      >
        <SubmitForm />
      </div>

      {/* Right area — dark placeholder */}
      <div className="flex-1 bg-[#0d0d0d] flex items-center justify-center">
        <span className="text-[#222] text-[clamp(9px,0.78vw,12px)] tracking-[0.4em] uppercase">
          GrafSpotter
        </span>
      </div>
    </div>
  )
}
