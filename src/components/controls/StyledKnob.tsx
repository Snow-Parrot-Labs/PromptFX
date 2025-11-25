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
}

const COLOR_THEMES: Record<ControlColorTheme, { main: string; glow: string }> = {
  amber: { main: '#f59e0b', glow: 'rgba(245, 158, 11, 0.4)' },
  cyan: { main: '#06b6d4', glow: 'rgba(6, 182, 212, 0.4)' },
  green: { main: '#22c55e', glow: 'rgba(34, 197, 94, 0.4)' },
  red: { main: '#ef4444', glow: 'rgba(239, 68, 68, 0.4)' },
  white: { main: '#e5e5e5', glow: 'rgba(229, 229, 229, 0.3)' },
  purple: { main: '#a855f7', glow: 'rgba(168, 85, 247, 0.4)' },
}

const SIZE_CONFIG: Record<ControlSize, { knob: number; label: string; value: string }> = {
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
        {/* Outer ring / track */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `conic-gradient(from 225deg, ${theme.main} ${(normalizedValue * 270).toString()}deg, rgba(50,50,60,0.5) ${(normalizedValue * 270).toString()}deg 270deg, transparent 270deg)`,
            boxShadow: isDragging ? `0 0 12px ${theme.glow}` : 'none',
          }}
        />

        {/* Knob body */}
        <div
          className="absolute rounded-full"
          style={{
            inset: '4px',
            background: `
              radial-gradient(ellipse at 30% 30%, rgba(80,80,90,1) 0%, rgba(40,40,50,1) 50%, rgba(25,25,35,1) 100%)
            `,
            boxShadow: `
              inset 2px 2px 4px rgba(255,255,255,0.1),
              inset -2px -2px 4px rgba(0,0,0,0.4),
              0 4px 8px rgba(0,0,0,0.4)
            `,
            transform: `rotate(${rotation.toString()}deg)`,
          }}
        >
          {/* Indicator */}
          {indicator === 'line' && (
            <div
              className="absolute top-1.5 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: '2px',
                height: size === 'lg' ? '12px' : size === 'md' ? '10px' : '8px',
                background: theme.main,
                boxShadow: `0 0 4px ${theme.glow}`,
              }}
            />
          )}
          {indicator === 'dot' && (
            <div
              className="absolute top-2 left-1/2 -translate-x-1/2 rounded-full"
              style={{
                width: size === 'lg' ? '6px' : '4px',
                height: size === 'lg' ? '6px' : '4px',
                background: theme.main,
                boxShadow: `0 0 6px ${theme.glow}`,
              }}
            />
          )}
        </div>

        {/* Center cap */}
        <div
          className="absolute rounded-full"
          style={{
            inset: size === 'lg' ? '20px' : size === 'md' ? '16px' : '12px',
            background: 'linear-gradient(145deg, #3a3a4a 0%, #1a1a24 100%)',
            boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.1)',
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
