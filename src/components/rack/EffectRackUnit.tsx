import { MountingScrew } from './MountingScrew'

interface EffectRackUnitProps {
  children: React.ReactNode
  rackUnits?: number
}

export function EffectRackUnit({
  children,
  rackUnits = 2,
}: EffectRackUnitProps): React.JSX.Element {
  // Each rack unit ~88px (2U default = 176px minimum)
  const minHeight = rackUnits * 88

  return (
    <div className="relative">
      {/* Corner screws - Top */}
      <div className="absolute -left-2 top-3 z-10">
        <MountingScrew />
      </div>
      <div className="absolute -right-2 top-3 z-10">
        <MountingScrew />
      </div>
      <div className="absolute -left-2 top-10 z-10">
        <MountingScrew />
      </div>
      <div className="absolute -right-2 top-10 z-10">
        <MountingScrew />
      </div>

      {/* Corner screws - Bottom */}
      <div className="absolute -left-2 bottom-3 z-10">
        <MountingScrew />
      </div>
      <div className="absolute -right-2 bottom-3 z-10">
        <MountingScrew />
      </div>
      <div className="absolute -left-2 bottom-10 z-10">
        <MountingScrew />
      </div>
      <div className="absolute -right-2 bottom-10 z-10">
        <MountingScrew />
      </div>

      {/* Panel body with bevel effect */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          minHeight: `${minHeight.toString()}px`,
          boxShadow: `
            inset 2px 2px 4px rgba(255,255,255,0.05),
            inset -2px -2px 4px rgba(0,0,0,0.3),
            0 4px 16px rgba(0,0,0,0.5),
            0 8px 32px rgba(0,0,0,0.3)
          `,
        }}
      >
        {children}
      </div>
    </div>
  )
}
