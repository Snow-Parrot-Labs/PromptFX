import { generateEffect, type GenerateEffectOptions } from './aiService.js'
import { effectDefinitionSchema, type EffectDefinition } from '../schemas/effectSchema.js'
import { createError } from '../middleware/errorHandler.js'

// In-memory storage for generated effects (MVP - would use database in production)
const effectsStore = new Map<string, EffectDefinition>()

export async function createEffect(
  prompt: string,
  options: GenerateEffectOptions = {}
): Promise<EffectDefinition> {
  // Generate effect using AI
  const { effect } = await generateEffect(prompt, options)

  // Validate the generated effect
  const validation = effectDefinitionSchema.safeParse(effect)
  if (!validation.success) {
    console.error('Effect validation failed:', validation.error.errors)
    throw createError(
      'AI generated an invalid effect structure. Please try again with a different prompt.',
      500,
      'GENERATION_VALIDATION_ERROR',
      'Try rephrasing your effect description'
    )
  }

  // Store the effect
  effectsStore.set(effect.id, effect)

  return effect
}

export function getEffect(id: string): EffectDefinition | undefined {
  return effectsStore.get(id)
}

export function getAllEffects(): EffectDefinition[] {
  return Array.from(effectsStore.values())
}

export function deleteEffect(id: string): boolean {
  return effectsStore.delete(id)
}
