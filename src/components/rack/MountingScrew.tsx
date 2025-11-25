interface MountingScrewProps {
  size?: 'sm' | 'md'
}

export function MountingScrew({ size = 'md' }: MountingScrewProps): React.JSX.Element {
  const sizeClasses = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'

  return (
    <div
      className={`${sizeClasses} rounded-full relative`}
      style={{
        background: 'linear-gradient(145deg, #5a5a5a 0%, #2a2a2a 50%, #4a4a4a 100%)',
        boxShadow: `
          inset 1px 1px 2px rgba(255,255,255,0.15),
          inset -1px -1px 2px rgba(0,0,0,0.4),
          0 2px 4px rgba(0,0,0,0.5)
        `,
      }}
    >
      {/* Slot groove */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          width: size === 'sm' ? '8px' : '10px',
          height: '2px',
          background: 'linear-gradient(180deg, #1a1a1a 0%, #3a3a3a 100%)',
          boxShadow: 'inset 0 1px 1px rgba(0,0,0,0.8)',
        }}
      />
    </div>
  )
}
