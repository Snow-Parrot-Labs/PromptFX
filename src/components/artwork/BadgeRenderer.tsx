import type { LogoBadge, BadgeTextEffect, BadgeGraphicElement } from '@/types/effect'

interface BadgeRendererProps {
  badges: LogoBadge[]
  accentColor: string
}

export function BadgeRenderer({ badges, accentColor }: BadgeRendererProps): React.JSX.Element {
  return (
    <>
      {badges.map((badge) => (
        <BadgeContainer key={badge.id} badge={badge} accentColor={accentColor} />
      ))}
    </>
  )
}

interface BadgeContainerProps {
  badge: LogoBadge
  accentColor: string
}

function BadgeContainer({ badge, accentColor }: BadgeContainerProps): React.JSX.Element {
  const containerStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${badge.position.x.toString()}%`,
    top: `${badge.position.y.toString()}%`,
    width: `${badge.size.width.toString()}%`,
    height: `${badge.size.height.toString()}%`,
    transform:
      badge.rotation !== undefined
        ? `translate(-50%, -50%) rotate(${badge.rotation.toString()}deg)`
        : 'translate(-50%, -50%)',
    pointerEvents: 'none',
    zIndex: 2,
  }

  return (
    <div style={containerStyle}>
      <BadgeFrame badge={badge} accentColor={accentColor} />
    </div>
  )
}

interface BadgeFrameProps {
  badge: LogoBadge
  accentColor: string
}

function BadgeFrame({ badge, accentColor }: BadgeFrameProps): React.JSX.Element {
  // Complex shapes use SVG
  if (badge.shape === 'shield' || badge.shape === 'hexagon') {
    return <ComplexShapeFrame badge={badge} accentColor={accentColor} />
  }

  // Simple shapes use CSS
  return <SimpleShapeFrame badge={badge} accentColor={accentColor} />
}

function SimpleShapeFrame({
  badge,
  accentColor: _accentColor,
}: BadgeFrameProps): React.JSX.Element {
  const frameStyle = getFrameStyle(badge)

  return (
    <div style={frameStyle}>
      <BadgeContent badge={badge} />
    </div>
  )
}

function ComplexShapeFrame({
  badge,
  accentColor: _accentColor,
}: BadgeFrameProps): React.JSX.Element {
  const frameStyle = getFrameStyle(badge)
  const svgViewBox = '0 0 100 100'

  let shapePath = ''
  if (badge.shape === 'shield') {
    // Shield path: top rectangle transitions to pointed bottom
    shapePath = 'M 10,10 L 90,10 L 90,60 Q 90,75 50,90 Q 10,75 10,60 Z'
  } else if (badge.shape === 'hexagon') {
    // Hexagon: 6-sided polygon
    shapePath = 'M 50,5 L 90,25 L 90,75 L 50,95 L 10,75 L 10,25 Z'
  }

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <svg
        width="100%"
        height="100%"
        viewBox={svgViewBox}
        preserveAspectRatio="none"
        style={{ position: 'absolute', inset: 0 }}
      >
        <path
          d={shapePath}
          fill={badge.backgroundColor}
          stroke={badge.borderColor}
          strokeWidth={badge.borderWidth ?? 2}
          style={{
            filter: frameStyle.filter,
          }}
        />
      </svg>
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        <BadgeContent badge={badge} />
      </div>
    </div>
  )
}

function getFrameStyle(badge: LogoBadge): React.CSSProperties & { filter?: string } {
  const baseStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  }

  // Shape border radius (for simple shapes only)
  switch (badge.shape) {
    case 'circle':
      baseStyle.borderRadius = '50%'
      break
    case 'ellipse':
      baseStyle.borderRadius = '50%'
      break
    case 'roundedRect':
      baseStyle.borderRadius = '8px'
      break
    case 'rectangle':
      baseStyle.borderRadius = '0'
      break
  }

  // Frame style effects
  switch (badge.frameStyle) {
    case 'beveled': {
      const lightColor = lightenColor(badge.backgroundColor, 0.15)
      const darkColor = darkenColor(badge.backgroundColor, 0.15)
      return {
        ...baseStyle,
        background: `linear-gradient(135deg, ${lightColor} 0%, ${badge.backgroundColor} 50%, ${darkColor} 100%)`,
        border: `${(badge.borderWidth ?? 2).toString()}px solid ${badge.borderColor}`,
        boxShadow: `
          inset 2px 2px 4px rgba(255,255,255,0.2),
          inset -2px -2px 4px rgba(0,0,0,0.3),
          ${badge.shadow === true ? '0 4px 8px rgba(0,0,0,0.4)' : ''}
        `,
      }
    }

    case 'engraved':
      return {
        ...baseStyle,
        backgroundColor: badge.backgroundColor,
        border: `${(badge.borderWidth ?? 1).toString()}px solid ${badge.borderColor}`,
        boxShadow: `
          inset 0 2px 4px rgba(0,0,0,0.5),
          inset 0 -2px 4px rgba(255,255,255,0.1),
          ${badge.shadow === true ? '0 2px 4px rgba(0,0,0,0.3)' : ''}
        `,
      }

    case 'raised':
      return {
        ...baseStyle,
        backgroundColor: badge.backgroundColor,
        border: `${(badge.borderWidth ?? 2).toString()}px solid ${badge.borderColor}`,
        boxShadow: `
          0 4px 8px rgba(0,0,0,0.3),
          inset 0 1px 0 rgba(255,255,255,0.2),
          inset 0 -1px 0 rgba(0,0,0,0.2)
        `,
      }

    case 'outlined':
      return {
        ...baseStyle,
        backgroundColor: badge.backgroundColor,
        border: `${(badge.borderWidth ?? 2).toString()}px solid ${badge.borderColor}`,
        boxShadow: badge.shadow === true ? '0 4px 8px rgba(0,0,0,0.3)' : 'none',
      }

    case 'flat':
    default:
      return {
        ...baseStyle,
        backgroundColor: badge.backgroundColor,
        border:
          badge.borderWidth !== undefined
            ? `${badge.borderWidth.toString()}px solid ${badge.borderColor}`
            : 'none',
        boxShadow: badge.shadow === true ? '0 2px 4px rgba(0,0,0,0.2)' : 'none',
      }
  }
}

interface BadgeContentProps {
  badge: LogoBadge
}

function BadgeContent({ badge }: BadgeContentProps): React.JSX.Element {
  const contentStyle: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0.25rem',
  }

  // Add glow effect if specified
  if (badge.glow !== undefined) {
    contentStyle.filter = `drop-shadow(0 0 ${Math.floor(badge.glow.intensity * 10).toString()}px ${badge.glow.color})`
  }

  return (
    <div style={contentStyle}>
      {badge.logo.type !== 'graphic' && badge.logo.text !== undefined && (
        <BadgeText
          text={badge.logo.text}
          effect={badge.logo.textEffect ?? 'plain'}
          fontFamily={badge.logo.fontFamily}
          fontSize={badge.logo.fontSize}
        />
      )}

      {badge.logo.graphicElements !== undefined && badge.logo.graphicElements.length > 0 && (
        <BadgeGraphics elements={badge.logo.graphicElements} />
      )}
    </div>
  )
}

interface BadgeTextProps {
  text: string
  effect: BadgeTextEffect
  fontFamily?: string
  fontSize?: number
}

function BadgeText({ text, effect, fontFamily, fontSize }: BadgeTextProps): React.JSX.Element {
  const textStyle = getTextEffectStyle(effect, fontFamily, fontSize)

  return <div style={textStyle}>{text}</div>
}

function getTextEffectStyle(
  effect: BadgeTextEffect,
  fontFamily?: string,
  fontSize?: number
): React.CSSProperties {
  const baseStyle: React.CSSProperties = {
    fontSize: `${(fontSize ?? 14).toString()}px`,
    whiteSpace: 'nowrap',
    textAlign: 'center',
    lineHeight: 1.2,
    userSelect: 'none',
  }

  switch (effect) {
    case 'metallic':
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'system-ui, sans-serif',
        fontWeight: 'bold',
        background:
          'linear-gradient(180deg, #fff 0%, #a0a0a0 30%, #fff 50%, #808080 70%, #a0a0a0 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 1px 2px rgba(0,0,0,0.4)',
      }

    case 'script':
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'cursive',
        fontStyle: 'italic',
        fontWeight: '600',
        background: 'linear-gradient(180deg, #fff 0%, #d4af37 50%, #aa8829 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        color: 'transparent',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)',
      }

    case 'block':
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'system-ui, sans-serif',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#e5e5e5',
        textShadow: '0 1px 2px rgba(0,0,0,0.6)',
      }

    case 'engraved':
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'system-ui, sans-serif',
        fontWeight: 'bold',
        color: 'transparent',
        background: 'linear-gradient(180deg, #1a1a24 0%, #3a3a4a 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        textShadow: '0 1px 1px rgba(255,255,255,0.1)',
      }

    case 'embossed':
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'system-ui, sans-serif',
        fontWeight: 'bold',
        color: '#e5e5e5',
        textShadow: '0 -1px 1px rgba(0,0,0,0.5), 0 1px 1px rgba(255,255,255,0.2)',
      }

    case 'stencil':
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'monospace',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.15em',
        color: '#2a2a2a',
        textShadow: '1px 1px 0 rgba(255,255,255,0.2), -1px -1px 0 rgba(0,0,0,0.5)',
      }

    case 'plain':
    default:
      return {
        ...baseStyle,
        fontFamily: fontFamily ?? 'system-ui, sans-serif',
        fontWeight: '600',
        color: '#e5e5e5',
      }
  }
}

interface BadgeGraphicsProps {
  elements: BadgeGraphicElement[]
}

function BadgeGraphics({ elements }: BadgeGraphicsProps): React.JSX.Element {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
      }}
    >
      {elements.map((element, index) => (
        <GraphicElement key={index} element={element} />
      ))}
    </svg>
  )
}

interface GraphicElementProps {
  element: BadgeGraphicElement
}

function GraphicElement({ element }: GraphicElementProps): React.JSX.Element | null {
  const opacity = element.opacity ?? 1

  switch (element.type) {
    case 'line':
      return (
        <line
          x1={element.position.x}
          y1={element.position.y}
          x2={element.position.x + element.size}
          y2={element.position.y}
          stroke={element.color}
          strokeWidth="2"
          opacity={opacity}
        />
      )

    case 'circle':
      return (
        <circle
          cx={element.position.x}
          cy={element.position.y}
          r={element.size / 2}
          fill={element.color}
          opacity={opacity}
        />
      )

    case 'arc': {
      // Draw a 180-degree arc
      const radius = element.size / 2
      const startX = element.position.x - radius
      const endX = element.position.x + radius
      const y = element.position.y
      return (
        <path
          d={`M ${startX.toString()},${y.toString()} A ${radius.toString()},${radius.toString()} 0 0,1 ${endX.toString()},${y.toString()}`}
          stroke={element.color}
          strokeWidth="2"
          fill="none"
          opacity={opacity}
        />
      )
    }

    case 'star': {
      // Simple 5-point star
      const cx = element.position.x
      const cy = element.position.y
      const outerRadius = element.size / 2
      const innerRadius = outerRadius * 0.4
      const points = []

      for (let i = 0; i < 10; i++) {
        const radius = i % 2 === 0 ? outerRadius : innerRadius
        const angle = (i * Math.PI) / 5 - Math.PI / 2
        const x = (cx + radius * Math.cos(angle)).toString()
        const y = (cy + radius * Math.sin(angle)).toString()
        points.push(`${x},${y}`)
      }

      return <polygon points={points.join(' ')} fill={element.color} opacity={opacity} />
    }

    case 'wave': {
      // Sine wave
      const startX = element.position.x
      const startY = element.position.y
      const width = element.size
      const amplitude = 5
      const frequency = 2

      const pathData = []
      pathData.push(`M ${startX.toString()} ${startY.toString()}`)

      for (let x = 0; x <= width; x += 2) {
        const y = startY + amplitude * Math.sin((x / width) * frequency * Math.PI * 2)
        const xPos = (startX + x).toString()
        const yPos = y.toString()
        pathData.push(`L ${xPos} ${yPos}`)
      }

      return (
        <path
          d={pathData.join(' ')}
          stroke={element.color}
          strokeWidth="2"
          fill="none"
          opacity={opacity}
        />
      )
    }

    default:
      return null
  }
}

// Color manipulation utilities
function lightenColor(color: string, amount: number): string {
  // Simple lightening - blend with white
  const rgb = hexToRgb(color)
  if (rgb === null) return color

  const r = Math.min(255, Math.floor(rgb.r + (255 - rgb.r) * amount))
  const g = Math.min(255, Math.floor(rgb.g + (255 - rgb.g) * amount))
  const b = Math.min(255, Math.floor(rgb.b + (255 - rgb.b) * amount))

  return rgbToHex(r, g, b)
}

function darkenColor(color: string, amount: number): string {
  // Simple darkening - blend with black
  const rgb = hexToRgb(color)
  if (rgb === null) return color

  const r = Math.max(0, Math.floor(rgb.r * (1 - amount)))
  const g = Math.max(0, Math.floor(rgb.g * (1 - amount)))
  const b = Math.max(0, Math.floor(rgb.b * (1 - amount)))

  return rgbToHex(r, g, b)
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result !== null
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

function rgbToHex(r: number, g: number, b: number): string {
  const rHex = r.toString(16).padStart(2, '0')
  const gHex = g.toString(16).padStart(2, '0')
  const bHex = b.toString(16).padStart(2, '0')
  return `#${rHex}${gHex}${bHex}`
}
