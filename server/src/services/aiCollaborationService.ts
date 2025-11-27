import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config/index.js'
import type { EffectDefinition } from '../schemas/effectSchema.js'
import { generatePanelImage } from './imageService.js'

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
})

export interface GenerateEffectOptions {
  complexity?: 'simple' | 'complex'
  style?: string
  chaosMode?: boolean
}

interface EffectConcept {
  name: string
  description: string
  nodes: EffectDefinition['nodes']
  connections: EffectDefinition['connections']
  panelDesign: {
    rackUnits: 1 | 2
    primaryColor: string
    accentColor: string
    textColor: string
  }
  controlConcepts: Array<{
    id: string
    type: 'knob' | 'slider' | 'switch'
    label: string
    binding: { nodeId: string; param: string }
    importance: 'primary' | 'secondary' | 'tertiary'
    suggestedColor?: string
  }>
  brandName: string
  visualStyle: 'vintage-warm' | 'modern-clean' | 'industrial' | 'colorful-pedal'
}

interface VisualDesignResult {
  backgroundImage: string | null
  suggestedControlZones: Array<{
    name: string
    x: number
    y: number
    width: number
    height: number
  }>
  colorPalette: {
    primary: string
    accent: string
    text: string
    controlHighlight: string
  }
}

/**
 * Step 1: Generate initial effect concept with Claude
 * This includes DSP design and basic UI/control layout ideas
 */
async function generateEffectConcept(
  prompt: string,
  options: GenerateEffectOptions = {}
): Promise<EffectConcept> {
  console.log('🧠 [Collaboration] Step 1: Generating effect concept with Claude...')

  const complexityHint =
    options.complexity === 'simple'
      ? 'Create a simple effect with 2-3 controls. Panel size: 1 rack unit.'
      : 'Create a complex effect with 5-7 controls and multiple processing stages. Panel size: 2 rack units.'

  const styleHint = options.style ? `Style preference: ${options.style}.` : ''

  const conceptPrompt = `You are designing the CONCEPT for an audio effect plugin. Focus on the DSP architecture and control layout.

User request: "${prompt}"
${complexityHint}
${styleHint}

Generate a JSON concept with:
1. Effect name and description
2. DSP nodes and connections
3. Panel design (colors, size)
4. Control concepts (what parameters to expose, their importance)
5. Visual style direction

IMPORTANT: This is just the concept phase. Don't worry about exact control positions yet.

Respond with ONLY valid JSON matching this structure:
{
  "name": "Effect Name",
  "description": "Brief description",
  "nodes": [
    { "id": "input", "type": "input", "params": {} },
    { "id": "...", "type": "...", "params": { ... } },
    { "id": "output", "type": "output", "params": {} }
  ],
  "connections": [
    { "from": { "nodeId": "..." }, "to": { "nodeId": "..." } }
  ],
  "panelDesign": {
    "rackUnits": 2,
    "primaryColor": "#hex",
    "accentColor": "#hex",
    "textColor": "#hex"
  },
  "controlConcepts": [
    {
      "id": "ctrl1",
      "type": "knob",
      "label": "PARAM",
      "binding": { "nodeId": "...", "param": "..." },
      "importance": "primary",
      "suggestedColor": "amber"
    }
  ],
  "brandName": "EFFECT-NAME",
  "visualStyle": "vintage-warm"
}

DSP Node Types:
- input, output (required)
- delay: { time: 0-2000, feedback: 0-1, mix: 0-1 }
- reverb: { decay: 0.1-10, preDelay: 0-100, mix: 0-1 }
- filter: { type: "lowpass"|"highpass"|"bandpass"|"notch", frequency: 20-20000, Q: 0.1-20 }
- distortion: { type: "soft"|"hard"|"foldback"|"bitcrush", amount: 0-1, mix: 0-1 }
- gain: { gain: -60 to 12 }
- compressor: { threshold: -60 to 0, ratio: 1-20, attack: 0-1000, release: 0-3000 }
- chorus: { rate: 0.1-10, depth: 0-1, mix: 0-1 }
- tremolo: { rate: 0.1-20, depth: 0-1, shape: "sine"|"square"|"triangle" }
- panner: { pan: -1 to 1 }

Visual Styles:
- "vintage-warm": Neve/UA style, warm colors, cream accents
- "modern-clean": SSL style, blue-gray, precise
- "industrial": Aggressive, dark, red accents
- "colorful-pedal": Boss/Roland style, bold colors`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [{ role: 'user', content: conceptPrompt }],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from Claude for concept generation')
  }

  // Parse JSON response
  let jsonText = textContent.text.trim()
  if (jsonText.startsWith('```')) {
    jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
  if (jsonMatch) {
    jsonText = jsonMatch[0]
  }

  const concept = JSON.parse(jsonText) as EffectConcept

  // Override rackUnits based on complexity option (simple = 1U, complex = 2U)
  const rackUnits = options.complexity === 'simple' ? 1 : 2
  concept.panelDesign.rackUnits = rackUnits as 1 | 2

  console.log(
    '✅ [Collaboration] Effect concept generated:',
    concept.name,
    `(complexity: ${options.complexity ?? 'default'}, rackUnits: ${rackUnits}U)`
  )
  return concept
}

/**
 * Step 2: Generate visual design with DALL-E texture
 * Generates a simple tileable texture for the panel background
 */
async function generateVisualDesign(
  concept: EffectConcept,
  chaosMode: boolean = false
): Promise<VisualDesignResult> {
  console.log('🎨 [Collaboration] Step 2: Generating panel texture with DALL-E...')

  // Define control zones based on number of controls
  const numControls = concept.controlConcepts.length
  const zones = generateControlZones(numControls, concept.panelDesign.rackUnits)

  // Generate a simple tileable texture (no inpainting needed)
  const backgroundImage = await generatePanelImage(
    concept.name,
    concept.description,
    {
      primaryColor: concept.panelDesign.primaryColor,
      accentColor: concept.panelDesign.accentColor,
      rackUnits: concept.panelDesign.rackUnits,
    },
    [],
    chaosMode
  )

  console.log('✅ [Collaboration] Visual design generated with', zones.length, 'control zones')

  return {
    backgroundImage,
    suggestedControlZones: zones,
    colorPalette: {
      primary: concept.panelDesign.primaryColor,
      accent: concept.panelDesign.accentColor,
      text: concept.panelDesign.textColor,
      controlHighlight: concept.panelDesign.accentColor,
    },
  }
}

/**
 * Generate control zones based on number of controls
 */
function generateControlZones(
  numControls: number,
  _rackUnits: number
): VisualDesignResult['suggestedControlZones'] {
  const zones: VisualDesignResult['suggestedControlZones'] = []

  // Distribute controls horizontally with good spacing
  const margin = 12 // % from edges
  const availableWidth = 100 - margin * 2
  const spacing = availableWidth / (numControls + 1)

  for (let i = 0; i < numControls; i++) {
    const x = margin + spacing * (i + 1)
    zones.push({
      name: `control-${i + 1}`,
      x,
      y: 50, // Center vertically
      width: 15,
      height: 40,
    })
  }

  return zones
}

/**
 * Step 3: Refine effect with visual context from Gemini
 * Claude positions controls based on the visual design
 */
async function refineEffectWithVisuals(
  concept: EffectConcept,
  visualDesign: VisualDesignResult,
  prompt: string
): Promise<EffectDefinition> {
  console.log('🔧 [Collaboration] Step 3: Refining effect with Claude based on visual design...')

  // Valid color themes for controls
  const validColors = ['amber', 'cyan', 'green', 'red', 'white', 'purple'] as const
  type ControlColorTheme = (typeof validColors)[number]
  type ControlSize = 'sm' | 'md' | 'lg'

  // Map control concepts to zones
  const controls = concept.controlConcepts.map((ctrl, index) => {
    const zone = visualDesign.suggestedControlZones[index] || { x: 50, y: 50 }

    // Determine size based on importance
    const size: ControlSize =
      ctrl.importance === 'primary' ? 'lg' : ctrl.importance === 'secondary' ? 'md' : 'sm'

    // Map suggested color to valid theme (default to amber if invalid)
    const suggestedColor = ctrl.suggestedColor?.toLowerCase()
    const color: ControlColorTheme = validColors.includes(suggestedColor as ControlColorTheme)
      ? (suggestedColor as ControlColorTheme)
      : 'amber'

    // Determine config based on control type and binding
    const config = generateControlConfig(ctrl, concept.nodes)

    return {
      id: ctrl.id,
      type: ctrl.type,
      label: ctrl.label,
      position: { x: Math.round(zone.x), y: Math.round(zone.y) },
      style: {
        color,
        size,
        indicator: 'line' as const,
      },
      binding: ctrl.binding,
      config,
    }
  })

  // Always add mandatory MIX control (master wet/dry)
  controls.push({
    id: 'master_mix',
    type: 'knob' as const,
    label: 'MIX',
    position: { x: 92, y: 50 },
    style: {
      color: 'white' as const,
      size: 'md' as const,
      indicator: 'line' as const,
    },
    binding: { nodeId: '_engine', param: 'mix' },
    config: {
      min: 0,
      max: 1,
      default: 1,
    } as KnobConfig,
  })

  // Generate decorations
  const decorations = [{ type: 'led' as const, position: { x: 8, y: 10 }, color: 'green' as const }]

  // Add section labels if we have grouped controls
  if (controls.length > 2) {
    decorations.push({
      type: 'label' as const,
      position: { x: 50, y: 78 },
      text: 'PARAMETERS',
      size: 'xs',
    } as never)
  }

  // Build the final effect definition
  const effectId = `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const effect: EffectDefinition = {
    id: effectId,
    name: concept.name,
    description: concept.description,
    prompt,
    version: '1.0.0',
    nodes: concept.nodes,
    connections: concept.connections,
    ui: {
      layout: 'absolute',
      panelDesign: concept.panelDesign,
      artwork: {
        background: {
          type: 'gradient',
          colors: [concept.panelDesign.primaryColor, darkenColor(concept.panelDesign.primaryColor)],
          direction: 'vertical',
        },
        backgroundImage: visualDesign.backgroundImage ?? undefined,
        elements: [
          {
            type: 'stripe',
            position: { x: 0, y: 82, width: 100, height: 18 },
            color: darkenColor(concept.panelDesign.primaryColor, 0.3),
          },
        ],
        brandLabel: {
          text: concept.brandName,
          position: { x: 50, y: 8 },
          style: 'embossed',
        },
      },
      controls,
      decorations,
    },
    metadata: {
      createdAt: new Date().toISOString(),
      generationTimeMs: 0, // Will be updated by caller
      aiModel: 'claude-sonnet-4-20250514+gemini-2.0-flash',
    },
  }

  console.log('✅ [Collaboration] Effect refined with', controls.length, 'controls')
  return effect
}

// Config types matching the schema
interface KnobConfig {
  min: number
  max: number
  default: number
  step?: number
  unit?: string
  curve?: 'linear' | 'exponential' | 'logarithmic'
}

interface SliderConfig {
  min: number
  max: number
  default: number
  step?: number
  unit?: string
  orientation?: 'horizontal' | 'vertical'
}

interface SwitchConfig {
  default: boolean
  onLabel?: string
  offLabel?: string
}

type ControlConfig = KnobConfig | SliderConfig | SwitchConfig

/**
 * Generate control config based on type and node parameters
 */
function generateControlConfig(
  ctrl: EffectConcept['controlConcepts'][0],
  nodes: EffectDefinition['nodes']
): ControlConfig {
  const node = nodes.find((n) => n.id === ctrl.binding.nodeId)
  const param = ctrl.binding.param

  // Default ranges based on common parameters
  const paramDefaults: Record<string, { min: number; max: number; unit?: string }> = {
    time: { min: 0, max: 2000, unit: 'ms' },
    feedback: { min: 0, max: 0.95 },
    mix: { min: 0, max: 1 },
    decay: { min: 0.1, max: 10, unit: 's' },
    preDelay: { min: 0, max: 100, unit: 'ms' },
    frequency: { min: 20, max: 20000, unit: 'Hz' },
    Q: { min: 0.1, max: 20 },
    amount: { min: 0, max: 1 },
    gain: { min: -60, max: 12, unit: 'dB' },
    threshold: { min: -60, max: 0, unit: 'dB' },
    ratio: { min: 1, max: 20 },
    attack: { min: 0, max: 1000, unit: 'ms' },
    release: { min: 0, max: 3000, unit: 'ms' },
    rate: { min: 0.1, max: 10, unit: 'Hz' },
    depth: { min: 0, max: 1 },
    pan: { min: -1, max: 1 },
  }

  const defaults = paramDefaults[param] || { min: 0, max: 1 }
  const currentValue = node?.params[param]
  const defaultValue =
    typeof currentValue === 'number' ? currentValue : (defaults.min + defaults.max) / 2

  if (ctrl.type === 'switch') {
    const config: SwitchConfig = {
      default: false,
      onLabel: 'ON',
      offLabel: 'OFF',
    }
    return config
  }

  if (ctrl.type === 'slider') {
    const config: SliderConfig = {
      min: defaults.min,
      max: defaults.max,
      default: defaultValue,
      orientation: 'vertical',
    }
    if (defaults.unit) {
      config.unit = defaults.unit
    }
    return config
  }

  // Knob
  const config: KnobConfig = {
    min: defaults.min,
    max: defaults.max,
    default: defaultValue,
  }
  if (defaults.unit) {
    config.unit = defaults.unit
  }
  return config
}

/**
 * Darken a hex color
 */
function darkenColor(hex: string, amount: number = 0.2): string {
  // Remove # if present
  const color = hex.replace('#', '')

  // Parse RGB
  const r = parseInt(color.substring(0, 2), 16)
  const g = parseInt(color.substring(2, 4), 16)
  const b = parseInt(color.substring(4, 6), 16)

  // Darken
  const newR = Math.max(0, Math.floor(r * (1 - amount)))
  const newG = Math.max(0, Math.floor(g * (1 - amount)))
  const newB = Math.max(0, Math.floor(b * (1 - amount)))

  // Convert back to hex
  return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`
}

/**
 * Main collaboration function - orchestrates Claude and Gemini working together
 */
export async function generateEffectWithCollaboration(
  prompt: string,
  options: GenerateEffectOptions = {}
): Promise<{ effect: EffectDefinition; generationTimeMs: number }> {
  const startTime = Date.now()
  const chaosMode = options.chaosMode ?? false

  console.log(
    `🤝 [Collaboration] Starting ${chaosMode ? 'CHAOS' : 'normal'} iterative AI collaboration...`
  )
  console.log('📝 [Collaboration] User prompt:', prompt)

  // Step 1: Claude generates concept
  const concept = await generateEffectConcept(prompt, options)

  // Step 2: DALL-E generates visual design (with chaos mode)
  const visualDesign = await generateVisualDesign(concept, chaosMode)

  // Step 3: Claude refines with visual context
  const effect = await refineEffectWithVisuals(concept, visualDesign, prompt)

  const generationTimeMs = Date.now() - startTime
  effect.metadata.generationTimeMs = generationTimeMs

  console.log('✅ [Collaboration] Complete! Generated in', generationTimeMs, 'ms')

  return { effect, generationTimeMs }
}
