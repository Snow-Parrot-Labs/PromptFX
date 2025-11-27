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
export async function generatePanelTexture(
  panelDesign: PanelDesign,
  chaosMode: boolean = false
): Promise<string | null> {
  console.log('🎨 [ImageService] generatePanelTexture called:', { panelDesign, chaosMode })

  if (!config.OPENAI_API_KEY) {
    console.warn('⚠️ [ImageService] OPENAI_API_KEY not configured, skipping texture generation')
    return null
  }

  try {
    const openai = new OpenAI({ apiKey: config.OPENAI_API_KEY })

    // Build texture prompt based on mode
    const texturePrompt = chaosMode
      ? buildChaosTexturePrompt(panelDesign)
      : buildTexturePrompt(panelDesign.primaryColor)
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

/**
 * Build a chaos-themed texture prompt that matches the panel design colors.
 * Maps colors to experimental/wild texture styles.
 */
function buildChaosTexturePrompt(panelDesign: PanelDesign): string {
  const primary = panelDesign.primaryColor.toLowerCase()
  const accent = panelDesign.accentColor.toLowerCase()

  // Determine chaos texture style based on colors
  let textureStyle = 'abstract digital glitch pattern'
  let description = 'cyberpunk aesthetic with data corruption artifacts'

  // Map colors to chaos texture themes
  if (primary.includes('1a') || primary.includes('0f') || primary.includes('16')) {
    // Dark colors → cosmic/space theme
    textureStyle = 'deep space nebula texture'
    description = 'swirling cosmic dust with distant stars and subtle color gradients'
  } else if (accent.includes('ff') && (accent.includes('00') || accent.includes('88'))) {
    // Neon accents → glitch/cyber theme
    textureStyle = 'holographic interference pattern'
    description = 'iridescent surface with digital scan lines and chromatic aberration'
  } else if (primary.includes('2') || primary.includes('3')) {
    // Mid tones → organic/surreal theme
    textureStyle = 'bioluminescent organic texture'
    description = 'flowing cellular patterns with ethereal glow'
  }

  return `Seamless tileable texture: ${textureStyle}.
${description}
Colors: ${panelDesign.primaryColor} base with ${panelDesign.accentColor} highlights.
Abstract, experimental, suitable for audio effect GUI background.
Uniform lighting, can be tiled seamlessly.
No text, no objects, pure abstract pattern.`
}

// Keep the old function signature for backwards compatibility
// but redirect to the new texture-only approach
export async function generatePanelImage(
  _effectName: string,
  _effectDescription: string,
  panelDesign: PanelDesign,
  _controls: unknown[] = [],
  chaosMode: boolean = false
): Promise<string | null> {
  return generatePanelTexture(panelDesign, chaosMode)
}
