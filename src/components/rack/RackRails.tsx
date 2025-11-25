interface RackRailsProps {
  units?: number
}

export function RackRails({ units = 8 }: RackRailsProps): React.JSX.Element {
  // Each rack unit is ~44px (1.75 inches at screen scale)
  const holes = Array.from({ length: units }, (_, i) => i)

  return (
    <div className="w-8 flex-shrink-0 bg-gradient-to-b from-[--color-rack-rail] to-[#0f0f0f] flex flex-col items-center py-2 gap-[36px]">
      {holes.map((i) => (
        <RackHole key={i} />
      ))}
    </div>
  )
}

function RackHole(): React.JSX.Element {
  return (
    <div className="relative">
      {/* Outer ring / beveled edge */}
      <div
        className="w-5 h-5 rounded-sm"
        style={{
          background: 'linear-gradient(145deg, #2a2a2a 0%, #0a0a0a 100%)',
          boxShadow: 'inset 1px 1px 2px rgba(0,0,0,0.8), inset -1px -1px 1px rgba(60,60,60,0.2)',
        }}
      >
        {/* Inner hole */}
        <div
          className="absolute inset-1 rounded-sm"
          style={{
            background: 'radial-gradient(ellipse at center, #000 60%, #1a1a1a 100%)',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.9)',
          }}
        />
      </div>
    </div>
  )
}
