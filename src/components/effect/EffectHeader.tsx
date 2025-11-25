interface EffectHeaderProps {
  name: string
  description: string
  onRegenerate?: () => void
  isRegenerating?: boolean
}

export function EffectHeader({
  name,
  description,
  onRegenerate,
  isRegenerating = false,
}: EffectHeaderProps): React.JSX.Element {
  return (
    <div className="flex items-start justify-between gap-4 mb-4">
      <div>
        <h2 className="text-xl font-bold text-white">{name}</h2>
        <p className="text-sm text-gray-400 mt-1">{description}</p>
      </div>
      {onRegenerate !== undefined && (
        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="px-3 py-1.5 text-sm bg-gray-800 hover:bg-gray-700 disabled:bg-gray-900 text-gray-300 rounded-lg transition-colors flex items-center gap-1.5"
        >
          <svg
            className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          {isRegenerating ? 'Regenerating...' : 'Regenerate'}
        </button>
      )}
    </div>
  )
}
