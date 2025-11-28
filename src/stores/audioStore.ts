import { create } from 'zustand'
import type {
  AudioSourceType,
  AudioFileInfo,
  AudioLevels,
  ToneGeneratorWaveform,
  AudioInputDevice,
  AudioOutputDevice,
} from '@/types/audio'
import { TONE_GENERATOR_FREQ_DEFAULT } from '@/types/audio'

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

  // Tone generator
  toneGeneratorActive: boolean
  toneGeneratorFrequency: number
  toneGeneratorWaveform: ToneGeneratorWaveform

  // Live input
  liveInputEnabled: boolean
  liveInputError: string | null

  // Volume controls
  inputGain: number
  masterVolume: number

  // Audio input devices
  audioInputDevices: AudioInputDevice[]
  selectedInputDeviceId: string | null

  // Audio output devices
  audioOutputDevices: AudioOutputDevice[]
  selectedOutputDeviceId: string | null
  outputDeviceSupported: boolean

  // Recording
  isRecording: boolean
  recordingDuration: number
  recordedBlob: Blob | null
  recordingError: string | null

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
  setToneGeneratorActive: (active: boolean) => void
  setToneGeneratorFrequency: (freq: number) => void
  setToneGeneratorWaveform: (waveform: ToneGeneratorWaveform) => void
  setLiveInputEnabled: (enabled: boolean) => void
  setLiveInputError: (error: string | null) => void
  setInputGain: (gain: number) => void
  setMasterVolume: (volume: number) => void
  setAudioInputDevices: (devices: AudioInputDevice[]) => void
  setSelectedInputDeviceId: (deviceId: string | null) => void
  setAudioOutputDevices: (devices: AudioOutputDevice[]) => void
  setSelectedOutputDeviceId: (deviceId: string | null) => void
  setOutputDeviceSupported: (supported: boolean) => void
  setIsRecording: (recording: boolean) => void
  setRecordingDuration: (duration: number) => void
  setRecordedBlob: (blob: Blob | null) => void
  setRecordingError: (error: string | null) => void
  clearRecording: () => void
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
  toneGeneratorActive: false,
  toneGeneratorFrequency: TONE_GENERATOR_FREQ_DEFAULT,
  toneGeneratorWaveform: 'sine' as ToneGeneratorWaveform,
  liveInputEnabled: false,
  liveInputError: null as string | null,
  inputGain: 1,
  masterVolume: 1,
  audioInputDevices: [] as AudioInputDevice[],
  selectedInputDeviceId: null as string | null,
  audioOutputDevices: [] as AudioOutputDevice[],
  selectedOutputDeviceId: null as string | null,
  outputDeviceSupported: true, // Assume supported until checked
  isRecording: false,
  recordingDuration: 0,
  recordedBlob: null as Blob | null,
  recordingError: null as string | null,
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
  setToneGeneratorActive: (toneGeneratorActive) => {
    set({ toneGeneratorActive })
  },
  setToneGeneratorFrequency: (toneGeneratorFrequency) => {
    set({ toneGeneratorFrequency })
  },
  setToneGeneratorWaveform: (toneGeneratorWaveform) => {
    set({ toneGeneratorWaveform })
  },
  setLiveInputEnabled: (liveInputEnabled) => {
    set({ liveInputEnabled, liveInputError: null })
  },
  setLiveInputError: (liveInputError) => {
    set({ liveInputError })
  },
  setInputGain: (inputGain) => {
    set({ inputGain })
  },
  setMasterVolume: (masterVolume) => {
    set({ masterVolume })
  },
  setAudioInputDevices: (audioInputDevices) => {
    set({ audioInputDevices })
  },
  setSelectedInputDeviceId: (selectedInputDeviceId) => {
    set({ selectedInputDeviceId })
  },
  setAudioOutputDevices: (audioOutputDevices) => {
    set({ audioOutputDevices })
  },
  setSelectedOutputDeviceId: (selectedOutputDeviceId) => {
    set({ selectedOutputDeviceId })
  },
  setOutputDeviceSupported: (outputDeviceSupported) => {
    set({ outputDeviceSupported })
  },
  setIsRecording: (isRecording) => {
    set({ isRecording })
  },
  setRecordingDuration: (recordingDuration) => {
    set({ recordingDuration })
  },
  setRecordedBlob: (recordedBlob) => {
    set({ recordedBlob })
  },
  setRecordingError: (recordingError) => {
    set({ recordingError })
  },
  clearRecording: () => {
    set({ recordedBlob: null, recordingDuration: 0, recordingError: null })
  },
  reset: () => {
    set(initialState)
  },
}))
