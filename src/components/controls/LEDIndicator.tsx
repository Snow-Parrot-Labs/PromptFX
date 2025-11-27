import type { DecorationLEDColor } from '@/types/effect'

interface LEDIndicatorProps {
  color: DecorationLEDColor
  active?: boolean
  size?: 'sm' | 'md'
}

// Vintage jewel indicator lens colors - warm incandescent style
const LED_COLORS: Record<DecorationLEDColor, { on: string; off: string; glow: string }> = {
  green: {
    on: '#5a9a5a',
    off: '#1a2a1a',
    glow: 'rgba(90, 154, 90, 0.5)',
  },
  amber: {
    on: '#c4923a',
    off: '#2a2010',
    glow: 'rgba(196, 146, 58, 0.5)',
  },
  red: {
    on: '#b54a4a',
    off: '#2a1414',
    glow: 'rgba(181, 74, 74, 0.5)',
  },
  blue: {
    on: '#5a7a9a',
    off: '#141a24',
    glow: 'rgba(90, 122, 154, 0.5)',
  },
  cyan: {
    on: '#4ac4c4',
    off: '#142424',
    glow: 'rgba(74, 196, 196, 0.5)',
  },
  purple: {
    on: '#9a5a9a',
    off: '#241428',
    glow: 'rgba(154, 90, 154, 0.5)',
  },
  white: {
    on: '#c4c4c4',
    off: '#242424',
    glow: 'rgba(196, 196, 196, 0.5)',
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
          ? `0 0 6px ${colors.glow}, 0 0 12px ${colors.glow}, inset 0 1px 2px rgba(255,255,255,0.25)`
          : 'inset 0 1px 2px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.03)',
        border: '1px solid rgba(0,0,0,0.3)',
      }}
    />
  )
}
