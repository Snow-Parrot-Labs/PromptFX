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
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      <button
        type="button"
        onClick={() => {
          void handleToggleLiveInput()
        }}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
          liveInputEnabled
            ? 'bg-red-600 hover:bg-red-700 text-white'
            : 'bg-gray-700 hover:bg-gray-600 text-gray-200'
        }`}
      >
        <svg
          className={`w-5 h-5 ${liveInputEnabled ? 'animate-pulse' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
          <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
        </svg>
        {liveInputEnabled ? 'Stop Mic' : 'Enable Mic'}
      </button>

      {liveInputEnabled && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Input Level</span>
          <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                inputLevel > 0.8
                  ? 'bg-red-500'
                  : inputLevel > 0.5
                    ? 'bg-yellow-500'
                    : 'bg-green-500'
              }`}
              style={{ width: `${(inputLevel * 100).toString()}%` }}
            />
          </div>
        </div>
      )}

      {liveInputError !== null && liveInputError !== '' && (
        <span className="text-sm text-red-400">{liveInputError}</span>
      )}

      {liveInputEnabled && (
        <div className="flex items-center gap-1 text-xs text-yellow-500">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
          </svg>
          <span>Use headphones to avoid feedback</span>
        </div>
      )}
    </div>
  )
}
