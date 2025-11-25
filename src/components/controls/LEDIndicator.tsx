import type { DecorationLEDColor } from '@/types/effect'

interface LEDIndicatorProps {
  color: DecorationLEDColor
  active?: boolean
  size?: 'sm' | 'md'
}

const LED_COLORS: Record<DecorationLEDColor, { on: string; off: string; glow: string }> = {
  green: {
    on: '#22c55e',
    off: '#0f3d1a',
    glow: 'rgba(34, 197, 94, 0.6)',
  },
  amber: {
    on: '#f59e0b',
    off: '#3d2a05',
    glow: 'rgba(245, 158, 11, 0.6)',
  },
  red: {
    on: '#ef4444',
    off: '#3d1414',
    glow: 'rgba(239, 68, 68, 0.6)',
  },
  blue: {
    on: '#3b82f6',
    off: '#142a4d',
    glow: 'rgba(59, 130, 246, 0.6)',
  },
}

export function LEDIndicator({
  color,
  active = true,
  size = 'sm',
}: LEDIndicatorProps): React.JSX.Element {
  const colors = LED_COLORS[color]
  const sizeClass = size === 'sm' ? 'w-2 h-2' : 'w-3 h-3'

  return (
    <div
      className={`${sizeClass} rounded-full`}
      style={{
        background: active
          ? `radial-gradient(circle at 30% 30%, ${colors.on} 0%, ${colors.on}cc 60%, ${colors.on}88 100%)`
          : colors.off,
        boxShadow: active
          ? `0 0 8px ${colors.glow}, inset 0 1px 2px rgba(255,255,255,0.3)`
          : 'inset 0 1px 2px rgba(0,0,0,0.5)',
      }}
    />
  )
}
