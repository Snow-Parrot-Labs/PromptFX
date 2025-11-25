import type { ApiResponse, GenerateEffectRequest, HealthCheckResponse } from '../types/api'
import type { EffectDefinition } from '../types/effect'

const envApiUrl: unknown = import.meta.env.VITE_API_URL
const API_BASE_URL = typeof envApiUrl === 'string' ? envApiUrl : 'http://localhost:3001/api'

class ApiClient {
  private baseUrl: string

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`

    let existingHeaders: Record<string, string> = {}
    if (options.headers instanceof Headers) {
      existingHeaders = Object.fromEntries(options.headers.entries())
    } else if (Array.isArray(options.headers)) {
      existingHeaders = Object.fromEntries(options.headers)
    } else if (options.headers !== undefined) {
      existingHeaders = options.headers
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...existingHeaders,
      },
    })

    const data = (await response.json()) as ApiResponse<T>

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error ?? {
          code: 'UNKNOWN_ERROR',
          message: 'An unexpected error occurred',
        },
      }
    }

    return data
  }

  async healthCheck(): Promise<ApiResponse<HealthCheckResponse>> {
    return this.request<HealthCheckResponse>('/health')
  }

  async generateEffect(request: GenerateEffectRequest): Promise<ApiResponse<EffectDefinition>> {
    return this.request<EffectDefinition>('/effects/generate', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  }

  async getEffects(): Promise<ApiResponse<EffectDefinition[]>> {
    return this.request<EffectDefinition[]>('/effects')
  }

  async getEffect(id: string): Promise<ApiResponse<EffectDefinition>> {
    return this.request<EffectDefinition>(`/effects/${id}`)
  }

  async deleteEffect(id: string): Promise<ApiResponse<{ message: string }>> {
    return this.request<{ message: string }>(`/effects/${id}`, {
      method: 'DELETE',
    })
  }

  async getRandomPrompt(): Promise<ApiResponse<{ prompt: string }>> {
    return this.request<{ prompt: string }>('/effects/random-prompt')
  }
}

export const api = new ApiClient(API_BASE_URL)
