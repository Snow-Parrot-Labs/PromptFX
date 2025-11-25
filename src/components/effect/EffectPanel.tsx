import type {
  EffectDefinition,
  UIControl,
  KnobConfig,
  SliderConfig,
  SwitchConfig,
  SelectConfig,
} from '@/types/effect'
import { EffectHeader } from './EffectHeader'
import { ControlRenderer } from './ControlRenderer'

interface EffectPanelProps {
  definition: EffectDefinition
  parameterValues: Record<string, number | string | boolean>
  onParameterChange: (
    controlId: string,
    nodeId: string,
    param: string,
    value: number | string | boolean
  ) => void
  onRegenerate?: () => void
  isRegenerating?: boolean
}

export function EffectPanel({
  definition,
  parameterValues,
  onParameterChange,
  onRegenerate,
  isRegenerating = false,
}: EffectPanelProps): React.JSX.Element {
  const { ui } = definition

  const layoutClass =
    ui.layout === 'grid'
      ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
      : ui.layout === 'vertical'
        ? 'flex flex-col gap-4'
        : 'flex flex-wrap gap-6 items-end'

  return (
    <div className="p-6 bg-gray-900 rounded-xl">
      {onRegenerate !== undefined && (
        <EffectHeader
          name={definition.name}
          description={definition.description}
          onRegenerate={onRegenerate}
          isRegenerating={isRegenerating}
        />
      )}
      {onRegenerate === undefined && (
        <EffectHeader name={definition.name} description={definition.description} />
      )}

      <div className={layoutClass}>
        {ui.controls.map((control) => {
          const key = `${control.binding.nodeId}.${control.binding.param}`
          const value = parameterValues[key] ?? getDefaultValue(control)

          return (
            <div key={control.id} className="flex-shrink-0">
              <ControlRenderer
                control={control}
                value={value}
                onChange={(newValue) => {
                  onParameterChange(
                    control.id,
                    control.binding.nodeId,
                    control.binding.param,
                    newValue
                  )
                }}
              />
            </div>
          )
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-800 text-xs text-gray-500 flex justify-between">
        <span>Generated from: &quot;{definition.prompt}&quot;</span>
        <span>
          v{definition.version} | {definition.metadata.aiModel}
        </span>
      </div>
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
