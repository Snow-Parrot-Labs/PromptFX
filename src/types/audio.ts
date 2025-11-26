// Audio source types
export type AudioSourceType = 'file' | 'live' | 'tone' | null

// Supported audio formats
export const SUPPORTED_FORMATS = ['audio/wav', 'audio/mpeg', 'audio/aiff', 'audio/x-aiff'] as const
export type AudioFormat = (typeof SUPPORTED_FORMATS)[number]

// File extensions
export const SUPPORTED_EXTENSIONS = ['.wav', '.mp3', '.aiff'] as const
export type AudioExtension = (typeof SUPPORTED_EXTENSIONS)[number]

// Max file size: 256MB
export const MAX_FILE_SIZE = 256 * 1024 * 1024

// Audio configuration
export const AUDIO_CONFIG = {
  sampleRate: 44100,
  channels: 2, // Stereo
  latencyHint: 'interactive' as const,
} as const

// Test tone frequencies
export const TEST_TONE_FREQUENCIES = [100, 440, 1000, 10000] as const
export type TestToneFrequency = (typeof TEST_TONE_FREQUENCIES)[number]

// Test tone waveforms
export const TEST_TONE_WAVEFORMS = ['sine', 'sawtooth', 'square', 'triangle'] as const
export type TestToneWaveform = (typeof TEST_TONE_WAVEFORMS)[number]

// Audio file info
export interface AudioFileInfo {
  name: string
  size: number
  duration: number
  sampleRate: number
  channels: number
  format: string
}

// Audio playback state
export interface PlaybackState {
  isPlaying: boolean
  currentTime: number
  duration: number
  isLooping: boolean
}

// Audio levels
export interface AudioLevels {
  inputLeft: number
  inputRight: number
  outputLeft: number
  outputRight: number
}

// Waveform data
export interface WaveformData {
  peaks: Float32Array
  length: number
  duration: number
}

// Audio input device
export interface AudioInputDevice {
  deviceId: string
  label: string
  groupId: string
}

// Audio output device
export interface AudioOutputDevice {
  deviceId: string
  label: string
  groupId: string
}
