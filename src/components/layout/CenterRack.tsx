import { useEffectStore } from '@/stores/effectStore'
import { useAudioStore } from '@/stores'
import { useEffectControls } from '@/hooks/useEffectControls'
import { EffectPanel } from '@/components/effect/EffectPanel'
import { PresetControls } from '@/components/effect/PresetControls'
import { SkeletonEffectPanel } from '@/components/ui/Skeleton'
import { RackRails, BlankPanel, EffectRackUnit, SpectrumAnalyzer } from '@/components/rack'

export function CenterRack(): React.JSX.Element {
  const { definition, isGenerating, parameterValues } = useEffectStore()
  const { bypassEffect, toggleBypass } = useAudioStore()
  const { handleParameterChange } = useEffectControls()

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[--color-bg-primary]">
      {/* Rack Header with Presets */}
      <div className="px-4 py-2 border-b border-[--color-border] bg-[--color-bg-secondary] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-[--color-text-muted] uppercase tracking-wider">
            Effect Rack
          </span>
          {definition !== null && (
            <>
              <span className="text-[--color-text-muted]">|</span>
              <span className="text-xs text-[--color-accent-primary] font-medium">
                {definition.name}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center gap-3">
          {/* Bypass Toggle - vintage lit button with red bulb glow */}
          <button
            type="button"
            onClick={() => {
              toggleBypass()
            }}
            className="relative px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-all btn-mechanical text-[--color-text-muted] overflow-hidden"
            style={{
              boxShadow: bypassEffect
                ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 12px rgba(181, 74, 74, 0.4), 0 0 20px rgba(181, 74, 74, 0.2)'
                : undefined,
            }}
          >
            {/* Red bulb backlight glow when bypassed */}
            {bypassEffect && (
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(ellipse at center bottom, rgba(181, 74, 74, 0.4) 0%, rgba(181, 74, 74, 0.15) 40%, transparent 70%)',
                }}
              />
            )}
            <span className={`relative z-10 ${bypassEffect ? 'text-[#e8a0a0]' : ''}`}>BYPASS</span>
          </button>
          <PresetControls />
        </div>
      </div>

      {/* Rack Space */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Rail */}
        <RackRails units={12} />

        {/* Center Content - Rack Bay */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto no-scrollbar"
          style={{
            background: `
              radial-gradient(ellipse at center, rgba(30,30,40,0.8) 0%, transparent 70%),
              linear-gradient(180deg, #0a0a0f 0%, #12121a 50%, #0a0a0f 100%)
            `,
          }}
        >
          {/* Spectrum Analyzer - always at top */}
          <div className="w-full max-w-4xl mb-4">
            <SpectrumAnalyzer />
          </div>

          {isGenerating ? (
            <div className="w-full max-w-4xl">
              <EffectRackUnit>
                <SkeletonEffectPanel />
              </EffectRackUnit>
            </div>
          ) : definition !== null ? (
            <div className="w-full max-w-4xl">
              <EffectRackUnit rackUnits={definition.ui.panelDesign?.rackUnits ?? 2}>
                <EffectPanel
                  definition={definition}
                  parameterValues={parameterValues}
                  onParameterChange={handleParameterChange}
                />
              </EffectRackUnit>
            </div>
          ) : (
            <EmptyRackState />
          )}
        </div>

        {/* Right Rail */}
        <RackRails units={12} />
      </div>
    </div>
  )
}

function EmptyRackState(): React.JSX.Element {
  return (
    <div className="w-full max-w-4xl space-y-3">
      {/* Top blank panels */}
      <BlankPanel units={1} variant="vent" />
      <BlankPanel units={1} variant="mesh" />

      {/* Empty slot indicator */}
      <div
        className="h-44 border-2 border-dashed border-[--color-border] rounded-lg flex items-center justify-center"
        style={{
          background: 'linear-gradient(180deg, rgba(20,20,30,0.5) 0%, rgba(10,10,15,0.5) 100%)',
        }}
      >
        <div className="text-center">
          <div
            className="w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center"
            style={{
              background: 'linear-gradient(145deg, #1a1a24 0%, #0f0f15 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            <svg
              className="w-7 h-7 text-[--color-text-muted]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
          </div>
          <p className="text-sm text-[--color-text-secondary] font-medium">Empty Rack Slot</p>
          <p className="text-xs text-[--color-text-muted] mt-1.5 max-w-[200px]">
            Describe an effect in the left panel and click Generate
          </p>
        </div>
      </div>

      {/* Bottom blank panels */}
      <BlankPanel units={1} variant="vent" />
      <BlankPanel units={1} variant="solid" />
    </div>
  )
}
