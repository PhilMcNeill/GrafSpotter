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

// Figma: panel=800px at 3840 = 20.83vw (includes nav 160px → panel content = 640/3840 = 16.67vw)
const PANEL_WIDTH = 'clamp(220px, 16.67vw, 320px)'

const sectionLabel = 'text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase'

export function MapContainer() {
  const [filters, setFilters] = useState<EntryFilters>({})
  const { entries, isLoading } = useEntries(filters)
  const mapRef = useRef<LeafletMap | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState<Panel | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleNavSelect(panel: Panel) {
    // Clicking the active panel button closes it; clicking a new one opens it
    setActivePanel(prev => prev === panel ? null : panel)
  }

  function closePanel() {
    setActivePanel(null)
  }

  function zoom(direction: 'in' | 'out') {
    if (!mapRef.current) return
    direction === 'in' ? mapRef.current.zoomIn() : mapRef.current.zoomOut()
  }

  const zoomBtn = 'flex items-center justify-center w-[clamp(36px,3.1vw,48px)] h-[clamp(36px,3.1vw,48px)] bg-[#141415] text-[#dfdfdf] text-lg hover:bg-[#2a2b2b] transition-colors select-none font-mono leading-none'

  const panelOpen = activePanel !== null

  return (
    <div className="flex w-full h-full overflow-hidden bg-black">

      {/* Permanent nav — always visible */}
      <PermanentNav activePanel={activePanel} onSelect={handleNavSelect} />

      {/* Slide panel — sits between nav and map, animates width */}
      <div
        className="flex-shrink-0 overflow-hidden transition-[width] duration-300 ease-in-out"
        style={{ width: panelOpen ? PANEL_WIDTH : '0px' }}
      >
        {/* Inner div holds fixed width so content doesn't reflow during animation */}
        <div className="h-full relative" style={{ width: PANEL_WIDTH }}>
          {/* × closes panel only, nav highlight unaffected */}
          <button
            onClick={closePanel}
            className="absolute top-[clamp(20px,2.8vh,40px)] right-[clamp(14px,1.5vw,22px)] text-[#444] hover:text-[#dfdfdf] transition-colors text-xl leading-none z-10"
          >
            ×
          </button>

          {activePanel === 'filter' && (
            <FilterPanel filters={filters} onChange={setFilters} entryCount={entries.length} />
          )}

          {activePanel === 'submit' && (
            <SubmitForm onDone={closePanel} />
          )}

          {activePanel === 'account' && (
            <div className="flex flex-col h-full bg-[#141415] border-r border-[#222323]">
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

      {/* Map — fills remaining space, zoom buttons at top-left */}
      <div className="flex-1 relative">
        <MapView entries={entries} loading={isLoading} mapRef={mapRef} />
        <div
          className="absolute z-[1000] flex flex-col"
          style={{ top: 'clamp(16px, 2.5vh, 40px)', left: 'clamp(10px, 0.8vw, 14px)' }}
        >
          <button className={zoomBtn} onClick={() => zoom('in')} aria-label="Zoom in">+</button>
          <div className="h-px bg-[#222]" />
          <button className={zoomBtn} onClick={() => zoom('out')} aria-label="Zoom out">−</button>
        </div>
      </div>
    </div>
  )
}
