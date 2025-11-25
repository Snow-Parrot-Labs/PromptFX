import { useEffect, useCallback, useRef } from 'react'
import { useAudioStore } from '@/stores'
import { audioEngine } from '@/services/audioEngine'
import type { TestToneFrequency, WaveformData } from '@/types/audio'

interface UseAudioEngineReturn {
  initialize: () => Promise<void>
  loadFile: (file: File) => Promise<void>
  play: () => Promise<void>
  pause: () => void
  stop: () => void
  seek: (time: number) => void
  startTestTone: (frequency: TestToneFrequency) => Promise<void>
  stopTestTone: () => void
  setTestToneFreq: (frequency: TestToneFrequency) => void
  getWaveformData: () => WaveformData | null
}

export function useAudioEngine(): UseAudioEngineReturn {
  const {
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setLevels,
    setFileInfo,
    setSource,
    bypassEffect,
    testToneActive,
    testToneFrequency,
  } = useAudioStore()

  const isInitializedRef = useRef(false)

  // Initialize audio engine on mount
  const initialize = useCallback(async () => {
    if (isInitializedRef.current) return

    try {
      await audioEngine.initialize()
      isInitializedRef.current = true

      // Set up callbacks
      audioEngine.setCallbacks({
        onTimeUpdate: (time) => {
          setCurrentTime(time)
        },
        onLevelUpdate: (input, output) => {
          setLevels({
            inputLeft: input.left,
            inputRight: input.right,
            outputLeft: output.left,
            outputRight: output.right,
          })
        },
        onPlaybackEnd: () => {
          setIsPlaying(false)
        },
        onError: (error) => {
          console.error('Audio engine error:', error)
        },
      })
    } catch (error) {
      console.error('Failed to initialize audio engine:', error)
    }
  }, [setCurrentTime, setLevels, setIsPlaying])

  // Load audio file
  const loadFile = useCallback(
    async (file: File) => {
      await initialize()

      const info = await audioEngine.loadAudioFile(file)
      setFileInfo(info)
      setDuration(info.duration)
      setSource('file')
      setCurrentTime(0)
    },
    [initialize, setFileInfo, setDuration, setSource, setCurrentTime]
  )

  // Playback controls
  const play = useCallback(async () => {
    await initialize()
    audioEngine.play()
    setIsPlaying(true)
  }, [initialize, setIsPlaying])

  const pause = useCallback(() => {
    audioEngine.pause()
    setIsPlaying(false)
  }, [setIsPlaying])

  const stop = useCallback(() => {
    audioEngine.stop()
    setIsPlaying(false)
    setCurrentTime(0)
  }, [setIsPlaying, setCurrentTime])

  const seek = useCallback((time: number) => {
    audioEngine.seek(time)
  }, [])

  // Test tone controls
  const startTestTone = useCallback(
    async (frequency: TestToneFrequency) => {
      await initialize()
      audioEngine.startTestTone(frequency)
      setSource('tone')
    },
    [initialize, setSource]
  )

  const stopTestTone = useCallback(() => {
    audioEngine.stopTestTone()
    setSource(null)
  }, [setSource])

  const setTestToneFreq = useCallback((frequency: TestToneFrequency) => {
    audioEngine.setTestToneFrequency(frequency)
  }, [])

  // Get waveform data
  const getWaveformData = useCallback(() => {
    return audioEngine.getWaveformData()
  }, [])

  // Sync bypass state with audio engine
  useEffect(() => {
    audioEngine.setBypass(bypassEffect)
  }, [bypassEffect])

  // Sync test tone state
  useEffect(() => {
    if (testToneActive) {
      void startTestTone(testToneFrequency)
    } else {
      stopTestTone()
    }
  }, [testToneActive, testToneFrequency, startTestTone, stopTestTone])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.dispose()
      isInitializedRef.current = false
    }
  }, [])

  return {
    initialize,
    loadFile,
    play,
    pause,
    stop,
    seek,
    startTestTone,
    stopTestTone,
    setTestToneFreq,
    getWaveformData,
  }
}
