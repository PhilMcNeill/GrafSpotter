'use client'

import dynamic from 'next/dynamic'
import { EntryFilters } from '@/types'
import { FilterPanel } from './FilterPanel'
import { PermanentNav, NAV_WIDTH } from './PermanentNav'
import { SubmitForm } from '@/components/submission/SubmitForm'
import { AuthModal } from '@/components/auth/AuthModal'
import { useEntries } from '@/hooks/useEntries'
import { useQueryClient } from '@tanstack/react-query'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Map as LeafletMap } from 'leaflet'
import type { User } from '@supabase/supabase-js'

const MapView = dynamic(() => import('./MapView').then(m => m.MapView), {
  ssr: false,
  loading: () => <div className="flex-1 bg-[#090909]" />,
})

type Panel = 'filter' | 'submit' | 'account'

// Figma node 70-85: panel width 800px at 3840 = 20.83vw
const PANEL_WIDTH = 'clamp(220px, 20.83vw, 400px)'

const sectionLabel = 'text-[#dfdfdf] text-[clamp(9px,0.78vw,12px)] tracking-[0.32em] uppercase'

export function MapContainer() {
  const [filters, setFilters] = useState<EntryFilters>({})
  const { entries, isLoading } = useEntries(filters)
  const mapRef = useRef<LeafletMap | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [activePanel, setActivePanel] = useState<Panel | null>(null)
  const queryClient = useQueryClient()
  // displayedPanel lags behind activePanel — stays set during close animation
  const [displayedPanel, setDisplayedPanel] = useState<Panel | null>(null)

  useEffect(() => {
    if (activePanel) {
      setDisplayedPanel(activePanel)
    } else {
      // clear content after animation completes (300ms)
      const t = setTimeout(() => setDisplayedPanel(null), 300)
      return () => clearTimeout(t)
    }
  }, [activePanel])

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  function handleNavSelect(panel: Panel) {
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
  const panelVisible = activePanel !== null   // drives slide transform
  const panelOpen = displayedPanel !== null   // drives zoom button position (stays true during close animation)

  return (
    <div className="flex w-full h-full overflow-hidden bg-black">

      {/* Permanent nav — always visible, never moves */}
      <PermanentNav activePanel={activePanel} onSelect={handleNavSelect} />

      {/* Map fills all remaining space — never resizes */}
      <div className="flex-1 relative overflow-hidden">
        <MapView entries={entries} loading={isLoading} mapRef={mapRef} />

        {/* Zoom controls — always top-left of map area */}
        <div
          className="absolute z-[3000] flex flex-col transition-[left] duration-300 ease-in-out"
          style={{
            top: 'clamp(16px, 2.5vh, 40px)',
            left: panelOpen ? 'calc(clamp(220px, 20.83vw, 400px) + clamp(10px, 0.8vw, 14px))' : 'clamp(10px, 0.8vw, 14px)',
          }}
        >
          <button className={zoomBtn} onClick={() => zoom('in')} aria-label="Zoom in">+</button>
          <div className="h-px bg-[#222]" />
          <button className={zoomBtn} onClick={() => zoom('out')} aria-label="Zoom out">−</button>
        </div>

        {/* Slide panel — overlays from the left edge of map area */}
        <div
          className={`absolute top-0 left-0 h-full z-[2000] transition-transform duration-300 ease-in-out ${panelVisible ? 'pointer-events-auto' : 'pointer-events-none'}`}
          style={{
            width: PANEL_WIDTH,
            transform: panelVisible ? 'translateX(0)' : 'translateX(-100%)',
          }}
        >
          {/* × in top-right of panel */}
          <button
            onClick={closePanel}
            className="absolute top-[clamp(20px,2.8vh,40px)] right-[clamp(14px,1.5vw,22px)] text-[#444] hover:text-[#dfdfdf] transition-colors text-xl leading-none z-10"
          >
            ×
          </button>

          {displayedPanel === 'filter' && (
            <FilterPanel filters={filters} onChange={setFilters} entryCount={entries.length} />
          )}

          {displayedPanel === 'submit' && (
            <SubmitForm onDone={() => {
              queryClient.invalidateQueries({ queryKey: ['entries'] })
              closePanel()
            }} />
          )}

          {displayedPanel === 'account' && (
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
    </div>
  )
}
