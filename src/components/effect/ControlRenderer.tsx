import type {
  UIControl,
  KnobConfig,
  SliderConfig,
  SwitchConfig,
  SelectConfig,
} from '@/types/effect'
import { Knob, Slider, Switch, Select } from '@/components/ui'

interface ControlRendererProps {
  control: UIControl
  value: number | string | boolean
  onChange: (value: number | string | boolean) => void
}

export function ControlRenderer({
  control,
  value,
  onChange,
}: ControlRendererProps): React.JSX.Element {
  switch (control.type) {
    case 'knob': {
      const config = control.config as KnobConfig
      return (
        <Knob
          value={value as number}
          min={config.min}
          max={config.max}
          step={config.step ?? 1}
          unit={config.unit ?? ''}
          curve={config.curve ?? 'linear'}
          label={control.label}
          onChange={onChange}
        />
      )
    }

    case 'slider': {
      const config = control.config as SliderConfig
      return (
        <Slider
          value={value as number}
          min={config.min}
          max={config.max}
          step={config.step ?? 1}
          unit={config.unit ?? ''}
          label={control.label}
          orientation={config.orientation ?? 'horizontal'}
          onChange={onChange}
        />
      )
    }

    case 'switch': {
      const config = control.config as SwitchConfig
      return (
        <Switch
          value={value as boolean}
          label={control.label}
          onLabel={config.onLabel ?? 'On'}
          offLabel={config.offLabel ?? 'Off'}
          onChange={onChange}
        />
      )
    }

    case 'select': {
      const config = control.config as SelectConfig
      return (
        <Select
          value={value as string}
          options={config.options}
          label={control.label}
          onChange={onChange}
        />
      )
    }

    case 'button':
      return (
        <button
          type="button"
          onClick={() => {
            onChange(true)
          }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          {control.label}
        </button>
      )

    default:
      return <div className="text-red-500 text-xs">Unknown control type</div>
  }
}
