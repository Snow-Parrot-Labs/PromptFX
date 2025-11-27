import OpenAI from 'openai'
import { config } from '../config/index.js'

interface PanelDesign {
  primaryColor: string
  accentColor: string
  rackUnits: number
}

/**
 * Generate a simple tileable texture using DALL-E 3.
 * Returns a small texture that can be tiled as a CSS background.
 */
export async function generatePanelTexture(panelDesign: PanelDesign): Promise<string | null> {
  console.log('🎨 [ImageService] generatePanelTexture called:', { panelDesign })

  if (!config.OPENAI_API_KEY) {
    console.warn('⚠️ [ImageService] OPENAI_API_KEY not configured, skipping texture generation')
    return null
  }

  try {
    const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY })

    // Build a simple texture prompt based on the color
    const texturePrompt = buildTexturePrompt(panelDesign.primaryColor)
    console.log('📝 [ImageService] Texture prompt:', texturePrompt)

    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: texturePrompt,
      n: 1,
      size: '1024x1024',
      response_format: 'b64_json',
      quality: 'standard',
    })

    const imageData = response.data?.[0]?.b64_json
    if (imageData) {
      const dataUrl = `data:image/png;base64,${imageData}`
      console.log('✅ [ImageService] Generated texture, size:', imageData.length, 'chars')
      return dataUrl
    }

    console.warn('⚠️ [ImageService] No image data in response')
    return null
  } catch (error) {
    console.error('❌ [ImageService] Failed to generate texture:', error)
    return null
  }
}

/**
 * Build a simple texture prompt that's unlikely to hit safety filters.
 * Maps colors to appropriate texture descriptions.
 */
function buildTexturePrompt(primaryColor: string): string {
  // Determine texture style based on color
  const colorLower = primaryColor.toLowerCase()

  let textureStyle = 'brushed aluminum metal'
  let colorDesc = 'silver gray'

  // Map common colors to texture descriptions
  if (colorLower.includes('1a') || colorLower.includes('0a') || colorLower.includes('000')) {
    textureStyle = 'dark anodized aluminum'
    colorDesc = 'matte black'
  } else if (
    colorLower.includes('2a1') ||
    colorLower.includes('3a2') ||
    colorLower.includes('brown')
  ) {
    textureStyle = 'vintage powder coated steel'
    colorDesc = 'warm brown'
  } else if (
    colorLower.includes('cream') ||
    colorLower.includes('fff') ||
    colorLower.includes('eee')
  ) {
    textureStyle = 'vintage painted steel'
    colorDesc = 'cream white'
  } else if (colorLower.includes('00f') || colorLower.includes('blue')) {
    textureStyle = 'powder coated steel'
    colorDesc = 'navy blue'
  }

  return `Seamless tileable texture of ${textureStyle}.
${colorDesc} colored surface with subtle grain and micro-scratches.
Uniform flat lighting, no shadows or highlights.
Abstract material texture only, no objects or shapes.
Perfect for seamless tiling as a background pattern.`
}

// Keep the old function signature for backwards compatibility
// but redirect to the new texture-only approach
export async function generatePanelImage(
  _effectName: string,
  _effectDescription: string,
  panelDesign: PanelDesign,
  _controls: unknown[] = []
): Promise<string | null> {
  return generatePanelTexture(panelDesign)
}
