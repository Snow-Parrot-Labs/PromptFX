import { useRef, useCallback, useState, useEffect } from 'react'

interface SliderProps {
  value: number
  min: number
  max: number
  step?: number
  unit?: string
  label: string
  orientation?: 'horizontal' | 'vertical'
  onChange: (value: number) => void
}

export function Slider({
  value,
  min,
  max,
  step = 1,
  unit = '',
  label,
  orientation = 'horizontal',
  onChange,
}: SliderProps): React.JSX.Element {
  const trackRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const normalizedValue = (value - min) / (max - min)

  const updateValue = useCallback(
    (clientX: number, clientY: number): void => {
      const track = trackRef.current
      if (track === null) return

      const rect = track.getBoundingClientRect()
      let normalized: number

      if (orientation === 'horizontal') {
        normalized = (clientX - rect.left) / rect.width
      } else {
        normalized = 1 - (clientY - rect.top) / rect.height
      }

      normalized = Math.max(0, Math.min(1, normalized))
      const newValue = min + normalized * (max - min)
      const steppedValue = Math.round(newValue / step) * step
      onChange(Math.max(min, Math.min(max, steppedValue)))
    },
    [min, max, step, onChange, orientation]
  )

  const handleMouseDown = useCallback(
    (e: React.MouseEvent): void => {
      e.preventDefault()
      setIsDragging(true)
      updateValue(e.clientX, e.clientY)
    },
    [updateValue]
  )

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent): void => {
      updateValue(e.clientX, e.clientY)
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
  }, [isDragging, updateValue])

  const displayValue =
    step >= 1
      ? Math.round(value).toString()
      : value.toFixed(Math.max(0, -Math.floor(Math.log10(step))))

  const isHorizontal = orientation === 'horizontal'

  return (
    <div
      className={`flex ${isHorizontal ? 'flex-col' : 'flex-row'} items-center gap-2`}
      style={isHorizontal ? {} : { height: '120px' }}
    >
      <div className="text-xs text-gray-400 whitespace-nowrap">{label}</div>

      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className={`relative bg-gray-700 rounded-full cursor-pointer ${
          isHorizontal ? 'w-full h-2' : 'w-2 h-full'
        }`}
        role="slider"
        tabIndex={0}
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-orientation={orientation}
        onKeyDown={(e) => {
          const isIncrease =
            (isHorizontal && e.key === 'ArrowRight') ||
            (!isHorizontal && e.key === 'ArrowUp') ||
            e.key === 'ArrowUp'
          const isDecrease =
            (isHorizontal && e.key === 'ArrowLeft') ||
            (!isHorizontal && e.key === 'ArrowDown') ||
            e.key === 'ArrowDown'

          if (isIncrease) {
            e.preventDefault()
            onChange(Math.min(max, value + step))
          } else if (isDecrease) {
            e.preventDefault()
            onChange(Math.max(min, value - step))
          }
        }}
      >
        {/* Filled track */}
        <div
          className="absolute bg-blue-500 rounded-full"
          style={
            isHorizontal
              ? { left: 0, top: 0, bottom: 0, width: `${(normalizedValue * 100).toString()}%` }
              : { left: 0, right: 0, bottom: 0, height: `${(normalizedValue * 100).toString()}%` }
          }
        />

        {/* Thumb */}
        <div
          className={`absolute w-4 h-4 bg-white rounded-full shadow-md transform ${
            isDragging ? 'scale-110' : ''
          } transition-transform`}
          style={
            isHorizontal
              ? {
                  left: `${(normalizedValue * 100).toString()}%`,
                  top: '50%',
                  transform: `translate(-50%, -50%) ${isDragging ? 'scale(1.1)' : ''}`,
                }
              : {
                  bottom: `${(normalizedValue * 100).toString()}%`,
                  left: '50%',
                  transform: `translate(-50%, 50%) ${isDragging ? 'scale(1.1)' : ''}`,
                }
          }
        />
      </div>

      <div className="text-sm font-mono text-white whitespace-nowrap">
        {displayValue}
        {unit !== '' && <span className="text-gray-500 ml-0.5">{unit}</span>}
      </div>
    </div>
  )
}
