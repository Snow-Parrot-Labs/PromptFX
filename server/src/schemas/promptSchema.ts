import { z } from 'zod'

export const generateEffectRequestSchema = z.object({
  prompt: z.string().min(3, 'Prompt must be at least 3 characters').max(500, 'Prompt too long'),
  options: z
    .object({
      complexity: z.enum(['simple', 'complex']).optional(),
      style: z.string().max(50).optional(),
    })
    .optional(),
})

export type GenerateEffectRequest = z.infer<typeof generateEffectRequestSchema>
