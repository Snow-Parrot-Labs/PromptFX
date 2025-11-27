import { useCallback, useEffect } from 'react'
import { useAudioStore } from '@/stores'
import { useAudioRecorder } from '@/hooks/useAudioRecorder'

export function RecordingControls(): React.JSX.Element {
  const { source, fileInfo } = useAudioStore()
  const {
    startRecording,
    stopRecording,
    isRecording,
    recordingDuration,
    recordedBlob,
    clearRecording,
  } = useAudioRecorder()

  const handleStartRecording = useCallback(() => {
    // startRecording handles errors internally with toast notifications
    startRecording()
  }, [startRecording])

  const handleStopRecording = useCallback(async () => {
    await stopRecording()
  }, [stopRecording])

  const handleDownload = useCallback(() => {
    if (!recordedBlob) return

    const url = URL.createObjectURL(recordedBlob)
    const a = document.createElement('a')
    a.href = url
    a.style.display = 'none'

    // Generate filename based on source
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
    let filename = 'recording'

    if (source === 'file' && fileInfo) {
      const baseName = fileInfo.name.replace(/\.[^/.]+$/, '')
      filename = `${baseName}_recording_${timestamp}.wav`
    } else if (source === 'live') {
      filename = `live_recording_${timestamp}.wav`
    } else if (source === 'tone') {
      filename = `tone_recording_${timestamp}.wav`
    } else {
      filename = `recording_${timestamp}.wav`
    }

    a.download = filename
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)

    // Revoke the URL after download
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }, [recordedBlob, source, fileInfo])

  const handleClear = useCallback(() => {
    if (
      window.confirm('Are you sure you want to clear this recording? This action cannot be undone.')
    ) {
      clearRecording()
    }
  }, [clearRecording])

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    const ms = Math.floor((seconds % 1) * 10)
    return `${String(mins)}:${secs.toString().padStart(2, '0')}.${String(ms)}`
  }

  const isDisabled = !source

  // Keyboard shortcut: R to start/stop recording
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent): void => {
      // Only trigger if not typing in an input/textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      if (event.key.toLowerCase() === 'r' && !event.metaKey && !event.ctrlKey) {
        event.preventDefault()

        if (isDisabled) {
          return
        }

        if (isRecording) {
          void handleStopRecording()
        } else if (!recordedBlob) {
          handleStartRecording()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => {
      window.removeEventListener('keydown', handleKeyPress)
    }
  }, [isRecording, recordedBlob, isDisabled, handleStartRecording, handleStopRecording])

  return (
    <div className="flex flex-col gap-3 p-3 rounded-lg bg-[--color-panel-alt] border border-[--color-border]">
      {/* Section title */}
      <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wider">
        Recording
      </div>

      <div className="flex flex-col items-center gap-2">
        {/* Recording status and timer */}
        {(isRecording || recordedBlob) && (
          <div className="text-center">
            <span
              className={`text-xs font-mono ${
                isRecording ? 'text-red-500 font-semibold' : 'text-[--color-text-secondary]'
              }`}
            >
              {isRecording && (
                <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse" />
              )}
              {formatTime(recordingDuration)}
            </span>
          </div>
        )}

        {/* Controls */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Record button */}
          {!isRecording && !recordedBlob && (
            <button
              onClick={handleStartRecording}
              disabled={isDisabled}
              className={`px-3 py-1.5 rounded-full flex items-center gap-2 transition-all ${
                isDisabled
                  ? 'btn-mechanical opacity-50 cursor-not-allowed text-[--color-text-muted]'
                  : 'btn-mechanical text-[--color-text-secondary] hover:text-red-500'
              }`}
              title={isDisabled ? 'Load audio or enable live input to record' : 'Start recording'}
              aria-label="Start recording"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="6" />
              </svg>
              <span className="text-xs font-semibold">REC</span>
            </button>
          )}

          {/* Stop button (while recording) */}
          {isRecording && (
            <button
              onClick={() => void handleStopRecording()}
              className="px-3 py-1.5 rounded-full btn-mechanical-lit text-red-500 flex items-center gap-2 transition-all animate-pulse"
              title="Stop recording"
              aria-label="Stop recording"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="6" width="12" height="12" />
              </svg>
              <span className="text-xs font-semibold">STOP</span>
            </button>
          )}

          {/* Download button (after recording) */}
          {recordedBlob && !isRecording && (
            <>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 rounded-full btn-mechanical text-[--color-accent-primary] hover:text-[--color-accent-secondary] flex items-center gap-2 transition-all"
                title="Download recording"
                aria-label="Download recording"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
                <span className="text-xs font-semibold">DOWNLOAD</span>
              </button>

              {/* Clear button */}
              <button
                onClick={handleClear}
                className="w-7 h-7 rounded-full btn-mechanical text-[--color-text-muted] hover:text-red-500 flex items-center justify-center transition-all"
                title="Clear recording"
                aria-label="Clear recording"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </>
          )}
        </div>

        {/* Help text */}
        {!isRecording && !recordedBlob && isDisabled && (
          <p className="text-[10px] text-[--color-text-muted] text-center">
            Load audio or enable live input to start recording
          </p>
        )}
      </div>
    </div>
  )
}
