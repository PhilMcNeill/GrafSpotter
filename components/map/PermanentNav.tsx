'use client'

type Panel = 'filter' | 'submit' | 'account'

interface Props {
  selected: Panel | null
  onSelect: (panel: Panel) => void
}

// Figma: nav=160px, button=120px, left-pad=20px, gap=20px at 3840×2160
export const NAV_WIDTH = 'clamp(50px, 4.17vw, 80px)'
const BTN_SIZE = 'clamp(38px, 3.125vw, 60px)'
const BTN_PAD = 'clamp(6px, 0.52vw, 10px)' // left/right margin within nav

export function PermanentNav({ selected, onSelect }: Props) {
  const btn = (panel: Panel) => ({
    style: {
      width: `clamp(38px, 3.125vw, 60px)`,
      height: `clamp(38px, 3.125vw, 60px)`,
    },
    className: `flex items-center justify-center flex-shrink-0 transition-colors ${
      selected === panel ? 'bg-[#5a2c0d]' : 'bg-[#141415] hover:bg-[#1e1e1f]'
    }`,
    onClick: () => onSelect(panel),
  })

  return (
    <div
      className="flex-shrink-0 h-full flex flex-col items-start bg-[#101011]"
      style={{ width: NAV_WIDTH, paddingLeft: BTN_PAD, paddingRight: BTN_PAD, paddingTop: 'clamp(8px, 0.83vh, 18px)', gap: 'clamp(5px, 0.93vh, 20px)' }}
    >
      <button {...btn('filter')} title="Filter">
        <MapIcon size={BTN_SIZE} />
      </button>
      <button {...btn('submit')} title="Submit sighting">
        <CameraIcon size={BTN_SIZE} />
      </button>
      <button {...btn('account')} title="Account / Log in">
        <PersonIcon size={BTN_SIZE} />
      </button>
    </div>
  )
}

function MapIcon({ size }: { size: string }) {
  return (
    <svg width="45%" height="45%" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CameraIcon({ size }: { size: string }) {
  return (
    <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function PersonIcon({ size }: { size: string }) {
  return (
    <svg width="42%" height="42%" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
