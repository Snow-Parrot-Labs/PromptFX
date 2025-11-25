import type { ControlColorTheme } from '@/types/effect'

interface StyledSwitchProps {
  value: boolean
  label: string
  onLabel?: string | undefined
  offLabel?: string | undefined
  onChange: (value: boolean) => void
  color?: ControlColorTheme | undefined
}

// Vintage warm indicator colors
const COLOR_THEMES: Record<ControlColorTheme, { main: string; glow: string }> = {
  amber: { main: '#c4923a', glow: 'rgba(196, 146, 58, 0.3)' },
  cyan: { main: '#5a8a9a', glow: 'rgba(90, 138, 154, 0.3)' },
  green: { main: '#5a9a5a', glow: 'rgba(90, 154, 90, 0.3)' },
  red: { main: '#b54a4a', glow: 'rgba(181, 74, 74, 0.3)' },
  white: { main: '#a89f8f', glow: 'rgba(168, 159, 143, 0.2)' },
  purple: { main: '#8a6a9a', glow: 'rgba(138, 106, 154, 0.3)' },
}

export function StyledSwitch({
  value,
  label,
  onLabel = 'ON',
  offLabel = 'OFF',
  onChange,
  color = 'green',
}: StyledSwitchProps): React.JSX.Element {
  const theme = COLOR_THEMES[color]

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Label - vintage engraved style */}
      <span className="text-[9px] font-medium text-[--color-text-muted] uppercase tracking-wider">
        {label}
      </span>

      {/* Vintage Rocker Toggle Switch */}
      <button
        type="button"
        onClick={() => {
          onChange(!value)
        }}
        className="relative w-10 h-5 rounded-sm cursor-pointer"
        style={{
          background: 'linear-gradient(180deg, #1a1610 0%, #0d0c0a 100%)',
          border: '1px solid #3a3428',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.6), 0 1px 0 rgba(90,84,72,0.2)',
        }}
      >
        {/* Metal Toggle Handle */}
        <div
          className="absolute top-0.5 w-4 h-3.5 rounded-sm transition-all duration-150"
          style={{
            left: value ? '21px' : '2px',
            background: value
              ? `linear-gradient(180deg, #7a6a4a 0%, #5a4a3a 50%, #4a3a2a 100%)`
              : 'linear-gradient(180deg, #6a645a 0%, #4a4438 50%, #3a3428 100%)',
            boxShadow: value
              ? `inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4), 0 0 8px ${theme.glow}`
              : 'inset 0 1px 0 rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          {/* Grip lines on handle */}
          <div className="absolute inset-x-1 top-1 flex flex-col gap-px">
            <div className="h-px bg-black/20" />
            <div className="h-px bg-white/5" />
          </div>
        </div>

        {/* Indicator jewel/lens when on */}
        {value && (
          <div
            className="absolute right-0.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${theme.main} 0%, ${theme.main}88 100%)`,
              boxShadow: `0 0 4px ${theme.glow}, inset 0 1px 1px rgba(255,255,255,0.3)`,
            }}
          />
        )}
      </button>

      {/* Status Label - vintage brass plate style */}
      <span
        className="text-[8px] font-medium uppercase tracking-wider"
        style={{ color: value ? theme.main : 'var(--color-text-muted)' }}
      >
        {value ? onLabel : offLabel}
      </span>
    </div>
  )
}
