import { useState, useCallback, useRef } from 'react'
import { useEffectStore } from '@/stores/effectStore'
import { useAudioStore } from '@/stores'
import { api } from '@/services/api'
import { toast } from '@/components/ui'
import { TestToneGenerator } from '@/components/audio/TestToneGenerator'
import { FileUploader } from '@/components/audio/FileUploader'
import { Waveform } from '@/components/audio/Waveform'
import { Transport } from '@/components/audio/Transport'
import { audioEngine } from '@/services/audioEngine'
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from '@/types/audio'

interface ComplexityOption {
  value: 'simple' | 'complex'
  label: string
  desc: string
}

const COMPLEXITY_OPTIONS: ComplexityOption[] = [
  { value: 'simple', label: 'Simple', desc: '1U, 2-3 controls' },
  { value: 'complex', label: 'Complex', desc: '2U, 5-7 controls' },
]

function SwapFileButton(): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  const { setFileInfo, setSource, setDuration } = useAudioStore()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
      toast.error('Unsupported format. Use WAV, MP3, or AIFF.')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max 256MB.')
      return
    }

    try {
      const fileInfo = await audioEngine.loadAudioFile(file)
      setFileInfo(fileInfo)
      setDuration(fileInfo.duration)
      setSource('file')
      toast.success(`Loaded: ${file.name}`)
    } catch {
      toast.error('Failed to load audio file')
    }

    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".wav,.mp3,.aiff,audio/wav,audio/mpeg,audio/aiff"
        onChange={(e) => {
          void handleFileChange(e)
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-2 py-0.5 text-[10px] font-medium text-[--color-text-tertiary] hover:text-[--color-text-secondary] btn-mechanical rounded transition-colors"
      >
        Swap
      </button>
    </>
  )
}

export function LeftPanel(): React.JSX.Element {
  const [prompt, setPrompt] = useState('')
  const [complexity, setComplexity] = useState<'simple' | 'complex'>('complex')
  const [chaosMode, setChaosMode] = useState(false)
  const [isLoadingRandom, setIsLoadingRandom] = useState(false)
  const { isGenerating, generationError, generateEffect } = useEffectStore()
  const { fileInfo, liveInputEnabled } = useAudioStore()

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

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {/* Prompt Form */}
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3 flex flex-col">
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
            <div className="mt-4">
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
            <div className="mt-4 flex items-center justify-between">
              <div>
                <label className="text-xs font-medium text-[--color-text-secondary]">
                  Chaos Mode
                </label>
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
                    ? 'bg-yellow-600/20 border-2 border-yellow-600'
                    : 'bg-gray-800/50 border-2 border-gray-700 hover:border-gray-600'
                } disabled:opacity-50`}
                title={chaosMode ? 'Chaos Mode: ON' : 'Chaos Mode: OFF'}
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Vertical toggle track (elongated oval) */}
                  <rect
                    x="11"
                    y="6"
                    width="10"
                    height="20"
                    rx="5"
                    className={`transition-colors ${
                      chaosMode
                        ? 'fill-yellow-900/40 stroke-yellow-600'
                        : 'fill-gray-800 stroke-gray-600'
                    }`}
                    strokeWidth="2"
                  />
                  {/* Toggle knob (moves up/down) */}
                  <circle
                    cx="16"
                    cy={chaosMode ? '21' : '11'}
                    r="4"
                    className={`transition-all duration-300 ${
                      chaosMode
                        ? 'fill-yellow-500 stroke-yellow-400'
                        : 'fill-gray-400 stroke-gray-300'
                    }`}
                    strokeWidth="1.5"
                  />
                </svg>
              </button>
            </div>

            {/* Generate Button */}
            <div className="mt-4">
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

              {/* Error Display */}
              {generationError !== null && generationError !== '' && (
                <div className="mt-2 p-2 bg-red-900/50 border border-red-700 rounded text-red-300 text-xs">
                  {generationError}
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Test Tone Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            Test Tone
          </h3>
          <TestToneGenerator />
        </div>

        {/* Audio File Area - always visible unless live input */}
        {!liveInputEnabled && (
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[--color-text-muted] uppercase tracking-wide">
                Audio File
              </h3>
              {fileInfo !== null && <SwapFileButton />}
            </div>
            <div className="space-y-2">
              {/* Waveform area - fixed height, doubles as drop zone when no file */}
              <div
                className="h-16 rounded overflow-hidden"
                style={{
                  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(0,0,0,0.2)',
                }}
              >
                {fileInfo !== null ? <Waveform /> : <FileUploader />}
              </div>
              {/* Transport controls */}
              <div className="flex items-center gap-2">
                <Transport />
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
