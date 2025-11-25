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

  // Vintage VU meter colors - warm incandescent style
  const getSegmentColor = (index: number): string => {
    const percentage = index / segments
    if (percentage > 0.85) return '#b54a4a' // Warm red
    if (percentage > 0.7) return '#c4923a' // Amber
    return '#5a9a5a' // Warm green
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
                  : 'linear-gradient(180deg, #1a1610 0%, #0d0c0a 100%)',
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
                : 'linear-gradient(180deg, #1a1610 0%, #0d0c0a 100%)',
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
