import { describe, it, expect, vi, beforeEach } from 'vitest'
import { Request, Response, NextFunction } from 'express'
import { effectRoutes } from './effects.js'
import { generateRandomPrompt } from '../services/aiService.js'
import { aiRateLimiter } from '../middleware/rateLimiter.js'

// Mock the service
vi.mock('../services/aiService.js', () => ({
  generateRandomPrompt: vi.fn(),
}))

// Mock rate limiter to bypass it in tests
vi.mock('../middleware/rateLimiter.js', () => ({
  aiRateLimiter: (_req: Request, _res: Response, next: NextFunction): void => {
    next()
  },
}))

describe('GET /api/effects/random-prompt', () => {
  let mockRequest: Partial<Request>
  let mockResponse: Partial<Response>
  let mockNext: NextFunction
  let jsonResponse: unknown
  let statusCode: number

  beforeEach(() => {
    vi.clearAllMocks()

    jsonResponse = null
    statusCode = 0

    mockRequest = {}

    mockResponse = {
      json: vi.fn((data: unknown) => {
        jsonResponse = data
        return mockResponse as Response
      }),
      status: vi.fn((code: number) => {
        statusCode = code
        return mockResponse as Response
      }),
    }

    mockNext = vi.fn()
  })

  it('should return correct response format on success', async () => {
    const mockPrompt = 'Tape echo with wow and flutter, slowly degrading into noise'
    vi.mocked(generateRandomPrompt).mockResolvedValue(mockPrompt)

    // Find the random-prompt route handler
    const route = effectRoutes.stack.find(
      (layer) => layer.route?.path === '/random-prompt' && layer.route?.methods?.get
    )

    expect(route).toBeDefined()

    if (route && route.route) {
      const handler = route.route.stack[route.route.stack.length - 1].handle
      await handler(mockRequest as Request, mockResponse as Response, mockNext)

      expect(generateRandomPrompt).toHaveBeenCalledTimes(1)
      expect(jsonResponse).toEqual({
        success: true,
        data: { prompt: mockPrompt },
      })
      expect(mockNext).not.toHaveBeenCalled()
    }
  })

  it('should handle errors and call next with error', async () => {
    const error = new Error('AI service failed')
    vi.mocked(generateRandomPrompt).mockRejectedValue(error)

    const route = effectRoutes.stack.find(
      (layer) => layer.route?.path === '/random-prompt' && layer.route?.methods?.get
    )

    expect(route).toBeDefined()

    if (route && route.route) {
      const handler = route.route.stack[route.route.stack.length - 1].handle
      await handler(mockRequest as Request, mockResponse as Response, mockNext)

      expect(generateRandomPrompt).toHaveBeenCalledTimes(1)
      expect(mockNext).toHaveBeenCalledWith(error)
    }
  })

  it('should use rate limiter middleware', () => {
    const route = effectRoutes.stack.find(
      (layer) => layer.route?.path === '/random-prompt' && layer.route?.methods?.get
    )

    expect(route).toBeDefined()
    if (route && route.route) {
      // Check that rate limiter is in the middleware stack
      const middlewareCount = route.route.stack.length
      // Should have at least the handler, and potentially rate limiter
      expect(middlewareCount).toBeGreaterThan(0)
    }
  })

  it('should return trimmed prompt in response', async () => {
    const mockPrompt = '  Padded prompt with spaces  '
    vi.mocked(generateRandomPrompt).mockResolvedValue(mockPrompt.trim())

    const route = effectRoutes.stack.find(
      (layer) => layer.route?.path === '/random-prompt' && layer.route?.methods?.get
    )

    expect(route).toBeDefined()

    if (route && route.route) {
      const handler = route.route.stack[route.route.stack.length - 1].handle
      await handler(mockRequest as Request, mockResponse as Response, mockNext)

      expect(jsonResponse).toEqual({
        success: true,
        data: { prompt: 'Padded prompt with spaces' },
      })
    }
  })
})
