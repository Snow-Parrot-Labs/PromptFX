import { generateEffect, type GenerateEffectOptions } from './aiService.js'
import { generateEffectWithCollaboration } from './aiCollaborationService.js'
import { effectDefinitionSchema, type EffectDefinition } from '../schemas/effectSchema.js'
import { createError } from '../middleware/errorHandler.js'
import { generatePanelImage } from './imageService.js'
import { config } from '../config/index.js'

// In-memory storage for generated effects (MVP - would use database in production)
const effectsStore = new Map<string, EffectDefinition>()

// Use collaboration mode when OpenAI API is available (for DALL-E 2 inpainting)
const USE_COLLABORATION_MODE = Boolean(config.OPENAI_API_KEY)

export async function createEffect(
  prompt: string,
  options: GenerateEffectOptions = {}
): Promise<EffectDefinition> {
  let effect: EffectDefinition

  if (USE_COLLABORATION_MODE) {
    // New iterative collaboration mode: Claude → Gemini → Claude
    console.log('🤝 [EffectService] Using iterative Claude + Gemini collaboration mode')
    const result = await generateEffectWithCollaboration(prompt, options)
    effect = result.effect
  } else {
    // Legacy single-pass mode: Claude only, then Gemini for image
    console.log('📝 [EffectService] Using single-pass mode (Gemini not configured)')
    const { effect: generatedEffect } = await generateEffect(prompt, options)
    effect = generatedEffect

    // Generate panel background image with Gemini (if configured)
    console.log(
      '🖼️ [EffectService] Checking panelDesign:',
      effect.ui.panelDesign ? 'present' : 'missing'
    )
    if (effect.ui.panelDesign) {
      console.log('🖼️ [EffectService] Calling generatePanelImage...')
      const backgroundImage = await generatePanelImage(
        effect.name,
        effect.description,
        effect.ui.panelDesign
      )
      console.log(
        '🖼️ [EffectService] Image result:',
        backgroundImage ? `${backgroundImage.substring(0, 50)}...` : 'null'
      )
      if (backgroundImage) {
        effect.ui.artwork = {
          ...effect.ui.artwork,
          backgroundImage,
        }
        console.log('✅ [EffectService] Background image attached to effect.ui.artwork')
      }
    }
  }

  // Validate the generated effect
  const validation = effectDefinitionSchema.safeParse(effect)
  if (!validation.success) {
    console.error('Effect validation failed:')
    console.error('Validation errors:', JSON.stringify(validation.error.errors, null, 2))
    console.error('Generated effect:', JSON.stringify(effect, null, 2))
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
