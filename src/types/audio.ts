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

// Tone generator frequency range (continuous 20Hz - 20kHz)
export const TONE_GENERATOR_FREQ_MIN = 20
export const TONE_GENERATOR_FREQ_MAX = 20000
export const TONE_GENERATOR_FREQ_DEFAULT = 440

// Tone generator waveforms
export const TONE_GENERATOR_WAVEFORMS = ['sine', 'sawtooth', 'square', 'triangle'] as const
export type ToneGeneratorWaveform = (typeof TONE_GENERATOR_WAVEFORMS)[number]

// Waveform display labels
export const WAVEFORM_LABELS: Record<ToneGeneratorWaveform, string> = {
  sine: 'Sin',
  sawtooth: 'Saw',
  square: 'Sqr',
  triangle: 'Tri',
}

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
