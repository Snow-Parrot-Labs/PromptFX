import { useCallback, useRef, useState } from 'react'
import type { ControlColorTheme, ControlSize, IndicatorStyle } from '@/types/effect'

interface StyledKnobProps {
  value: number
  min: number
  max: number
  label: string
  unit?: string | undefined
  onChange: (value: number) => void
  color?: ControlColorTheme | undefined
  size?: ControlSize | undefined
  indicator?: IndicatorStyle | undefined
  inverted?: boolean | undefined // Inverts fill direction (for LPF to mirror HPF)
}

// Vintage analog color themes - brass, aged metal, warm tones
const COLOR_THEMES: Record<ControlColorTheme, { main: string; glow: string }> = {
  amber: { main: '#c4923a', glow: 'rgba(196, 146, 58, 0.3)' },
  cyan: { main: '#5a8a9a', glow: 'rgba(90, 138, 154, 0.3)' },
  green: { main: '#5a9a5a', glow: 'rgba(90, 154, 90, 0.3)' },
  red: { main: '#b54a4a', glow: 'rgba(181, 74, 74, 0.3)' },
  white: { main: '#a89f8f', glow: 'rgba(168, 159, 143, 0.2)' },
  purple: { main: '#8a6a9a', glow: 'rgba(138, 106, 154, 0.3)' },
}

const SIZE_CONFIG: Record<ControlSize, { knob: number; label: string; value: string }> = {
  xs: { knob: 30, label: 'text-[8px]', value: 'text-[7px]' },
  sm: { knob: 40, label: 'text-[9px]', value: 'text-[8px]' },
  md: { knob: 56, label: 'text-[10px]', value: 'text-[9px]' },
  lg: { knob: 72, label: 'text-xs', value: 'text-[10px]' },
}

export function StyledKnob({
  value,
  min,
  max,
  label,
  unit = '',
  onChange,
  color = 'amber',
  size = 'md',
  indicator = 'line',
  inverted = false,
}: StyledKnobProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const knobRef = useRef<HTMLDivElement>(null)
  const startY = useRef(0)
  const startValue = useRef(0)

  const theme = COLOR_THEMES[color]
  const sizeConfig = SIZE_CONFIG[size]

  // Calculate rotation: -135deg to 135deg (270deg range)
  const normalizedValue = (value - min) / (max - min)
  const rotation = -135 + normalizedValue * 270
  // For inverted knobs (LPF), fill increases as value decreases
  const fillValue = inverted ? 1 - normalizedValue : normalizedValue

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)
      startY.current = e.clientY
      startValue.current = value

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        const deltaY = startY.current - moveEvent.clientY
        const sensitivity = (max - min) / 150
        const newValue = Math.max(min, Math.min(max, startValue.current + deltaY * sensitivity))
        onChange(newValue)
      }

      const handleMouseUp = (): void => {
        setIsDragging(false)
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }

      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
    },
    [value, min, max, onChange]
  )

  const formatValue = (v: number): string => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    if (v < 1) return v.toFixed(2)
    if (v < 10) return v.toFixed(1)
    return Math.round(v).toString()
  }

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Label */}
      <span
        className={`${sizeConfig.label} font-medium text-[--color-text-muted] uppercase tracking-wider`}
      >
        {label}
      </span>

      {/* Knob */}
      <div
        ref={knobRef}
        className="relative cursor-grab active:cursor-grabbing"
        style={{
          width: sizeConfig.knob,
          height: sizeConfig.knob,
        }}
        onMouseDown={handleMouseDown}
      >
        {/* Outer ring / track - vintage brass ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: inverted
              ? // Inverted (LPF): fill from right to left
                `conic-gradient(from 225deg, rgba(58,52,40,0.5) 0deg ${((1 - fillValue) * 270).toString()}deg, ${theme.main} ${((1 - fillValue) * 270).toString()}deg 270deg, transparent 270deg)`
              : // Normal (HPF, others): fill from left to right
                `conic-gradient(from 225deg, ${theme.main} ${(fillValue * 270).toString()}deg, rgba(58,52,40,0.5) ${(fillValue * 270).toString()}deg 270deg, transparent 270deg)`,
            boxShadow: isDragging ? `0 0 8px ${theme.glow}` : 'none',
          }}
        />

        {/* Knob body - vintage bakelite */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '4px',
            background: `
              radial-gradient(ellipse at 30% 30%, #4a4438 0%, #2a2620 50%, #1a1610 100%)
            `,
            boxShadow: `
              inset 2px 2px 4px rgba(255,255,255,0.05),
              inset -2px -2px 4px rgba(0,0,0,0.4),
              0 4px 8px rgba(0,0,0,0.4)
            `,
            transform: `rotate(${rotation.toString()}deg)`,
          }}
        >
          {/* Indicator - brass line */}
          {indicator === 'line' && (
            <div
              className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: '2px',
                height:
                  size === 'lg' ? '12px' : size === 'md' ? '10px' : size === 'sm' ? '8px' : '6px',
                background: `linear-gradient(180deg, ${theme.main} 0%, ${theme.main}88 100%)`,
                boxShadow: `0 0 3px ${theme.glow}`,
              }}
            />
          )}
          {indicator === 'dot' && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: size === 'lg' ? '6px' : size === 'xs' ? '3px' : '4px',
                height: size === 'lg' ? '6px' : size === 'xs' ? '3px' : '4px',
                background: `radial-gradient(circle at 30% 30%, ${theme.main} 0%, ${theme.main}88 100%)`,
                boxShadow: `0 0 4px ${theme.glow}`,
              }}
            />
          )}
        </div>

        {/* Center cap - brushed brass */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size === 'lg' ? '20px' : size === 'md' ? '16px' : size === 'sm' ? '12px' : '9px',
            background: 'linear-gradient(145deg, #5a5448 0%, #3a3428 100%)',
            boxShadow:
              'inset 1px 1px 2px rgba(255,255,255,0.08), inset -1px -1px 2px rgba(0,0,0,0.3)',
          }}
        />
      </div>

      {/* Value */}
      <span className={`${sizeConfig.value} text-[--color-text-secondary] tabular-nums`}>
        {formatValue(value)}
        {unit}
      </span>
    </div>
  )
}
