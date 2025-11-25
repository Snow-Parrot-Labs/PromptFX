import { useCallback } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { audioEngine } from '@/services/audioEngine'

export function OutputControls(): React.JSX.Element {
  const { levels, masterVolume, bypassEffect, setMasterVolume, toggleBypass } = useAudioStore()

  const outputLevel = Math.max(levels.outputLeft, levels.outputRight)

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>): void => {
      const volume = parseFloat(e.target.value)
      setMasterVolume(volume)
      audioEngine.setMasterVolume(volume)
    },
    [setMasterVolume]
  )

  const handleMute = useCallback((): void => {
    if (masterVolume > 0) {
      setMasterVolume(0)
      audioEngine.setMasterVolume(0)
    } else {
      setMasterVolume(1)
      audioEngine.setMasterVolume(1)
    }
  }, [masterVolume, setMasterVolume])

  return (
    <div className="flex items-center gap-4 p-4 bg-gray-800 rounded-lg">
      {/* Output Level Meter */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-400 w-12">Output</span>
        <div className="w-24 h-3 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ${
              outputLevel > 0.9
                ? 'bg-red-500'
                : outputLevel > 0.7
                  ? 'bg-yellow-500'
                  : 'bg-green-500'
            }`}
            style={{ width: `${(outputLevel * 100).toString()}%` }}
          />
        </div>
      </div>

      {/* Volume Control */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleMute}
          className="p-1.5 text-gray-400 hover:text-white transition-colors"
          title={masterVolume > 0 ? 'Mute' : 'Unmute'}
        >
          {masterVolume > 0 ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
            </svg>
          )}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={masterVolume}
          onChange={handleVolumeChange}
          className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
        />
        <span className="text-xs text-gray-400 w-8">{Math.round(masterVolume * 100)}%</span>
      </div>

      {/* Bypass Toggle */}
      <button
        type="button"
        onClick={() => {
          toggleBypass()
        }}
        className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
          bypassEffect ? 'bg-yellow-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
      >
        {bypassEffect ? 'Bypassed' : 'Bypass'}
      </button>
    </div>
  )
}
