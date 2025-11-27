import { Router, type Request, type Response, type NextFunction } from 'express'
import { createEffect, getEffect, getAllEffects, deleteEffect } from '../services/effectService.js'
import { generateEffectRequestSchema } from '../schemas/promptSchema.js'
import { aiRateLimiter } from '../middleware/rateLimiter.js'
import { createError } from '../middleware/errorHandler.js'
import { generateRandomPrompt } from '../services/aiService.js'

interface IdParams {
  id: string
}

export const effectRoutes = Router()

// GET /api/effects/random-prompt - Generate a random effect prompt using AI
effectRoutes.get(
  '/random-prompt',
  aiRateLimiter,
  async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const prompt = await generateRandomPrompt()
      res.json({
        success: true,
        data: { prompt },
      })
    } catch (error) {
      next(error)
    }
  }
)

// POST /api/effects/generate - Generate a new effect from prompt
effectRoutes.post(
  '/generate',
  aiRateLimiter,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Validate request body
      const validation = generateEffectRequestSchema.safeParse(req.body)
      if (!validation.success) {
        const errorMessages = validation.error.errors.map((e) => e.message).join(', ')
        throw createError(errorMessages, 400, 'VALIDATION_ERROR', 'Check your prompt and try again')
      }

      const { prompt, options } = validation.data

      // Generate effect
      const effect = await createEffect(prompt, options)

      // Debug: Log what we're returning
      console.log('📤 [Route] Returning effect:', {
        id: effect.id,
        name: effect.name,
        hasArtwork: effect.ui.artwork !== undefined,
        hasBackgroundImage: effect.ui.artwork?.backgroundImage !== undefined,
        backgroundImageLength: effect.ui.artwork?.backgroundImage?.length ?? 0,
      })

      res.status(201).json({
        success: true,
        data: effect,
      })
    } catch (error) {
      next(error)
    }
  }
)

// GET /api/effects - List all effects
effectRoutes.get('/', (_req: Request, res: Response): void => {
  const effects = getAllEffects()
  res.json({
    success: true,
    data: effects,
  })
})

// GET /api/effects/:id - Get a specific effect
effectRoutes.get('/:id', (req: Request<IdParams>, res: Response, next: NextFunction): void => {
  try {
    const effect = getEffect(req.params.id)
    if (!effect) {
      throw createError('Effect not found', 404, 'NOT_FOUND')
    }
    res.json({
      success: true,
      data: effect,
    })
  } catch (error) {
    next(error)
  }
})

// DELETE /api/effects/:id - Delete an effect
effectRoutes.delete('/:id', (req: Request<IdParams>, res: Response, next: NextFunction): void => {
  try {
    const deleted = deleteEffect(req.params.id)
    if (!deleted) {
      throw createError('Effect not found', 404, 'NOT_FOUND')
    }
    res.json({
      success: true,
      message: 'Effect deleted',
    })
  } catch (error) {
    next(error)
  }
})
