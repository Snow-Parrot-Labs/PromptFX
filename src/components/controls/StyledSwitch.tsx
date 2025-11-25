import type { ControlColorTheme } from '@/types/effect'

interface StyledSwitchProps {
  value: boolean
  label: string
  onLabel?: string | undefined
  offLabel?: string | undefined
  onChange: (value: boolean) => void
  color?: ControlColorTheme | undefined
}

const COLOR_THEMES: Record<ControlColorTheme, { main: string; glow: string }> = {
  amber: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  cyan: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  green: { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  red: { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  white: { main: '#e5e5e5', glow: 'rgba(229, 229, 229, 0.3)' },
  purple: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
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
      {/* Label */}
      <span className="text-[9px] font-medium text-[--color-text-muted] uppercase tracking-wider">
        {label}
      </span>

      {/* Switch */}
      <button
        type="button"
        onClick={() => {
          onChange(!value)
        }}
        className="relative w-10 h-5 rounded-full transition-colors"
        style={{
          background: value
            ? `linear-gradient(90deg, ${theme.main}44 0%, ${theme.main}88 100%)`
            : 'linear-gradient(90deg, #1a1a24 0%, #0f0f15 100%)',
          boxShadow: value
            ? `0 0 8px ${theme.glow}, inset 0 1px 2px rgba(0,0,0,0.3)`
            : 'inset 0 2px 4px rgba(0,0,0,0.5)',
        }}
      >
        {/* Knob */}
        <div
          className="absolute top-0.5 w-4 h-4 rounded-full transition-all"
          style={{
            left: value ? '22px' : '2px',
            background: value
              ? `radial-gradient(circle at 30% 30%, ${theme.main} 0%, ${theme.main}cc 100%)`
              : 'linear-gradient(145deg, #4a4a5a 0%, #2a2a3a 100%)',
            boxShadow: value
              ? `0 0 6px ${theme.glow}, 0 2px 4px rgba(0,0,0,0.3)`
              : 'inset 1px 1px 2px rgba(255,255,255,0.1), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </button>

      {/* Status Label */}
      <span
        className="text-[8px] font-medium uppercase tracking-wider"
        style={{ color: value ? theme.main : 'var(--color-text-muted)' }}
      >
        {value ? onLabel : offLabel}
      </span>
    </div>
  )
}
