import { MountingScrew } from './MountingScrew'

interface BlankPanelProps {
  units?: number
  variant?: 'vent' | 'solid' | 'mesh'
}

export function BlankPanel({ units = 1, variant = 'vent' }: BlankPanelProps): React.JSX.Element {
  const height = units * 40 // ~40px per unit for blank panels

  return (
    <div
      className="relative w-full rounded border border-[--color-border]"
      style={{
        height: `${height.toString()}px`,
        background: 'linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 50%, #2a2a2a 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), inset 0 -1px 0 rgba(0,0,0,0.3)',
      }}
    >
      {/* Mounting screws */}
      <div className="absolute left-2 top-1/2 -translate-y-1/2">
        <MountingScrew size="sm" />
      </div>
      <div className="absolute right-2 top-1/2 -translate-y-1/2">
        <MountingScrew size="sm" />
      </div>

      {/* Ventilation pattern */}
      {variant === 'vent' && (
        <div className="absolute inset-0 flex items-center justify-center gap-3 px-10">
          {Array.from({ length: 10 }, (_, i) => (
            <div
              key={i}
              className="h-1/2 w-6 rounded-full"
              style={{
                background: 'linear-gradient(180deg, #0f0f0f 0%, #1a1a1a 100%)',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.8)',
              }}
            />
          ))}
        </div>
      )}

      {/* Mesh pattern */}
      {variant === 'mesh' && (
        <div
          className="absolute inset-0 mx-10 opacity-50"
          style={{
            backgroundImage: `
              radial-gradient(circle at 2px 2px, #0a0a0a 1px, transparent 1px)
            `,
            backgroundSize: '6px 6px',
          }}
        />
      )}
    </div>
  )
}
