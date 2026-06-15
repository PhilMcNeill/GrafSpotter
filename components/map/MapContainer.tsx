'use client'

import dynamic from 'next/dynamic'
import { EntryFilters } from '@/types'
import { FilterPanel } from './FilterPanel'
import { PermanentNav, NAV_WIDTH } from './PermanentNav'
import { SubmitForm } from '@/components/submission/SubmitForm'
import { AuthModal } from '@/components/auth/AuthModal'
import { useEntries } from '@/hooks/useEntries'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Map as LeafletMap } from 'leaflet'
import type { User } from '@supabase/supabase-js'

const MapView = dynamic(() => import('./MapView').then(m => m.MapView), {
  ssr: false,
  loading: () => <div className="flex-1 bg-[#090909]" />,
})

type Panel = 'filter' | 'submit' | 'account'

const PANEL_WIDTH = 'clamp(220px, 16.67vw, 320px)'
const sectionLabel = 'text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase'

export function MapContainer() {
  const [filters, setFilters] = useState<EntryFilters>({})
  const { entries, isLoading } = useEntries(filters)
  const mapRef = useRef<LeafletMap | null>(null)
  const [user, setUser] = useState<User | null>(null)

  // selectedPanel = which nav button is highlighted (persists through close)
  // panelOpen     = whether the slide panel is visible
  const [selectedPanel, setSelectedPanel] = useState<Panel | null>(null)
  const [panelOpen, setPanelOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleNavSelect(panel: Panel) {
    if (selectedPanel === panel && panelOpen) {
      // clicking active button while open → close panel only
      setPanelOpen(false)
    } else {
      setSelectedPanel(panel)
      setPanelOpen(true)
    }
  }

  function closePanel() {
    // only closes the slide panel — nav highlight stays
    setPanelOpen(false)
  }

  function zoom(direction: 'in' | 'out') {
    if (!mapRef.current) return
    direction === 'in' ? mapRef.current.zoomIn() : mapRef.current.zoomOut()
  }

  const zoomBtn = 'flex items-center justify-center w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] bg-[#141415] text-[#dfdfdf] text-lg hover:bg-[#2a2b2b] transition-colors select-none font-mono leading-none'

  return (
    <div className="flex w-full h-full overflow-hidden bg-black">

      {/* Permanent nav — always visible, never affected by panel state */}
      <PermanentNav selected={selectedPanel} onSelect={handleNavSelect} />

      {/* Map area */}
      <div className="flex-1 relative">
        <MapView entries={entries} loading={isLoading} mapRef={mapRef} />

        {/* Zoom controls */}
        <div
          className="absolute z-[1000] flex flex-col"
          style={{ top: 'clamp(16px, 2.5vh, 40px)', left: 'clamp(10px, 0.8vw, 14px)' }}
        >
          <button className={zoomBtn} onClick={() => zoom('in')} aria-label="Zoom in">+</button>
          <div className="h-px bg-[#222]" />
          <button className={zoomBtn} onClick={() => zoom('out')} aria-label="Zoom out">−</button>
        </div>

        {/* Slide panel */}
        <div
          className={`absolute inset-0 z-[2000] flex items-stretch ${panelOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
        >
          <div
            className={`relative flex flex-col bg-[#141415] border-r border-[#222323] overflow-hidden h-full transition-transform duration-300 ease-in-out ${panelOpen ? 'translate-x-0' : '-translate-x-full'}`}
            style={{ width: PANEL_WIDTH }}
          >
            {/* × closes panel only */}
            <button
              onClick={closePanel}
              className="absolute top-[clamp(20px,2.8vh,40px)] right-[clamp(14px,1.5vw,22px)] text-[#444] hover:text-[#dfdfdf] transition-colors text-xl leading-none z-10"
            >
              ×
            </button>

            {selectedPanel === 'filter' && (
              <FilterPanel filters={filters} onChange={setFilters} entryCount={entries.length} />
            )}

            {selectedPanel === 'submit' && (
              <SubmitForm onDone={closePanel} />
            )}

            {selectedPanel === 'account' && (
              <div className="flex flex-col h-full">
                <div className="px-[clamp(16px,2.1vw,30px)] pt-[clamp(24px,3.5vh,52px)] pb-0">
                  <span className={sectionLabel}>ACCOUNT</span>
                </div>
                <div className="flex-1 px-[clamp(16px,2.1vw,30px)] pt-[clamp(20px,3vh,44px)] overflow-y-auto">
                  {user ? (
                    <div className="space-y-6">
                      <p className="text-[clamp(9px,0.78vw,12px)] tracking-[0.28em] uppercase text-[#dfdfdf] break-all">{user.email}</p>
                      <button
                        onClick={async () => {
                          await createClient().auth.signOut()
                          setUser(null)
                          closePanel()
                        }}
                        className="w-full bg-[#424242] text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase py-[clamp(12px,1.68vh,24px)] hover:bg-[#555] transition-colors"
                      >
                        LOG OUT
                      </button>
                    </div>
                  ) : (
                    <AuthModal onClose={closePanel} />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
