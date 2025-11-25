import { create } from 'zustand'
import type { AudioSourceType, AudioFileInfo, AudioLevels, TestToneFrequency } from '@/types/audio'

interface AudioState {
  // Source
  source: AudioSourceType
  fileInfo: AudioFileInfo | null

  // Playback
  isPlaying: boolean
  currentTime: number
  duration: number
  isLooping: boolean

  // Levels
  levels: AudioLevels

  // Effect
  bypassEffect: boolean

  // Test tone
  testToneActive: boolean
  testToneFrequency: TestToneFrequency

  // Actions
  setSource: (source: AudioSourceType) => void
  setFileInfo: (info: AudioFileInfo | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setIsLooping: (looping: boolean) => void
  setLevels: (levels: AudioLevels) => void
  setBypassEffect: (bypass: boolean) => void
  toggleBypass: () => void
  setTestToneActive: (active: boolean) => void
  setTestToneFrequency: (freq: TestToneFrequency) => void
  reset: () => void
}

const initialState = {
  source: null as AudioSourceType,
  fileInfo: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  isLooping: false,
  levels: {
    inputLeft: 0,
    inputRight: 0,
    outputLeft: 0,
    outputRight: 0,
  },
  bypassEffect: false,
  testToneActive: false,
  testToneFrequency: 1000 as TestToneFrequency,
}

export const useAudioStore = create<AudioState>((set) => ({
  ...initialState,

  setSource: (source) => {
    set({ source })
  },
  setFileInfo: (fileInfo) => {
    set({ fileInfo })
  },
  setIsPlaying: (isPlaying) => {
    set({ isPlaying })
  },
  setCurrentTime: (currentTime) => {
    set({ currentTime })
  },
  setDuration: (duration) => {
    set({ duration })
  },
  setIsLooping: (isLooping) => {
    set({ isLooping })
  },
  setLevels: (levels) => {
    set({ levels })
  },
  setBypassEffect: (bypassEffect) => {
    set({ bypassEffect })
  },
  toggleBypass: () => {
    set((state) => ({ bypassEffect: !state.bypassEffect }))
  },
  setTestToneActive: (testToneActive) => {
    set({ testToneActive })
  },
  setTestToneFrequency: (testToneFrequency) => {
    set({ testToneFrequency })
  },
  reset: () => {
    set(initialState)
  },
}))
