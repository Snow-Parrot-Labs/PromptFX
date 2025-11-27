import type { EffectDefinition } from './effect'

// API Response wrapper
export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: ApiError
}

export interface ApiError {
  code: string
  message: string
  suggestion?: string
}

// Effect Generation
export interface GenerateEffectRequest {
  prompt: string
  options?: {
    complexity?: 'simple' | 'complex'
    style?: string
  }
}

export interface GenerateEffectResponse {
  success: true
  data: EffectDefinition
}

// Audio Upload
export interface AudioUploadResponse {
  success: true
  data: {
    id: string
    filename: string
    duration: number
    sampleRate: number
    channels: number
    format: string
  }
}

// Presets
export interface PresetListResponse {
  success: true
  data: {
    presets: Array<{
      id: string
      name: string
      description: string
    }>
  }
}

// Health Check
export interface HealthCheckResponse {
  status: 'ok' | 'error'
  version: string
  timestamp: string
}
