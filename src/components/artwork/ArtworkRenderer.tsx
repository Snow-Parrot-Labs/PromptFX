import type { Artwork, ArtworkElement, GradientElement } from '@/types/effect'

interface ArtworkRendererProps {
  artwork: Artwork
  rackUnits?: number
  accentColor?: string
}

export function ArtworkRenderer({
  artwork,
  rackUnits = 2,
  accentColor = '#d4af37',
}: ArtworkRendererProps): React.JSX.Element {
  return (
    <>
      {/* AI-generated texture (cover background - lowest layer) */}
      {artwork.backgroundImage !== undefined && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            zIndex: 0,
            backgroundImage: `url(${artwork.backgroundImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
      )}

      {/* Background gradient - only render if NO background image */}
      {artwork.background !== undefined && artwork.backgroundImage === undefined && (
        <GradientBackground gradient={artwork.background} />
      )}

      {/* Procedural panel elements (screws, seams, vents) */}
      <ProceduralPanelElements rackUnits={rackUnits} accentColor={accentColor} />

      {/* Decorative elements (z-index 1 - above background) */}
      {artwork.elements?.map((element, i) => (
        <ElementRenderer key={i} element={element} />
      ))}

      {/* Brand label (z-index 2 - above decorative elements) */}
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

interface ProceduralPanelElementsProps {
  rackUnits: number
  accentColor: string
}

function ProceduralPanelElements({
  rackUnits,
  accentColor,
}: ProceduralPanelElementsProps): React.JSX.Element {
  const panelHeight = rackUnits * 88

  return (
    <>
      {/* Corner screws */}
      <Screw x={12} y={12} />
      <Screw x={12} y={panelHeight - 12} />
      <Screw x="calc(100% - 12px)" y={12} />
      <Screw x="calc(100% - 12px)" y={panelHeight - 12} />

      {/* Edge rails (subtle horizontal lines at top and bottom) */}
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          top: 0,
          height: '2px',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1,
        }}
      />
      <div
        className="absolute left-0 right-0 pointer-events-none"
        style={{
          bottom: 0,
          height: '2px',
          background:
            'linear-gradient(90deg, rgba(0,0,0,0.3) 0%, rgba(255,255,255,0.05) 50%, rgba(0,0,0,0.3) 100%)',
          zIndex: 1,
        }}
      />

      {/* Rack unit divider line (if 2U) */}
      {rackUnits === 2 && (
        <div
          className="absolute left-8 right-8 pointer-events-none"
          style={{
            top: '50%',
            height: '1px',
            background: 'rgba(0,0,0,0.2)',
            boxShadow: '0 1px 0 rgba(255,255,255,0.05)',
            zIndex: 1,
          }}
        />
      )}

      {/* Vent grille (subtle, at far right) */}
      <VentGrille x="calc(100% - 40px)" y="50%" accentColor={accentColor} />

      {/* Panel bevel effect (inner shadow) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.3)',
          zIndex: 1,
        }}
      />
    </>
  )
}

interface ScrewProps {
  x: number | string
  y: number | string
}

function Screw({ x, y }: ScrewProps): React.JSX.Element {
  const left = typeof x === 'number' ? `${x.toString()}px` : x
  const top = typeof y === 'number' ? `${y.toString()}px` : y

  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left,
        top,
        width: '10px',
        height: '10px',
        transform: 'translate(-50%, -50%)',
        zIndex: 2,
      }}
    >
      {/* Screw body */}
      <div
        style={{
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #4a4a4a 0%, #2a2a2a 50%, #1a1a1a 100%)',
          boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.2), 0 1px 2px rgba(0,0,0,0.5)',
        }}
      />
      {/* Screw slot */}
      <div
        style={{
          position: 'absolute',
          top: '50%',
          left: '25%',
          right: '25%',
          height: '1.5px',
          background: '#1a1a1a',
          transform: 'translateY(-50%)',
        }}
      />
    </div>
  )
}

interface VentGrilleProps {
  x: string
  y: string
  accentColor: string
}

function VentGrille({ x, y }: VentGrilleProps): React.JSX.Element {
  const slotCount = 5
  const slots = []

  for (let i = 0; i < slotCount; i++) {
    slots.push(
      <div
        key={i}
        style={{
          width: '3px',
          height: '24px',
          background: 'rgba(0,0,0,0.6)',
          borderRadius: '1px',
          boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.5)',
        }}
      />
    )
  }

  return (
    <div
      className="absolute pointer-events-none flex gap-1"
      style={{
        left: x,
        top: y,
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}
    >
      {slots}
    </div>
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
      className="absolute inset-0 pointer-events-none"
      style={{
        background: getGradientStyle(),
      }}
    />
  )
}

function ElementRenderer({ element }: { element: ArtworkElement }): React.JSX.Element | null {
  const baseStyle = { zIndex: 1 }

  switch (element.type) {
    case 'stripe':
      return (
        <div
          className="absolute pointer-events-none"
          style={{
            ...baseStyle,
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
            ...baseStyle,
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
      const dx = element.to.x - element.from.x
      const dy = element.to.y - element.from.y
      const length = Math.sqrt(dx * dx + dy * dy)
      const angle = Math.atan2(dy, dx) * (180 / Math.PI)

      return (
        <div
          className="absolute origin-left pointer-events-none"
          style={{
            ...baseStyle,
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
          className="absolute rounded-full pointer-events-none"
          style={{
            ...baseStyle,
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
          className="absolute pointer-events-none"
          style={{
            ...baseStyle,
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
    <div
      className="absolute uppercase tracking-widest pointer-events-none"
      style={{ ...getTextStyle(), zIndex: 2 }}
    >
      {text}
    </div>
  )
}
