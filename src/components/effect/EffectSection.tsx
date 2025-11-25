import { useEffectStore } from '@/stores'

export function EffectSection(): React.JSX.Element {
  const { definition, isGenerating } = useEffectStore()

  if (isGenerating) {
    return (
      <section className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[--color-accent-primary] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[--color-text-secondary]">Generating your effect...</p>
        </div>
      </section>
    )
  }

  if (!definition) {
    return (
      <section className="flex-1 p-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 rounded-full bg-[--color-bg-tertiary] flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-[--color-text-muted]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-[--color-text-primary] mb-2">
            No Effect Generated
          </h3>
          <p className="text-[--color-text-muted] text-sm">
            Describe the audio effect you want above and click Generate to create an interactive
            effect panel.
          </p>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 p-6">
      <div className="bg-[--color-bg-panel] rounded-xl border border-[--color-border] p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-[--color-text-primary]">{definition.name}</h3>
            <p className="text-sm text-[--color-text-muted]">{definition.description}</p>
          </div>
          <button className="px-3 py-1.5 text-sm rounded bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors">
            Regenerate
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {/* Controls will be rendered here by ControlRenderer */}
          <p className="col-span-full text-center text-[--color-text-muted] text-sm">
            Effect controls will appear here
          </p>
        </div>
      </div>
    </section>
  )
}
