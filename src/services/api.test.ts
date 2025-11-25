import { describe, it, expect, vi, beforeEach } from 'vitest'
import { api } from './api'

// Mock fetch globally
const mockFetch = vi.fn()
global.fetch = mockFetch

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getRandomPrompt', () => {
    it('should make correct request to /effects/random-prompt', async () => {
      const mockResponse = {
        success: true,
        data: { prompt: 'Tape echo with wow and flutter' },
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getRandomPrompt()

      expect(mockFetch).toHaveBeenCalledTimes(1)
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/effects/random-prompt'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
        })
      )
      expect(result.success).toBe(true)
      expect(result.data).toEqual({ prompt: 'Tape echo with wow and flutter' })
    })

    it('should parse successful response correctly', async () => {
      const mockResponse = {
        success: true,
        data: { prompt: 'Massive hall reverb that swells and breathes' },
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getRandomPrompt()

      expect(result).toEqual({
        success: true,
        data: { prompt: 'Massive hall reverb that swells and breathes' },
      })
    })

    it('should handle error response', async () => {
      const mockErrorResponse = {
        success: false,
        error: {
          code: 'API_ERROR',
          message: 'Failed to generate prompt',
        },
      }

      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => mockErrorResponse,
      })

      const result = await api.getRandomPrompt()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'API_ERROR',
        message: 'Failed to generate prompt',
      })
    })

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'))

      // The API client should catch and return error response
      await expect(api.getRandomPrompt()).rejects.toThrow('Network error')
    })

    it('should handle response without success field', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        json: async () => ({}),
      })

      const result = await api.getRandomPrompt()

      expect(result.success).toBe(false)
      expect(result.error).toEqual({
        code: 'UNKNOWN_ERROR',
        message: 'An unexpected error occurred',
      })
    })

    it('should use correct API base URL from environment', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => ({ success: true, data: { prompt: 'test' } }),
      })

      await api.getRandomPrompt()

      const callUrl = mockFetch.mock.calls[0][0] as string
      // Should use default localhost URL or env variable
      expect(callUrl).toContain('/effects/random-prompt')
    })

    it('should return correct response type structure', async () => {
      const mockResponse = {
        success: true,
        data: { prompt: 'Crunchy lo-fi filter with random sample rate drops' },
      }

      mockFetch.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      })

      const result = await api.getRandomPrompt()

      expect(result).toHaveProperty('success')
      expect(result).toHaveProperty('data')
      if (result.success && result.data) {
        expect(result.data).toHaveProperty('prompt')
        expect(typeof result.data.prompt).toBe('string')
      }
    })
  })
})
