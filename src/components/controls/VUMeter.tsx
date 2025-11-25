interface VUMeterProps {
  level: number // 0-1
  segments?: number | undefined
  orientation?: 'horizontal' | 'vertical' | undefined
}

export function VUMeter({
  level,
  segments = 8,
  orientation = 'vertical',
}: VUMeterProps): React.JSX.Element {
  const activeSegments = Math.round(level * segments)

  const getSegmentColor = (index: number): string => {
    const percentage = index / segments
    if (percentage > 0.85) return '#ef4444' // Red
    if (percentage > 0.7) return '#f59e0b' // Amber
    return '#22c55e' // Green
  }

  const segmentArray = Array.from({ length: segments }, (_, i) => i)

  if (orientation === 'horizontal') {
    return (
      <div className="flex gap-0.5">
        {segmentArray.map((i) => (
          <div
            key={i}
            className="w-2 h-4 rounded-sm"
            style={{
              background:
                i < activeSegments
                  ? getSegmentColor(i)
                  : 'linear-gradient(180deg, #1a1a24 0%, #0f0f15 100%)',
              boxShadow:
                i < activeSegments
                  ? `0 0 4px ${getSegmentColor(i)}66`
                  : 'inset 0 1px 2px rgba(0,0,0,0.5)',
            }}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col-reverse gap-0.5">
      {segmentArray.map((i) => (
        <div
          key={i}
          className="w-4 h-2 rounded-sm"
          style={{
            background:
              i < activeSegments
                ? getSegmentColor(i)
                : 'linear-gradient(180deg, #1a1a24 0%, #0f0f15 100%)',
            boxShadow:
              i < activeSegments
                ? `0 0 4px ${getSegmentColor(i)}66`
                : 'inset 0 1px 2px rgba(0,0,0,0.5)',
          }}
        />
      ))}
    </div>
  )
}
