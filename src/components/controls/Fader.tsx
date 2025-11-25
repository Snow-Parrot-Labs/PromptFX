import { useCallback, useRef, useState } from 'react'
import type { ControlColorTheme } from '@/types/effect'

interface FaderProps {
  value: number
  min: number
  max: number
  label: string
  unit?: string | undefined
  onChange: (value: number) => void
  color?: ControlColorTheme | undefined
  height?: number | undefined
}

const COLOR_THEMES: Record<ControlColorTheme, string> = {
  amber: '#f59e0b',
  cyan: '#06b6d4',
  green: '#22c55e',
  red: '#ef4444',
  white: '#e5e5e5',
  purple: '#a855f7',
}

export function Fader({
  value,
  min,
  max,
  label,
  unit = '',
  onChange,
  color = 'white',
  height = 120,
}: FaderProps): React.JSX.Element {
  const [isDragging, setIsDragging] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)

  const normalizedValue = (value - min) / (max - min)
  const capPosition = (1 - normalizedValue) * (height - 24) // 24px for cap height

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault()
      setIsDragging(true)

      const handleMouseMove = (moveEvent: MouseEvent): void => {
        if (trackRef.current === null) return
        const rect = trackRef.current.getBoundingClientRect()
        const relativeY = moveEvent.clientY - rect.top
        const newNormalized = 1 - Math.max(0, Math.min(1, relativeY / height))
        const newValue = min + newNormalized * (max - min)
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
    [min, max, height, onChange]
  )

  const formatValue = (v: number): string => {
    if (v >= 1000) return `${(v / 1000).toFixed(1)}k`
    if (v < 1) return v.toFixed(2)
    return Math.round(v).toString()
  }

  return (
    <div className="flex flex-col items-center gap-1.5">
      {/* Label */}
      <span className="text-[9px] font-medium text-[--color-text-muted] uppercase tracking-wider">
        {label}
      </span>

      {/* Track */}
      <div
        ref={trackRef}
        className="relative w-8 cursor-grab active:cursor-grabbing"
        style={{ height: `${height.toString()}px` }}
        onMouseDown={handleMouseDown}
      >
        {/* Channel groove */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-2 rounded-full"
          style={{
            height: `${height.toString()}px`,
            background: 'linear-gradient(180deg, #0a0a0f 0%, #1a1a24 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
          }}
        />

        {/* Fill level */}
        <div
          className="absolute left-1/2 -translate-x-1/2 w-2 rounded-full bottom-0"
          style={{
            height: `${(normalizedValue * height).toString()}px`,
            background: `linear-gradient(180deg, ${COLOR_THEMES[color]}88 0%, ${COLOR_THEMES[color]} 100%)`,
          }}
        />

        {/* Fader cap */}
        <div
          className="absolute left-0 w-8 h-6 rounded cursor-grab"
          style={{
            top: `${capPosition.toString()}px`,
            background: `linear-gradient(180deg, #5a5a6a 0%, #3a3a4a 50%, #2a2a3a 100%)`,
            boxShadow: isDragging
              ? `0 0 8px ${COLOR_THEMES[color]}66, inset 0 1px 0 rgba(255,255,255,0.2)`
              : 'inset 0 1px 0 rgba(255,255,255,0.2), 0 2px 4px rgba(0,0,0,0.4)',
          }}
        >
          {/* Cap groove lines */}
          <div className="absolute inset-x-1 top-2 flex flex-col gap-0.5">
            <div className="h-px bg-[#1a1a24]" />
            <div className="h-px bg-[#4a4a5a]" />
            <div className="h-px bg-[#1a1a24]" />
            <div className="h-px bg-[#4a4a5a]" />
          </div>
        </div>
      </div>

      {/* Value */}
      <span className="text-[9px] text-[--color-text-secondary] tabular-nums">
        {formatValue(value)}
        {unit}
      </span>
    </div>
  )
}
