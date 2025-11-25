import { useEffectStore } from '@/stores'
import { useEffectControls } from '@/hooks/useEffectControls'
import { EffectPanel } from './EffectPanel'
import { PresetControls } from './PresetControls'
import { SkeletonEffectPanel } from '@/components/ui'

export function EffectSection(): React.JSX.Element {
  const { definition, parameterValues, isGenerating } = useEffectStore()
  const { handleParameterChange, handleRegenerate } = useEffectControls()

  if (isGenerating) {
    return (
      <section className="flex-1 p-6">
        <div className="mb-4">
          <PresetControls />
        </div>
        <SkeletonEffectPanel />
        <p className="text-center text-[--color-text-secondary] mt-4">Generating your effect...</p>
      </section>
    )
  }

  if (definition === null) {
    return (
      <section className="flex-1 p-6">
        {/* Preset controls even when no effect */}
        <div className="mb-4">
          <PresetControls />
        </div>
        <div className="flex-1 flex items-center justify-center">
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
              effect panel, or load a saved preset.
            </p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="flex-1 p-6">
      {/* Preset controls */}
      <div className="mb-4">
        <PresetControls />
      </div>
      <EffectPanel
        definition={definition}
        parameterValues={parameterValues}
        onParameterChange={handleParameterChange}
        onRegenerate={handleRegenerate}
        isRegenerating={isGenerating}
      />
    </section>
  )
}
