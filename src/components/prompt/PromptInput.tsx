import { useState, useCallback } from 'react'
import { useEffectStore } from '@/stores/effectStore'
import { api } from '@/services/api'
import { toast } from '@/components/ui'

interface ComplexityOption {
  value: 'simple' | 'complex'
  label: string
  description: string
}

const COMPLEXITY_OPTIONS: ComplexityOption[] = [
  { value: 'simple', label: 'Simple', description: '1U, 2-3 controls' },
  { value: 'complex', label: 'Complex', description: '2U, 5-7 controls' },
]

export function PromptInput(): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [complexity, setComplexity] = useState<'simple' | 'complex'>('complex')
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const { isGenerating, generationError, generateEffect } = useEffectStore()

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    if (prompt.trim().length < 3 || isGenerating) return
    void generateEffect(prompt, { complexity })
  }

  const handleRandomEffect = useCallback(async (): Promise<void> => {
    setIsLoadingRandom(true)
    try {
      const response = await api.getRandomPrompt()
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
  }, [])

  const isDisabled = isGenerating || isLoadingRandom

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="effect-prompt" className="block text-sm font-medium text-gray-300">
              Describe Your Effect
            </label>
            <button
              type="button"
              onClick={() => {
                void handleRandomEffect()
              }}
              disabled={isDisabled}
              className="flex items-center gap-1.5 px-3 py-1 text-xs bg-purple-600 hover:bg-purple-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-full transition-colors"
            >
              {isLoadingRandom ? (
                <>
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
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
                  Thinking...
                </>
              ) : (
                <>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Random Effect
                </>
              )}
            </button>
          </div>
          <textarea
            id="effect-prompt"
            value={prompt}
            onChange={(e) => {
              setPrompt(e.target.value)
            }}
            placeholder="e.g., Warm vintage delay with tape saturation and subtle modulation..."
            className="w-full h-24 px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            maxLength={500}
            disabled={isDisabled}
          />
          <div className="flex justify-between text-xs text-gray-500 mt-1">
            <span>Min 3 characters</span>
            <span>{prompt.length}/500</span>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Complexity</label>
          <div className="flex gap-2">
            {COMPLEXITY_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  setComplexity(option.value)
                }}
                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  complexity === option.value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
                disabled={isDisabled}
              >
                <div>{option.label}</div>
                <div className="text-xs opacity-75">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {generationError !== null && generationError !== '' && (
          <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300 text-sm">
            {generationError}
          </div>
        )}

        <button
          type="submit"
          disabled={prompt.trim().length < 3 || isDisabled}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
              Generating Effect...
            </>
          ) : (
            'Generate Effect'
          )}
        </button>
      </form>
    </div>
  )
}
