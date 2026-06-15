'use client'

type Panel = 'filter' | 'submit' | 'account' | null

interface Props {
  active: Panel
  onSelect: (panel: Panel) => void
  loggedIn: boolean
}

// Nav width in Figma: 160/3840 = 4.17vw
export const NAV_WIDTH = 'clamp(48px, 4.17vw, 72px)'

export function PermanentNav({ active, onSelect, loggedIn }: Props) {
  const btn = (panel: NonNullable<Panel>) =>
    `flex items-center justify-center w-full aspect-square transition-colors ${
      active === panel ? 'bg-[#5a2c0d]' : 'bg-[#141415] hover:bg-[#1e1e1f]'
    }`

  function toggle(panel: NonNullable<Panel>) {
    onSelect(active === panel ? null : panel)
  }

  return (
    <div
      className="flex-shrink-0 h-full flex flex-col items-center pt-[clamp(10px,1.2vh,18px)] gap-[clamp(4px,0.6vh,8px)] bg-[#101011]"
      style={{ width: NAV_WIDTH }}
    >
      {/* Map / Filter */}
      <button className={btn('filter')} onClick={() => toggle('filter')} title="Filter">
        <MapIcon />
      </button>

      {/* Submit */}
      <button className={btn('submit')} onClick={() => toggle('submit')} title="Submit sighting">
        <CameraIcon />
      </button>

      {/* Account */}
      <button className={btn('account')} onClick={() => toggle('account')} title={loggedIn ? 'Account' : 'Log in'}>
        <PersonIcon />
      </button>
    </div>
  )
}

function MapIcon() {
  return (
    <svg width="40%" height="40%" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  )
}

function CameraIcon() {
  return (
    <svg width="38%" height="38%" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  )
}

function PersonIcon() {
  return (
    <svg width="38%" height="38%" viewBox="0 0 24 24" fill="none" stroke="#dfdfdf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
