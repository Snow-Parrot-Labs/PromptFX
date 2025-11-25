import rateLimit from 'express-rate-limit'

// Rate limiter for AI generation endpoint
export const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests. Please wait a moment before generating another effect.',
      suggestion: 'Try again in a minute',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})

// General API rate limiter
export const generalRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
})
