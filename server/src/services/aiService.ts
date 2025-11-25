import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config/index.js'
import type { EffectDefinition } from '../schemas/effectSchema.js'

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert audio DSP engineer and creative UI designer specializing in rack-mounted audio gear. Generate unique, visually stunning effect units that look like professional studio equipment.

IMPORTANT: You are designing a CREATIVE, UNIQUE rack-mount effect panel. Each effect should have its own visual identity.

## DSP Node Types (params MUST be an object, even if empty: "params": {})
- input: Audio input (required, params: {})
- output: Audio output (required, params: {})
- delay: params: { time: 0-2000, feedback: 0-1, mix: 0-1 }
- reverb: params: { decay: 0.1-10, preDelay: 0-100, mix: 0-1 }
- filter: params: { type: "lowpass"|"highpass"|"bandpass"|"notch", frequency: 20-20000, Q: 0.1-20 }
- distortion: params: { type: "soft"|"hard"|"foldback"|"bitcrush", amount: 0-1, mix: 0-1 }
- gain: params: { gain: -60 to 12 }
- compressor: params: { threshold: -60 to 0, ratio: 1-20, attack: 0-1000, release: 0-3000 }
- chorus: params: { rate: 0.1-10, depth: 0-1, mix: 0-1 }
- tremolo: params: { rate: 0.1-20, depth: 0-1, shape: "sine"|"square"|"triangle" }
- panner: params: { pan: -1 to 1 }

## Connection Format (MUST use objects with nodeId):
{ "from": { "nodeId": "sourceNodeId" }, "to": { "nodeId": "targetNodeId" } }

## UI Controls (position x,y are 0-100%)
- knob: style.color: amber|cyan|green|red|white|purple, style.size: sm|md|lg
- slider: orientation: horizontal|vertical
- switch: onLabel, offLabel

## COMPLETE EXAMPLE (follow this structure exactly):
{
  "name": "Warm Delay",
  "description": "Analog-style delay with tape warmth",
  "nodes": [
    { "id": "input", "type": "input", "params": {} },
    { "id": "delay1", "type": "delay", "params": { "time": 300, "feedback": 0.4, "mix": 0.5 } },
    { "id": "filter1", "type": "filter", "params": { "type": "lowpass", "frequency": 3000, "Q": 1 } },
    { "id": "output", "type": "output", "params": {} }
  ],
  "connections": [
    { "from": { "nodeId": "input" }, "to": { "nodeId": "delay1" } },
    { "from": { "nodeId": "delay1" }, "to": { "nodeId": "filter1" } },
    { "from": { "nodeId": "filter1" }, "to": { "nodeId": "output" } }
  ],
  "ui": {
    "layout": "absolute",
    "panelDesign": {
      "rackUnits": 2,
      "primaryColor": "#1a1a2e",
      "accentColor": "#f59e0b",
      "textColor": "#e5e5e5"
    },
    "artwork": {
      "background": { "type": "gradient", "colors": ["#1a1a2e", "#0f0f1a"], "direction": "vertical" },
      "elements": [
        { "type": "stripe", "position": { "x": 0, "y": 85, "width": 100, "height": 15 }, "color": "#0a0a12" },
        { "type": "glow", "position": { "x": 25, "y": 50 }, "color": "#f59e0b", "radius": 15, "opacity": 0.15 }
      ],
      "brandLabel": { "text": "WARM-DELAY", "position": { "x": 50, "y": 10 }, "style": "embossed" }
    },
    "controls": [
      {
        "id": "time", "type": "knob", "label": "TIME",
        "position": { "x": 25, "y": 50 },
        "style": { "color": "amber", "size": "lg", "indicator": "line" },
        "binding": { "nodeId": "delay1", "param": "time" },
        "config": { "min": 0, "max": 2000, "default": 300, "unit": "ms" }
      },
      {
        "id": "feedback", "type": "knob", "label": "FEEDBACK",
        "position": { "x": 50, "y": 50 },
        "style": { "color": "amber", "size": "lg", "indicator": "line" },
        "binding": { "nodeId": "delay1", "param": "feedback" },
        "config": { "min": 0, "max": 1, "default": 0.4 }
      },
      {
        "id": "mix", "type": "knob", "label": "MIX",
        "position": { "x": 75, "y": 50 },
        "style": { "color": "white", "size": "md", "indicator": "line" },
        "binding": { "nodeId": "delay1", "param": "mix" },
        "config": { "min": 0, "max": 1, "default": 0.5 }
      }
    ],
    "decorations": [
      { "type": "led", "position": { "x": 92, "y": 10 }, "color": "green" }
    ]
  }
}

## Creative Guidelines
1. EVERY effect needs unique panel colors (warm=amber/red, cold=cyan/blue)
2. Position controls intentionally across the panel (x: 15-85%, y: 35-75%)
3. Use brandLabel for a cool hardware name (e.g., "NEBULA-VERB", "TAPE-CRUSH")
4. Add visual elements: stripes, glows behind knobs
5. Include at least one LED indicator
6. Use lg knobs for main controls, sm/md for secondary`

export interface GenerateEffectOptions {
  complexity?: 'simple' | 'moderate' | 'complex'
  style?: string
}

export interface GenerateEffectResult {
  effect: EffectDefinition
  generationTimeMs: number
}

export async function generateRandomPrompt(): Promise<string> {
  // Seed words to inspire variety - pick a few random ones
  const adjectives = [
    'shimmering',
    'crushed',
    'wobbly',
    'crystalline',
    'murky',
    'stuttering',
    'dreamy',
    'aggressive',
    'haunted',
    'silky',
    'crunchy',
    'liquid',
    'broken',
    'lush',
    'razor-sharp',
    'dusty',
    'cosmic',
    'underwater',
  ]
  const effects = [
    'delay',
    'reverb',
    'distortion',
    'chorus',
    'phaser',
    'flanger',
    'filter',
    'compressor',
    'tremolo',
    'bitcrusher',
    'tape saturation',
    'ring mod',
    'pitch shifter',
    'granular',
    'slapback',
    'spring reverb',
  ]
  const vibes = [
    'like an old radio',
    'from another dimension',
    'through broken speakers',
    'in a cave',
    'on a scratched vinyl',
    'through telephone wires',
    'like a dying robot',
    'underwater',
    'in slow motion',
    'from the 80s',
  ]

  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const effect = effects[Math.floor(Math.random() * effects.length)]
  const vibe = vibes[Math.floor(Math.random() * vibes.length)]

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    temperature: 1,
    messages: [
      {
        role: 'user',
        content: `Write a short audio effect idea (6-12 words) inspired by: "${adj} ${effect} ${vibe}"

Just write a natural-sounding effect description a musician might request. Be creative and don't just repeat the words I gave you.

Examples of good responses:
- "Tape echo with wow and flutter, slowly degrading into noise"
- "Massive hall reverb that swells and breathes"
- "Crunchy lo-fi filter with random sample rate drops"

Respond with ONLY the description. No quotes.`,
      },
    ],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from AI')
  }

  return textContent.text.trim()
}

export async function generateEffect(
  prompt: string,
  options: GenerateEffectOptions = {}
): Promise<GenerateEffectResult> {
  const startTime = Date.now()

  const complexityHint =
    options.complexity === 'simple'
      ? 'Create a simple effect with 2-3 controls.'
      : options.complexity === 'complex'
        ? 'Create a complex effect with 5-7 controls and multiple processing stages.'
        : 'Create a moderately complex effect with 3-5 controls.'

  const styleHint = options.style ? `Style preference: ${options.style}.` : ''

  const userMessage = `Create an audio effect based on this description: "${prompt}"

${complexityHint}
${styleHint}

Respond with only the JSON object, no additional text or markdown formatting.`

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [
      {
        role: 'user',
        content: userMessage,
      },
    ],
  })

  const generationTimeMs = Date.now() - startTime

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === 'text')
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text response from AI')
  }

  // Parse the JSON response
  let effectData: Record<string, unknown>
  try {
    // Remove any potential markdown code blocks
    let jsonText = textContent.text.trim()
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    effectData = JSON.parse(jsonText) as Record<string, unknown>
  } catch {
    throw new Error('Failed to parse AI response as JSON')
  }

  // Generate unique ID and add metadata
  const effectId = `effect_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

  const effect: EffectDefinition = {
    id: effectId,
    name: String(effectData.name ?? 'Generated Effect'),
    description: String(effectData.description ?? ''),
    prompt,
    version: '1.0.0',
    nodes: effectData.nodes as EffectDefinition['nodes'],
    connections: effectData.connections as EffectDefinition['connections'],
    ui: effectData.ui as EffectDefinition['ui'],
    metadata: {
      createdAt: new Date().toISOString(),
      generationTimeMs,
      aiModel: 'claude-sonnet-4-20250514',
    },
  }

  return { effect, generationTimeMs }
}
