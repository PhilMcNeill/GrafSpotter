'use client'

type Panel = 'filter' | 'submit' | 'account'

interface Props {
  activePanel: Panel | null
  onSelect: (panel: Panel) => void
}

// Figma: nav=160px at 3840 = 4.17vw
export const NAV_WIDTH = 'clamp(50px, 4.17vw, 80px)'

export function PermanentNav({ activePanel, onSelect }: Props) {
  const btnClass = (panel: Panel) =>
    `flex items-center justify-center transition-colors ${
      activePanel === panel ? 'bg-[#dfdfdf]' : 'bg-[#141415] hover:bg-[#1e1e1f]'
    }`

  return (
    <div
      className="flex-shrink-0 h-full flex flex-col bg-[#101011]"
      style={{
        width: NAV_WIDTH,
        paddingTop: 'clamp(8px, 0.83vh, 18px)',
        gap: 'clamp(5px, 0.93vh, 20px)',
        paddingLeft: 'clamp(5px, 0.52vw, 10px)',
        paddingRight: 'clamp(5px, 0.52vw, 10px)',
      }}
    >
      {/* Each button is square = full nav width minus horizontal padding */}
      <button
        className={btnClass('filter')}
        style={{ width: '100%', aspectRatio: '1' }}
        onClick={() => onSelect('filter')}
        title="Filter"
      >
        <MapIcon active={activePanel === 'filter'} />
      </button>
      <button
        className={btnClass('submit')}
        style={{ width: '100%', aspectRatio: '1' }}
        onClick={() => onSelect('submit')}
        title="Submit sighting"
      >
        <CameraIcon active={activePanel === 'submit'} />
      </button>
      <button
        className={btnClass('account')}
        style={{ width: '100%', aspectRatio: '1' }}
        onClick={() => onSelect('account')}
        title="Account / Log in"
      >
        <PersonIcon active={activePanel === 'account'} />
      </button>
    </div>
  )
}

function MapIcon({ active }: { active: boolean }) {
  const c = active ? '#101011' : '#dfdfdf'
  return (
    <svg width="45%" height="45%" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CameraIcon({ active }: { active: boolean }) {
  const c = active ? '#101011' : '#dfdfdf'
  return (
    <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function PersonIcon({ active }: { active: boolean }) {
  const c = active ? '#101011' : '#dfdfdf'
  return (
    <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
