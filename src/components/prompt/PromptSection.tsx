import { useEffectStore } from '@/stores'

export function PromptSection(): React.JSX.Element {
  const { isGenerating } = useEffectStore()

  return (
    <section className="p-6 border-b border-[--color-border]">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-lg font-medium text-[--color-text-primary] mb-4">
          Describe Your Effect
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            placeholder="e.g., A warm tape delay with flutter and saturation..."
            className="flex-1 px-4 py-3 rounded-lg bg-[--color-bg-tertiary] border border-[--color-border] text-[--color-text-primary] placeholder:text-[--color-text-muted] focus:border-[--color-border-focus] focus:outline-none transition-colors"
            disabled={isGenerating}
          />
          <button
            className="px-6 py-3 rounded-lg bg-[--color-accent-primary] text-white font-medium hover:bg-[--color-accent-secondary] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate'}
          </button>
        </div>
        <div className="mt-3 flex gap-2 flex-wrap">
          <span className="text-xs text-[--color-text-muted]">Try:</span>
          {['Warm tape delay', 'Lo-fi radio', 'Aggressive distortion', 'Dreamy reverb'].map(
            (suggestion) => (
              <button
                key={suggestion}
                className="px-2 py-1 text-xs rounded bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary] hover:bg-[--color-bg-panel] transition-colors"
              >
                {suggestion}
              </button>
            )
          )}
        </div>
      </div>
    </section>
  )
}
