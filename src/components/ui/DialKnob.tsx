import { useRef, useEffect, useCallback, useState } from 'react'

interface DialKnobProps {
  value: number
  min: number
  max: number
  step?: number
  label: string
  onChange: (value: number) => void
  size?: number
  curve?: 'linear' | 'logarithmic'
  formatValue?: (value: number) => string
  marks?: Array<{ value: number; label: string }> // For discrete stepped knobs
  wrapAround?: boolean // Enable infinite spin for stepped knobs
  iconMode?: 'waveform' // Draw waveform icons instead of text labels
}

// Draw waveform icon at position
function drawWaveformIcon(
  ctx: CanvasRenderingContext2D,
  type: string,
  x: number,
  y: number,
  iconSize: number
): void {
  ctx.save()
  ctx.translate(x, y)
  ctx.strokeStyle = '#2a2518'
  ctx.lineWidth = 1.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'

  const halfSize = iconSize / 2

  ctx.beginPath()
  switch (type.toLowerCase()) {
    case 'sin':
    case 'sine':
      // Sine wave: smooth curve
      ctx.moveTo(-halfSize, 0)
      ctx.bezierCurveTo(
        -halfSize * 0.5,
        -halfSize * 0.8,
        halfSize * 0.5,
        halfSize * 0.8,
        halfSize,
        0
      )
      break

    case 'saw':
    case 'sawtooth':
      // Sawtooth: ramp up, drop down
      ctx.moveTo(-halfSize, halfSize * 0.6)
      ctx.lineTo(0, -halfSize * 0.6)
      ctx.lineTo(0, halfSize * 0.6)
      ctx.lineTo(halfSize, -halfSize * 0.6)
      break

    case 'sqr':
    case 'square':
      // Square wave: step pattern
      ctx.moveTo(-halfSize, halfSize * 0.5)
      ctx.lineTo(-halfSize, -halfSize * 0.5)
      ctx.lineTo(0, -halfSize * 0.5)
      ctx.lineTo(0, halfSize * 0.5)
      ctx.lineTo(halfSize, halfSize * 0.5)
      ctx.lineTo(halfSize, -halfSize * 0.5)
      break

    case 'tri':
    case 'triangle':
      // Triangle wave: zigzag
      ctx.moveTo(-halfSize, 0)
      ctx.lineTo(-halfSize * 0.33, -halfSize * 0.6)
      ctx.lineTo(halfSize * 0.33, halfSize * 0.6)
      ctx.lineTo(halfSize, 0)
      break
  }
  ctx.stroke()
  ctx.restore()
}

export function DialKnob({
  value,
  min,
  max,
  step,
  label,
  onChange,
  size = 80,
  curve = 'linear',
  formatValue,
  marks,
  wrapAround = false,
  iconMode,
}: DialKnobProps): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const dragStartY = useRef(0)
  const dragStartValue = useRef(0)

  // Convert between visual and actual value based on curve
  const normalizeValue = useCallback(
    (val: number): number => {
      const clamped = Math.max(min, Math.min(max, val))
      if (curve === 'logarithmic') {
        // Logarithmic scale for frequency
        const logMin = Math.log10(min)
        const logMax = Math.log10(max)
        const logVal = Math.log10(clamped)
        return (logVal - logMin) / (logMax - logMin)
      }
      return (clamped - min) / (max - min)
    },
    [min, max, curve]
  )

  const denormalizeValue = useCallback(
    (t: number): number => {
      const clamped = Math.max(0, Math.min(1, t))
      if (curve === 'logarithmic') {
        const logMin = Math.log10(min)
        const logMax = Math.log10(max)
        return Math.pow(10, logMin + clamped * (logMax - logMin))
      }
      return min + clamped * (max - min)
    },
    [min, max, curve]
  )

  // Draw the dial
  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas === null) return

    const ctx = canvas.getContext('2d')
    if (ctx === null) return

    const dpr = window.devicePixelRatio
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${String(size)}px`
    canvas.style.height = `${String(size)}px`
    ctx.scale(dpr, dpr)

    const centerX = size / 2
    const centerY = size / 2
    const outerRadius = size * 0.48
    const innerRadius = size * 0.32
    const normalizedValue = normalizeValue(value)

    // Rotation range: 270 degrees (from -135 to +135)
    const startAngle = Math.PI * 0.75 // 135 degrees (bottom-left)
    const endAngle = Math.PI * 2.25 // 405 degrees (bottom-right, going clockwise)
    const totalAngle = endAngle - startAngle

    ctx.clearRect(0, 0, size, size)

    // Draw outer brass ring
    const brassGradient = ctx.createRadialGradient(
      centerX - outerRadius * 0.3,
      centerY - outerRadius * 0.3,
      0,
      centerX,
      centerY,
      outerRadius
    )
    brassGradient.addColorStop(0, '#d4c896')
    brassGradient.addColorStop(0.3, '#c9bc7d')
    brassGradient.addColorStop(0.7, '#a89b5c')
    brassGradient.addColorStop(1, '#8b7d45')

    ctx.beginPath()
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2)
    ctx.fillStyle = brassGradient
    ctx.fill()

    // Draw inner ring edge (shadow)
    ctx.beginPath()
    ctx.arc(centerX, centerY, innerRadius + 2, 0, Math.PI * 2)
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
    ctx.fill()

    // Draw tick marks and numbers
    const numTicks = marks !== undefined ? marks.length : 11
    const tickLength = size * 0.06
    const smallTickLength = size * 0.03

    for (let i = 0; i < numTicks; i++) {
      const t = i / (numTicks - 1)
      const angle = startAngle + t * totalAngle

      // Major tick
      const tickStart = outerRadius - tickLength - 2
      const tickEnd = outerRadius - 2
      const x1 = centerX + Math.cos(angle) * tickStart
      const y1 = centerY + Math.sin(angle) * tickStart
      const x2 = centerX + Math.cos(angle) * tickEnd
      const y2 = centerY + Math.sin(angle) * tickEnd

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = '#2a2518'
      ctx.lineWidth = 1.5
      ctx.stroke()

      // Number label or icon
      // Position labels/icons further out for marks with icons
      const labelOffset = iconMode === 'waveform' ? size * 0.04 : size * 0.08
      const labelRadius = outerRadius - tickLength - labelOffset
      const labelX = centerX + Math.cos(angle) * labelRadius
      const labelY = centerY + Math.sin(angle) * labelRadius

      if (iconMode === 'waveform' && marks !== undefined) {
        // Draw waveform icon
        const iconSize = size * 0.14 // Larger icons
        drawWaveformIcon(ctx, marks[i].label, labelX, labelY, iconSize)
      } else {
        ctx.save()
        ctx.translate(labelX, labelY)
        ctx.fillStyle = '#2a2518'
        ctx.font = `bold ${String(Math.round(size * 0.09))}px sans-serif`
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'

        if (marks !== undefined) {
          ctx.fillText(marks[i].label, 0, 0)
        } else {
          ctx.fillText(String(i * 10), 0, 0)
        }
        ctx.restore()
      }

      // Small ticks between major ticks (if not using marks)
      if (marks === undefined && i < numTicks - 1) {
        for (let j = 1; j < 5; j++) {
          const subT = (i + j / 5) / (numTicks - 1)
          const subAngle = startAngle + subT * totalAngle
          const subTickStart = outerRadius - smallTickLength - 2
          const subX1 = centerX + Math.cos(subAngle) * subTickStart
          const subY1 = centerY + Math.sin(subAngle) * subTickStart
          const subX2 = centerX + Math.cos(subAngle) * tickEnd
          const subY2 = centerY + Math.sin(subAngle) * tickEnd

          ctx.beginPath()
          ctx.moveTo(subX1, subY1)
          ctx.lineTo(subX2, subY2)
          ctx.strokeStyle = '#2a2518'
          ctx.lineWidth = 0.75
          ctx.stroke()
        }
      }
    }

    // Draw inner black scalloped knob
    const lobes = 8
    const lobeDepth = size * 0.025

    ctx.beginPath()
    for (let i = 0; i <= 360; i++) {
      const angle = (i * Math.PI) / 180
      const lobeOffset = Math.cos(lobes * angle) * lobeDepth
      const r = innerRadius - lobeOffset
      const x = centerX + Math.cos(angle) * r
      const y = centerY + Math.sin(angle) * r
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    }
    ctx.closePath()

    // Black gradient for knob body
    const knobGradient = ctx.createRadialGradient(
      centerX - innerRadius * 0.4,
      centerY - innerRadius * 0.4,
      0,
      centerX,
      centerY,
      innerRadius
    )
    knobGradient.addColorStop(0, '#4a4a4a')
    knobGradient.addColorStop(0.3, '#2a2a2a')
    knobGradient.addColorStop(0.7, '#1a1a1a')
    knobGradient.addColorStop(1, '#0a0a0a')

    ctx.fillStyle = knobGradient
    ctx.fill()

    // Add subtle edge highlight
    ctx.strokeStyle = 'rgba(100, 100, 100, 0.3)'
    ctx.lineWidth = 1
    ctx.stroke()

    // Draw center dome
    const domeRadius = innerRadius * 0.6
    const domeGradient = ctx.createRadialGradient(
      centerX - domeRadius * 0.3,
      centerY - domeRadius * 0.3,
      0,
      centerX,
      centerY,
      domeRadius
    )
    domeGradient.addColorStop(0, '#3a3a3a')
    domeGradient.addColorStop(0.5, '#252525')
    domeGradient.addColorStop(1, '#151515')

    ctx.beginPath()
    ctx.arc(centerX, centerY, domeRadius, 0, Math.PI * 2)
    ctx.fillStyle = domeGradient
    ctx.fill()

    // Draw position indicator line on the knob
    const indicatorAngle = startAngle + normalizedValue * totalAngle
    const indicatorStart = domeRadius + 4
    const indicatorEnd = innerRadius - 4
    const indX1 = centerX + Math.cos(indicatorAngle) * indicatorStart
    const indY1 = centerY + Math.sin(indicatorAngle) * indicatorStart
    const indX2 = centerX + Math.cos(indicatorAngle) * indicatorEnd
    const indY2 = centerY + Math.sin(indicatorAngle) * indicatorEnd

    ctx.beginPath()
    ctx.moveTo(indX1, indY1)
    ctx.lineTo(indX2, indY2)
    ctx.strokeStyle = '#888'
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.stroke()
  }, [value, size, normalizeValue, marks, iconMode])

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

      // Use higher sensitivity for stepped knobs (marks)
      const sensitivity = marks !== undefined ? 0.02 : 0.004

      if (marks !== undefined && wrapAround) {
        // Wrap-around mode for stepped knobs
        const numMarks = marks.length
        const indexDelta = deltaY * sensitivity * numMarks
        let newIndex = Math.round(dragStartValue.current * (numMarks - 1) + indexDelta)
        // Wrap around using modulo
        newIndex = ((newIndex % numMarks) + numMarks) % numMarks
        onChange(marks[newIndex].value)
      } else if (marks !== undefined) {
        // Stepped knob without wrap-around
        const newNormalized = Math.max(
          0,
          Math.min(1, dragStartValue.current + deltaY * sensitivity)
        )
        const newValue = denormalizeValue(newNormalized)
        const markValues = marks.map((m) => m.value)
        let closest = markValues[0]
        let closestDist = Math.abs(newValue - closest)
        for (const mv of markValues) {
          const dist = Math.abs(newValue - mv)
          if (dist < closestDist) {
            closest = mv
            closestDist = dist
          }
        }
        onChange(closest)
      } else {
        // Continuous knob
        const newNormalized = Math.max(
          0,
          Math.min(1, dragStartValue.current + deltaY * sensitivity)
        )
        let newValue = denormalizeValue(newNormalized)

        if (step !== undefined) {
          newValue = Math.round(newValue / step) * step
        }

        onChange(Math.max(min, Math.min(max, newValue)))
      }
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
  }, [isDragging, denormalizeValue, onChange, step, min, max, marks, wrapAround, value])

  // Double-click to reset to center/default
  const handleDoubleClick = useCallback((): void => {
    if (marks !== undefined) {
      // For discrete knobs, reset to first mark
      onChange(marks[0].value)
    } else {
      // For continuous, reset to geometric mean (good for log scales)
      const defaultValue = curve === 'logarithmic' ? Math.sqrt(min * max) : (min + max) / 2
      onChange(step !== undefined ? Math.round(defaultValue / step) * step : defaultValue)
    }
  }, [min, max, step, onChange, marks, curve])

  // Format display value
  const displayValue =
    formatValue !== undefined
      ? formatValue(value)
      : marks !== undefined
        ? (marks.find((m) => m.value === value)?.label ?? String(value))
        : String(Math.round(value))

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[10px] text-[--color-text-muted] uppercase tracking-wide">{label}</span>
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
          const increment = step ?? (max - min) / 100
          if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
            e.preventDefault()
            if (marks !== undefined) {
              const idx = marks.findIndex((m) => m.value === value)
              if (wrapAround) {
                // Wrap around to beginning
                const nextIdx = (idx + 1) % marks.length
                onChange(marks[nextIdx].value)
              } else if (idx < marks.length - 1) {
                onChange(marks[idx + 1].value)
              }
            } else {
              onChange(Math.min(max, value + increment))
            }
          } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
            e.preventDefault()
            if (marks !== undefined) {
              const idx = marks.findIndex((m) => m.value === value)
              if (wrapAround) {
                // Wrap around to end
                const prevIdx = (idx - 1 + marks.length) % marks.length
                onChange(marks[prevIdx].value)
              } else if (idx > 0) {
                onChange(marks[idx - 1].value)
              }
            } else {
              onChange(Math.max(min, value - increment))
            }
          }
        }}
      />
      <div className="text-xs font-mono text-[--color-text-primary]">{displayValue}</div>
    </div>
  )
}
