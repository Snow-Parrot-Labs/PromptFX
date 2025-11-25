interface SkeletonProps {
  className?: string
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded'
  width?: string | number
  height?: string | number
  animate?: boolean
}

export function Skeleton({
  className = '',
  variant = 'text',
  width,
  height,
  animate = true,
}: SkeletonProps): React.JSX.Element {
  const baseClasses = 'bg-[--color-bg-tertiary]'
  const animationClass = animate ? 'animate-pulse' : ''

  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: '',
    rounded: 'rounded-lg',
  }

  const style: React.CSSProperties = {}
  if (width !== undefined) style.width = typeof width === 'number' ? `${width.toString()}px` : width
  if (height !== undefined)
    style.height = typeof height === 'number' ? `${height.toString()}px` : height

  // Default heights for text variant
  if (variant === 'text' && height === undefined) {
    style.height = '1em'
  }

  return (
    <div
      className={`${baseClasses} ${animationClass} ${variantClasses[variant]} ${className}`}
      style={style}
      aria-hidden="true"
    />
  )
}

// Preset skeleton components
export function SkeletonKnob(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton variant="circular" width={64} height={64} />
      <Skeleton variant="text" width={60} height={12} />
      <Skeleton variant="text" width={40} height={10} />
    </div>
  )
}

export function SkeletonSlider(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-2">
      <Skeleton variant="text" width={80} height={12} />
      <Skeleton variant="rounded" width="100%" height={8} />
      <div className="flex justify-between">
        <Skeleton variant="text" width={30} height={10} />
        <Skeleton variant="text" width={30} height={10} />
      </div>
    </div>
  )
}

export function SkeletonSwitch(): React.JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <Skeleton variant="rounded" width={44} height={24} />
      <Skeleton variant="text" width={60} height={12} />
    </div>
  )
}

export function SkeletonEffectPanel(): React.JSX.Element {
  return (
    <div className="bg-[--color-bg-secondary] rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <Skeleton variant="text" width={200} height={24} />
          <Skeleton variant="text" width={300} height={14} />
        </div>
        <Skeleton variant="rounded" width={100} height={36} />
      </div>

      {/* Controls grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
        <SkeletonKnob />
        <SkeletonKnob />
        <SkeletonKnob />
        <SkeletonKnob />
      </div>

      {/* Additional controls */}
      <div className="space-y-4">
        <SkeletonSlider />
        <div className="flex gap-4">
          <SkeletonSwitch />
          <SkeletonSwitch />
        </div>
      </div>
    </div>
  )
}

export function SkeletonWaveform(): React.JSX.Element {
  return (
    <div className="space-y-2">
      <Skeleton variant="rounded" width="100%" height={100} />
      <div className="flex justify-between">
        <Skeleton variant="text" width={50} height={12} />
        <Skeleton variant="text" width={50} height={12} />
      </div>
    </div>
  )
}
