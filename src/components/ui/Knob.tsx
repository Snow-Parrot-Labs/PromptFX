import { useRef, useEffect, useCallback, useState } from 'react'

interface KnobProps {
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  curve?: 'linear' | 'exponential' | 'logarithmic'
  label: string
  onChange: (value: number) => void
  size?: number
}

export function Knob({
  value,
  min,
  max,
  step = 1,
  unit = '',
  curve = 'linear',
  label,
  onChange,
  size = 64,
}: KnobProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartValue = useRef(0)

  // Convert between visual and actual value based on curve
  const normalizeValue = useCallback(
    (val: number): number => {
      const t = (val - min) / (max - min)
      if (curve === 'exponential') {
        return Math.pow(t, 2)
      }
      if (curve === 'logarithmic') {
        return Math.sqrt(t)
      }
      return t
    },
    [min, max, curve]
  )

  const denormalizeValue = useCallback(
    (t: number): number => {
      let normalized = t
      if (curve === 'exponential') {
        normalized = Math.sqrt(t)
      } else if (curve === 'logarithmic') {
        normalized = Math.pow(t, 2)
      }
      return min + normalized * (max - min)
    },
    [min, max, curve]
  )

  // Draw knob
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    const dpr = window.devicePixelRatio
    const displaySize = size
    canvas.width = displaySize * dpr
    canvas.height = displaySize * dpr
    canvas.style.width = `${displaySize.toString()}px`
    canvas.style.height = `${displaySize.toString()}px`
    ctx.scale(dpr, dpr)

    const centerX = displaySize / 2
    const centerY = displaySize / 2
    const radius = displaySize * 0.38
    const normalizedValue = normalizeValue(value)

    // Clear
    ctx.clearRect(0, 0, displaySize, displaySize)

    // Background track
    const startAngle = Math.PI * 0.75
    const endAngle = Math.PI * 2.25
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, endAngle)
    ctx.strokeStyle = '#374151'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // Value arc
    const valueAngle = startAngle + normalizedValue * (endAngle - startAngle)
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, startAngle, valueAngle)
    ctx.strokeStyle = '#3b82f6'
    ctx.lineWidth = 4
    ctx.lineCap = 'round'
    ctx.stroke()

    // Knob body
    const gradient = ctx.createRadialGradient(
      centerX - radius * 0.3,
      centerY - radius * 0.3,
      0,
      centerX,
      centerY,
      radius
    )
    gradient.addColorStop(0, '#4b5563')
    gradient.addColorStop(1, '#1f2937')
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius - 6, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // Indicator line
    const indicatorLength = radius - 12
    const indicatorX = centerX + Math.cos(valueAngle) * indicatorLength
    const indicatorY = centerY + Math.sin(valueAngle) * indicatorLength
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(indicatorX, indicatorY)
    ctx.strokeStyle = '#f3f4f6'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }, [value, size, normalizeValue])

  // Handle drag
  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      e.preventDefault()
      setIsDragging(true)
      dragStartY.current = e.clientY
      dragStartValue.current = normalizeValue(value)
    },
    [value, normalizeValue]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent): void => {
      const deltaY = dragStartY.current - e.clientY
      const sensitivity = 0.005
      const newNormalized = Math.max(0, Math.min(1, dragStartValue.current + deltaY * sensitivity))
      const newValue = denormalizeValue(newNormalized)
      const steppedValue = Math.round(newValue / step) * step
      onChange(Math.max(min, Math.min(max, steppedValue)))
    }

    const handleMouseUp = (): void => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, denormalizeValue, onChange, step, min, max])

  // Double-click to reset
  const handleDoubleClick = useCallback((): void => {
    const defaultValue = (min + max) / 2
    onChange(Math.round(defaultValue / step) * step)
  }, [min, max, step, onChange])

  // Format display value
  const displayValue =
    step >= 1
      ? Math.round(value).toString()
      : value.toFixed(Math.max(0, -Math.floor(Math.log10(step))))

  return (
    <div className="flex flex-col items-center gap-1">
      <canvas
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onDoubleClick={handleDoubleClick}
        className={`cursor-pointer ${isDragging ? 'cursor-grabbing' : ''}`}
        tabIndex={0}
        role="slider"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault()
            onChange(Math.min(max, value + step))
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault()
            onChange(Math.max(min, value - step))
          }
        }}
      />
      <div className="text-center">
        <div className="text-xs text-gray-400">{label}</div>
        <div className="text-sm font-mono text-white">
          {displayValue}
          {unit !== '' && <span className="text-gray-500 ml-0.5">{unit}</span>}
        </div>
      </div>
    </div>
  )
}
