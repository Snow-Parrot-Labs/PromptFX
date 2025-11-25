interface SwitchProps {
  value: boolean
  label: string
  onLabel?: string
  offLabel?: string
  onChange: (value: boolean) => void
}

export function Switch({
  value,
  label,
  onLabel = 'On',
  offLabel = 'Off',
  onChange,
}: SwitchProps): React.JSX.Element {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-gray-400">{label}</span>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        aria-label={label}
        onClick={() => {
          onChange(!value)
        }}
        className={`relative w-12 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
          value ? 'bg-blue-600' : 'bg-gray-700'
        }`}
      >
        <span
          className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform ${
            value ? 'translate-x-6' : 'translate-x-0'
          }`}
        />
      </button>
      <span className="text-xs font-mono text-gray-300">{value ? onLabel : offLabel}</span>
    </div>
  )
}
