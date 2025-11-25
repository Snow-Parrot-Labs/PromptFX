import type {
  EffectDefinition,
  UIControl,
  KnobConfig,
  SliderConfig,
  SwitchConfig,
  SelectConfig,
} from '@/types/effect'
import { ArtworkRenderer, DecorationRenderer } from '@/components/artwork'
import { StyledKnob, Fader, StyledSwitch } from '@/components/controls'
import { useAudioStore } from '@/stores'

interface CreativePanelProps {
  definition: EffectDefinition
  parameterValues: Record<string, number | string | boolean>
  onParameterChange: (
    controlId: string,
    nodeId: string,
    param: string,
    value: number | string | boolean
  ) => void
}

export function CreativePanel({
  definition,
  parameterValues,
  onParameterChange,
}: CreativePanelProps): React.JSX.Element {
  const { ui } = definition
  const panelDesign = ui.panelDesign
  const artwork = ui.artwork
  const decorations = ui.decorations
  const levels = useAudioStore((s) => s.levels)

  // Calculate panel height based on rack units
  const rackUnits = panelDesign?.rackUnits ?? 2
  const panelHeight = rackUnits * 88 // 88px per rack unit

  // Panel colors
  const primaryColor = panelDesign?.primaryColor ?? '#1a1a2e'
  const textColor = panelDesign?.textColor ?? '#e5e5e5'

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{
        height: `${panelHeight.toString()}px`,
        background: primaryColor,
        color: textColor,
      }}
    >
      {/* Artwork layer (background, decorative elements, brand label) */}
      {artwork !== undefined && <ArtworkRenderer artwork={artwork} />}

      {/* Decorations layer (LEDs, VU meters, section labels) */}
      {decorations !== undefined && (
        <DecorationRenderer
          decorations={decorations}
          levels={{
            input: Math.max(levels.inputLeft, levels.inputRight),
            output: Math.max(levels.outputLeft, levels.outputRight),
          }}
        />
      )}

      {/* Controls layer (absolutely positioned) */}
      {ui.controls.map((control) => {
        const key = `${control.binding.nodeId}.${control.binding.param}`
        const value = parameterValues[key] ?? getDefaultValue(control)

        return (
          <AbsoluteControl
            key={control.id}
            control={control}
            value={value}
            onChange={(newValue) => {
              onParameterChange(control.id, control.binding.nodeId, control.binding.param, newValue)
            }}
          />
        )
      })}

      {/* Bottom info strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-6 flex items-center justify-between px-4"
        style={{
          background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.4) 100%)',
        }}
      >
        <span className="text-[9px] text-[--color-text-muted] truncate max-w-[40%]">
          {definition.prompt}
        </span>
        <span className="text-[8px] text-[--color-text-muted]">v{definition.version}</span>
      </div>
    </div>
  )
}

interface AbsoluteControlProps {
  control: UIControl
  value: number | string | boolean
  onChange: (value: number | string | boolean) => void
}

function AbsoluteControl({ control, value, onChange }: AbsoluteControlProps): React.JSX.Element {
  const position = control.position ?? { x: 50, y: 50 }
  const style = control.style

  return (
    <div
      className="absolute"
      style={{
        left: `${position.x.toString()}%`,
        top: `${position.y.toString()}%`,
        transform: 'translate(-50%, -50%)',
      }}
    >
      {control.type === 'knob' && (
        <StyledKnob
          value={value as number}
          min={(control.config as KnobConfig).min}
          max={(control.config as KnobConfig).max}
          label={control.label}
          unit={(control.config as KnobConfig).unit}
          onChange={(v) => {
            onChange(v)
          }}
          color={style?.color ?? 'amber'}
          size={style?.size ?? 'md'}
          indicator={style?.indicator ?? 'line'}
        />
      )}

      {control.type === 'slider' && (
        <Fader
          value={value as number}
          min={(control.config as SliderConfig).min}
          max={(control.config as SliderConfig).max}
          label={control.label}
          unit={(control.config as SliderConfig).unit}
          onChange={(v) => {
            onChange(v)
          }}
          color={style?.color ?? 'white'}
          height={(control.config as SliderConfig).orientation === 'vertical' ? 100 : 60}
        />
      )}

      {control.type === 'switch' && (
        <StyledSwitch
          value={value as boolean}
          label={control.label}
          onLabel={(control.config as SwitchConfig).onLabel}
          offLabel={(control.config as SwitchConfig).offLabel}
          onChange={(v) => {
            onChange(v)
          }}
          color={style?.color ?? 'green'}
        />
      )}

      {control.type === 'select' && (
        <SelectControl
          label={control.label}
          value={value as string}
          options={(control.config as SelectConfig).options}
          onChange={(v) => {
            onChange(v)
          }}
        />
      )}
    </div>
  )
}

interface SelectControlProps {
  label: string
  value: string
  options: { value: string; label: string }[]
  onChange: (value: string) => void
}

function SelectControl({ label, value, options, onChange }: SelectControlProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-[9px] font-medium text-[--color-text-muted] uppercase tracking-wider">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        className="px-2 py-1 text-xs bg-[--color-bg-tertiary] border border-[--color-border] rounded text-white"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function getDefaultValue(control: UIControl): number | string | boolean {
  const { type, config } = control

  switch (type) {
    case 'knob':
      return (config as KnobConfig).default
    case 'slider':
      return (config as SliderConfig).default
    case 'switch':
      return (config as SwitchConfig).default
    case 'select':
      return (config as SelectConfig).default
    case 'button':
      return false
    default:
      return 0
  }
}
