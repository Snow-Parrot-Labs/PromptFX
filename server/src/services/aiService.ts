import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config/index.js'
import type { EffectDefinition } from '../schemas/effectSchema.js'

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert audio DSP engineer and UI designer. Your task is to generate audio effect definitions based on user descriptions.

You must respond with a valid JSON object that defines an audio effect with:
1. DSP processing nodes and their connections
2. UI controls (knobs, sliders, switches, selects) that map to node parameters

Available DSP node types:
- input: Audio input (required, exactly one)
- output: Audio output (required, exactly one)
- delay: Delay effect (params: time 0-2000ms, feedback 0-1, mix 0-1)
- reverb: Reverb effect (params: decay 0.1-10s, preDelay 0-100ms, mix 0-1)
- filter: Filter effect (params: type lowpass|highpass|bandpass|notch, frequency 20-20000Hz, Q 0.1-20)
- distortion: Distortion effect (params: type soft|hard|foldback|bitcrush, amount 0-1, mix 0-1)
- gain: Volume control (params: gain -60 to +12 dB)
- compressor: Dynamics (params: threshold -60 to 0dB, ratio 1-20, attack 0-1000ms, release 0-3000ms)
- chorus: Modulation (params: rate 0.1-10Hz, depth 0-1, mix 0-1)
- tremolo: Amplitude modulation (params: rate 0.1-20Hz, depth 0-1, shape sine|square|triangle)
- panner: Stereo panning (params: pan -1 to 1)

UI control types:
- knob: Rotary control with min/max/default/step/unit/curve(linear|exponential|logarithmic)
- slider: Linear control with min/max/default/step/unit/orientation(horizontal|vertical)
- switch: Toggle with default boolean, onLabel, offLabel
- select: Dropdown with options array [{value, label}] and default

Response format (JSON only, no markdown):
{
  "name": "Effect Name",
  "description": "Brief description of what this effect does",
  "nodes": [
    { "id": "input", "type": "input", "params": {} },
    { "id": "uniqueId", "type": "nodeType", "params": { "paramName": defaultValue } },
    { "id": "output", "type": "output", "params": {} }
  ],
  "connections": [
    { "from": { "nodeId": "input" }, "to": { "nodeId": "nextNode" } },
    { "from": { "nodeId": "lastProcessingNode" }, "to": { "nodeId": "output" } }
  ],
  "ui": {
    "layout": "horizontal",
    "controls": [
      {
        "id": "controlId",
        "type": "knob",
        "label": "Control Label",
        "binding": { "nodeId": "targetNode", "param": "paramName" },
        "config": { "min": 0, "max": 100, "default": 50, "unit": "%" }
      }
    ]
  }
}

Guidelines:
- Always include exactly one input and one output node
- Create logical signal flow from input to output
- Include 3-6 UI controls for moderate complexity
- Use appropriate parameter ranges for each node type
- Make controls intuitive and musical
- Name controls clearly (e.g., "Delay Time", "Feedback", "Mix")
- Use exponential curves for frequency controls, linear for most others`

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
