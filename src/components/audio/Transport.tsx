import { useCallback } from 'react'
import { useAudioStore } from '@/stores'
import { useAudioEngine } from '@/hooks'

export function Transport(): React.JSX.Element {
  const { isPlaying, currentTime, duration, isLooping, setIsLooping } = useAudioStore()
  const { play, pause, stop } = useAudioEngine()

  const handlePlayPause = useCallback(async () => {
    if (isPlaying) {
      pause()
    } else {
      await play()
    }
  }, [isPlaying, play, pause])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${String(mins)}:${secs.toString().padStart(2, '0')}.${String(ms)}`
  }

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      {/* Time display - current / total */}
      <div className="text-center">
        <span className="text-xs font-mono text-[--color-text-secondary]">
          {formatTime(currentTime)}
        </span>
        <span className="text-xs font-mono text-[--color-text-muted] mx-1">/</span>
        <span className="text-xs font-mono text-[--color-text-muted]">{formatTime(duration)}</span>
      </div>

      {/* Transport buttons - vintage reel-to-reel style */}
      <div className="flex items-center justify-center gap-2">
        {/* Stop */}
        <button
          onClick={stop}
          className="w-8 h-8 rounded-full btn-mechanical text-[--color-text-secondary] hover:text-[--color-text-primary] flex items-center justify-center transition-all"
          title="Stop"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="6" width="12" height="12" />
          </svg>
        </button>

        {/* Play/Pause */}
        <button
          onClick={() => void handlePlayPause()}
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            isPlaying
              ? 'btn-mechanical-lit text-[--color-accent-primary]'
              : 'btn-mechanical text-[--color-text-secondary] hover:text-[--color-text-primary]'
          }`}
          style={{
            boxShadow: isPlaying
              ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 12px rgba(196, 163, 90, 0.3)'
              : undefined,
          }}
          title={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
            </svg>
          ) : (
            <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </button>

        {/* Loop */}
        <button
          onClick={() => {
            setIsLooping(!isLooping)
          }}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isLooping
              ? 'btn-mechanical-lit text-[--color-accent-primary]'
              : 'btn-mechanical text-[--color-text-secondary] hover:text-[--color-text-primary]'
          }`}
          style={{
            boxShadow: isLooping
              ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(196, 163, 90, 0.25)'
              : undefined,
            animation: isLooping && isPlaying ? 'loopPulse 2s ease-in-out infinite' : undefined,
          }}
          title={isLooping ? 'Loop On' : 'Loop Off'}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>
    </div>
  )
}
