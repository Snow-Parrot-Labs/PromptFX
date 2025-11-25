import type { Artwork, ArtworkElement, GradientElement } from '@/types/effect'

interface ArtworkRendererProps {
  artwork: Artwork
}

export function ArtworkRenderer({ artwork }: ArtworkRendererProps): React.JSX.Element {
  return (
    <>
      {/* Background gradient */}
      {artwork.background !== undefined && <GradientBackground gradient={artwork.background} />}

      {/* Decorative elements */}
      {artwork.elements?.map((element, i) => (
        <ElementRenderer key={i} element={element} />
      ))}

      {/* Brand label */}
      {artwork.brandLabel !== undefined && (
        <BrandLabel
          text={artwork.brandLabel.text}
          position={artwork.brandLabel.position}
          style={artwork.brandLabel.style}
        />
      )}
    </>
  )
}

function GradientBackground({ gradient }: { gradient: GradientElement }): React.JSX.Element {
  const getGradientStyle = (): string => {
    const colors = gradient.colors.join(', ')
    switch (gradient.direction) {
      case 'horizontal':
        return `linear-gradient(90deg, ${colors})`
      case 'vertical':
        return `linear-gradient(180deg, ${colors})`
      case 'diagonal':
        return `linear-gradient(135deg, ${colors})`
      case 'radial':
        return `radial-gradient(ellipse at center, ${colors})`
      default:
        return `linear-gradient(180deg, ${colors})`
    }
  }

  return (
    <div
      className="absolute inset-0"
      style={{
        background: getGradientStyle(),
      }}
    />
  )
}

function ElementRenderer({ element }: { element: ArtworkElement }): React.JSX.Element | null {
  switch (element.type) {
    case 'stripe':
      return (
        <div
          className="absolute"
          style={{
            left: `${element.position.x.toString()}%`,
            top: `${element.position.y.toString()}%`,
            width: `${element.position.width.toString()}%`,
            height: `${element.position.height.toString()}%`,
            background: element.color,
          }}
        />
      )

    case 'glow':
      return (
        <div
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${element.position.x.toString()}%`,
            top: `${element.position.y.toString()}%`,
            width: `${(element.radius * 2).toString()}%`,
            height: `${(element.radius * 2).toString()}%`,
            transform: 'translate(-50%, -50%)',
            background: `radial-gradient(circle, ${element.color} 0%, transparent 70%)`,
            opacity: element.opacity,
          }}
        />
      )

    case 'line': {
      // Calculate line angle and length
      const dx = element.to.x - element.from.x
      const dy = element.to.y - element.from.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      return (
        <div
          className="absolute origin-left"
          style={{
            left: `${element.from.x.toString()}%`,
            top: `${element.from.y.toString()}%`,
            width: `${length.toString()}%`,
            height: `${element.thickness.toString()}px`,
            background: element.color,
            transform: `rotate(${angle.toString()}deg)`,
          }}
        />
      )
    }

    case 'circle':
      return (
        <div
          className="absolute rounded-full"
          style={{
            left: `${element.position.x.toString()}%`,
            top: `${element.position.y.toString()}%`,
            width: `${(element.radius * 2).toString()}%`,
            height: `${(element.radius * 2).toString()}%`,
            transform: 'translate(-50%, -50%)',
            background: element.filled !== false ? element.color : 'transparent',
            border: element.filled === false ? `2px solid ${element.color}` : 'none',
          }}
        />
      )

    case 'rect':
      return (
        <div
          className="absolute"
          style={{
            left: `${element.position.x.toString()}%`,
            top: `${element.position.y.toString()}%`,
            width: `${element.position.width.toString()}%`,
            height: `${element.position.height.toString()}%`,
            background: element.color,
            borderRadius:
              element.borderRadius !== undefined ? `${element.borderRadius.toString()}px` : '0',
          }}
        />
      )

    default:
      return null
  }
}

interface BrandLabelProps {
  text: string
  position: { x: number; y: number }
  style: 'engraved' | 'embossed' | 'chrome' | 'neon'
}

function BrandLabel({ text, position, style }: BrandLabelProps): React.JSX.Element {
  const getTextStyle = (): React.CSSProperties => {
    const base: React.CSSProperties = {
      left: `${position.x.toString()}%`,
      top: `${position.y.toString()}%`,
      transform: 'translateX(-50%)',
      fontWeight: 'bold',
      letterSpacing: '0.15em',
      fontSize: '14px',
    }

    switch (style) {
      case 'engraved':
        return {
          ...base,
          color: 'transparent',
          background: 'linear-gradient(180deg, #1a1a24 0%, #3a3a4a 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          textShadow: '0 1px 1px rgba(255,255,255,0.1)',
        }
      case 'embossed':
        return {
          ...base,
          color: '#e5e5e5',
          textShadow: '0 -1px 1px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.2)',
        }
      case 'chrome':
        return {
          ...base,
          color: 'transparent',
          background: 'linear-gradient(180deg, #fff 0%, #a0a0a0 40%, #fff 50%, #808080 100%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          textShadow: '0 2px 4px rgba(0,0,0,0.3)',
        }
      case 'neon':
        return {
          ...base,
          color: '#22c55e',
          textShadow: '0 0 10px #22c55e, 0 0 20px #22c55e, 0 0 30px #22c55e',
        }
      default:
        return base
    }
  }

  return (
    <div className="absolute uppercase tracking-widest" style={getTextStyle()}>
      {text}
    </div>
  )
}
