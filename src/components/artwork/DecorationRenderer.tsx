import type { Decoration } from '@/types/effect'
import { LEDIndicator, VUMeter } from '@/components/controls'

interface DecorationRendererProps {
  decorations: Decoration[]
  levels?: { input: number; output: number }
}

export function DecorationRenderer({
  decorations,
  levels = { input: 0, output: 0 },
}: DecorationRendererProps): React.JSX.Element {
  return (
    <>
      {decorations.map((decoration, i) => (
        <DecorationItem key={i} decoration={decoration} levels={levels} />
      ))}
    </>
  )
}

interface DecorationItemProps {
  decoration: Decoration
  levels: { input: number; output: number }
}

function DecorationItem({ decoration, levels }: DecorationItemProps): React.JSX.Element | null {
  switch (decoration.type) {
    case 'led':
      return (
        <div
          className="absolute"
          style={{
            left: `${decoration.position.x.toString()}%`,
            top: `${decoration.position.y.toString()}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <LEDIndicator color={decoration.color} active={true} />
        </div>
      )

    case 'vuMeter':
      return (
        <div
          className="absolute"
          style={{
            left: `${decoration.position.x.toString()}%`,
            top: `${decoration.position.y.toString()}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <VUMeter
            level={levels.output}
            segments={decoration.segments}
            orientation={decoration.orientation}
          />
        </div>
      )

    case 'label': {
      const sizeClasses = {
        xs: 'text-[8px]',
        sm: 'text-[10px]',
        md: 'text-xs',
      }
      return (
        <div
          className={`absolute ${sizeClasses[decoration.size ?? 'sm']} font-medium text-[--color-text-muted] uppercase tracking-wider`}
          style={{
            left: `${decoration.position.x.toString()}%`,
            top: `${decoration.position.y.toString()}%`,
            transform: 'translate(-50%, -50%)',
          }}
        >
          {decoration.text}
        </div>
      )
    }

    default:
      return null
  }
}
