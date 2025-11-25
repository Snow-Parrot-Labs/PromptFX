import { useCallback } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { audioEngine } from '@/services/audioEngine'
import { toast } from '@/components/ui'

export function LiveInput(): React.JSX.Element {
  const {
    liveInputEnabled,
    liveInputError,
    levels,
    setLiveInputEnabled,
    setLiveInputError,
    setSource,
    setTestToneActive,
  } = useAudioStore()

  const handleToggleLiveInput = useCallback(async (): Promise<void> => {
    if (liveInputEnabled) {
      audioEngine.disableLiveInput()
      setLiveInputEnabled(false)
      setSource(null)
    } else {
      try {
        // Stop test tone if active
        setTestToneActive(false)
        audioEngine.stopTestTone()

        await audioEngine.enableLiveInput()
        setLiveInputEnabled(true)
        setSource('live')
        setLiveInputError(null)
        toast.info('Microphone enabled - use headphones to avoid feedback')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to enable microphone'
        setLiveInputError(message)
        toast.error(message)
      }
    }
  }, [liveInputEnabled, setLiveInputEnabled, setLiveInputError, setSource, setTestToneActive])

  const inputLevel = Math.max(levels.inputLeft, levels.inputRight)

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            void handleToggleLiveInput()
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
            liveInputEnabled
              ? 'btn-mechanical-lit text-[--color-error]'
              : 'btn-mechanical text-[--color-text-secondary]'
          }`}
          style={{
            boxShadow: liveInputEnabled
              ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(181, 74, 74, 0.4)'
              : undefined,
          }}
        >
          <svg
            className={`w-3.5 h-3.5 ${liveInputEnabled ? 'animate-pulse' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
          {liveInputEnabled ? 'Stop' : 'Mic'}
        </button>
        {liveInputError !== null && liveInputError !== '' && (
          <span className="text-[10px] text-red-400 truncate max-w-[100px]">{liveInputError}</span>
        )}
      </div>

      {liveInputEnabled && (
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 bg-[--color-bg-tertiary] rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                inputLevel > 0.8
                  ? 'bg-[--color-meter-red]'
                  : inputLevel > 0.5
                    ? 'bg-[--color-meter-yellow]'
                    : 'bg-[--color-meter-green]'
              }`}
              style={{ width: `${(inputLevel * 100).toString()}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
