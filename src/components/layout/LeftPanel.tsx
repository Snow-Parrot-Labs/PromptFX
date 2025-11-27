import { useState, useCallback } from 'react'
import { useEffectStore } from '@/stores/effectStore'
import { api } from '@/services/api'
import { toast } from '@/components/ui'

interface ComplexityOption {
  value: 'simple' | 'complex'
  label: string
  desc: string
}

const COMPLEXITY_OPTIONS: ComplexityOption[] = [
  { value: 'simple', label: 'Simple', desc: '1U, 2-3 controls' },
  { value: 'complex', label: 'Complex', desc: '2U, 5-7 controls' },
]

export function LeftPanel(): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [complexity, setComplexity] = useState<'simple' | 'complex'>('complex')
  const [chaosMode, setChaosMode] = useState(false)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const { isGenerating, generationError, generateEffect } = useEffectStore()

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (prompt.trim().length < 3 || isGenerating) return
    void generateEffect(prompt, { complexity, chaosMode })
  }

  const handleRandomEffect = useCallback(async (): Promise<void> => {
    setIsLoadingRandom(true)
    try {
      const response = await api.getRandomPrompt(chaosMode)
      if (response.success && response.data) {
        setPrompt(response.data.prompt)
        toast.success('Random effect idea generated!')
      } else {
        toast.error(response.error?.message ?? 'Failed to generate random prompt')
      }
    } catch {
      toast.error('Failed to generate random prompt')
    } finally {
      setIsLoadingRandom(false)
    }
  }, [chaosMode])

  const isDisabled = isGenerating || isLoadingRandom

  return (
    <aside className="w-[280px] flex-shrink-0 bg-[--color-bg-secondary] border-r border-[--color-border] flex flex-col">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text-primary] uppercase tracking-wider">
          Effect Generator
        </h2>
      </div>

      {/* Prompt Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 flex flex-col p-4 gap-4 overflow-y-auto no-scrollbar"
      >
        {/* Prompt Textarea */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label
              htmlFor="effect-prompt"
              className="text-xs font-medium text-[--color-text-secondary]"
            >
              Describe Effect
            </label>
            <button
              type="button"
              onClick={() => {
                void handleRandomEffect()
              }}
              disabled={isDisabled}
              className="flex items-center gap-1 px-2 py-1 text-[10px] btn-mechanical disabled:opacity-50 disabled:cursor-not-allowed text-[--color-text-secondary] rounded transition-all"
            >
              {isLoadingRandom ? (
                <span className="flex items-center gap-1">
                  <svg className="animate-spin h-2.5 w-2.5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  ...
                </span>
              ) : (
                'Random'
              )}
            </button>
          </div>
          <textarea
            id="effect-prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
            }}
            placeholder="Warm vintage delay with tape saturation..."
            className="w-full h-20 px-3 py-2 text-sm bg-[--color-bg-tertiary] border border-[--color-border] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-[--color-accent-primary] resize-none"
            maxLength={500}
            disabled={isDisabled}
          />
          <div className="flex justify-end text-[10px] text-[--color-text-muted] mt-1">
            {prompt.length}/500
          </div>
        </div>

        {/* Complexity Selector */}
        <div>
          <label className="text-xs font-medium text-[--color-text-secondary] mb-2 block">
            Complexity
          </label>
          <div className="grid grid-cols-2 gap-1">
            {COMPLEXITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setComplexity(option.value)
                }}
                className={`px-2 py-1.5 rounded text-xs font-medium transition-all ${
                  complexity === option.value
                    ? 'btn-mechanical-lit text-[--color-accent-primary]'
                    : 'btn-mechanical text-[--color-text-muted]'
                }`}
                disabled={isDisabled}
              >
                <div>{option.label}</div>
                <div className="text-[10px] opacity-70">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chaos Mode Toggle */}
        <div className="flex items-center justify-between py-2 px-3 border-t border-[--color-border]">
          <div>
            <label className="text-xs font-medium text-[--color-text-secondary]">Chaos Mode</label>
            <p className="text-[10px] text-[--color-text-muted] mt-0.5">
              Wild experimental effects
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={chaosMode}
            onClick={() => {
              setChaosMode(!chaosMode)
            }}
            disabled={isDisabled}
            className={`p-2 rounded-lg transition-all ${
              chaosMode
                ? 'bg-gradient-to-br from-purple-600/20 to-pink-500/20 border-2 border-purple-500'
                : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
            } disabled:opacity-50`}
            title={chaosMode ? 'Chaos Mode: ON' : 'Chaos Mode: OFF'}
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className={`transition-colors ${chaosMode ? 'stroke-purple-400' : 'stroke-gray-500'}`}
            >
              {/* Circle */}
              <circle cx="12" cy="12" r="8" strokeWidth="2" />
              {/* Diagonal slash 1 */}
              <line x1="6" y1="6" x2="18" y2="18" strokeWidth="2" />
              {/* Diagonal slash 2 */}
              <line x1="18" y1="6" x2="6" y2="18" strokeWidth="2" />
              {/* Top dot */}
              <circle
                cx="12"
                cy="5"
                r="1.5"
                className={chaosMode ? 'fill-purple-400' : 'fill-gray-500'}
              />
              {/* Side line - moves based on switch position */}
              <line
                x1={chaosMode ? '20' : '2'}
                y1="12"
                x2={chaosMode ? '22' : '4'}
                y2="12"
                strokeWidth="2"
                className="transition-all duration-300"
              />
            </svg>
          </button>
        </div>

        {/* Error Display */}
        {generationError !== null && generationError !== '' && (
          <div className="p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-xs">
            {generationError}
          </div>
        )}

        {/* Spacer */}
        <div className="flex-1" />

        {/* Generate Button */}
        <button
          type="submit"
          disabled={prompt.trim().length < 3 || isDisabled}
          className="w-full py-3 px-4 btn-mechanical disabled:opacity-50 disabled:cursor-not-allowed text-[--color-text-primary] text-sm font-medium rounded transition-all flex items-center justify-center gap-2 border-[--color-accent-secondary] hover:border-[--color-accent-primary]"
          style={{
            boxShadow: isGenerating
              ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 12px rgba(196, 163, 90, 0.3)'
              : undefined,
          }}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Generating...
            </>
          ) : (
            'Generate Effect'
          )}
        </button>
      </form>
    </aside>
  )
}
