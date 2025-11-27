import { useEffect, useCallback, useRef } from 'react'
import { useAudioStore } from '@/stores'
import { audioEngine } from '@/services/audioEngine'
import { audioRecorder } from '@/services/audioRecorder'
import { toast } from '@/components/ui'

export function useAudioRecorder(): {
  startRecording: () => void
  stopRecording: () => Promise<void>
  isRecording: boolean
  recordingDuration: number
  recordedBlob: Blob | null
  recordingError: string | null
  clearRecording: () => void
} {
  const {
    isRecording,
    recordingDuration,
    recordedBlob,
    recordingError,
    setIsRecording,
    setRecordingDuration,
    setRecordedBlob,
    setRecordingError,
    clearRecording,
    source,
  } = useAudioStore()

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const previousSourceRef = useRef(source)

  // Duration timer - updates every 100ms while recording
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        const duration = audioRecorder.getDuration()
        setRecordingDuration(duration)

        // Show warning at 9:30 (570 seconds)
        if (duration >= 570 && duration < 570.2) {
          toast.warning('Recording will stop at 10 minutes')
        }

        // Check if max duration reached
        if (duration >= audioRecorder.getMaxDuration()) {
          stopRecording().catch((error: unknown) => {
            console.error('Error stopping recording:', error)
          })
        }
      }, 100)
    } else {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
        timerRef.current = null
      }
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current)
      }
    }
  }, [isRecording, setRecordingDuration, stopRecording])

  // Source switching support - show notification
  useEffect(() => {
    if (isRecording && source !== previousSourceRef.current && previousSourceRef.current !== null) {
      toast.info('Audio source changed, continuing recording')
    }
    previousSourceRef.current = source
  }, [source, isRecording])

  const startRecording = useCallback(() => {
    try {
      // Clear any previous recording
      clearRecording()
      setRecordingError(null)

      // Get the recorder stream from audio engine
      const stream = audioEngine.getRecorderStream()

      if (!stream) {
        throw new Error('No audio stream available. Audio engine may not be initialized.')
      }

      // Start recording
      audioRecorder.start(stream)
      setIsRecording(true)
      setRecordingDuration(0)

      toast.success('Recording started')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to start recording'
      setRecordingError(errorMessage)
      toast.error(errorMessage)
      console.error('Error starting recording:', error)
    }
  }, [clearRecording, setIsRecording, setRecordingDuration, setRecordingError])

  const stopRecording = useCallback(async () => {
    try {
      if (!isRecording) {
        return
      }

      // Stop recording and get the WAV blob
      const blob = await audioRecorder.stop()
      setRecordedBlob(blob)
      setIsRecording(false)

      const duration = recordingDuration
      const minutes = Math.floor(duration / 60)
      const seconds = Math.floor(duration % 60)
      const durationText =
        minutes > 0 ? `${String(minutes)}m ${String(seconds)}s` : `${String(seconds)}s`

      toast.success(`Recording stopped (${durationText})`)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to stop recording'
      setRecordingError(errorMessage)
      setIsRecording(false)
      toast.error(errorMessage)
      console.error('Error stopping recording:', error)
    }
  }, [isRecording, recordingDuration, setIsRecording, setRecordedBlob, setRecordingError])

  return {
    startRecording,
    stopRecording,
    isRecording,
    recordingDuration,
    recordedBlob,
    recordingError,
    clearRecording,
  }
}
