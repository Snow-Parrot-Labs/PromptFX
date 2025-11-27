import Anthropic from '@anthropic-ai/sdk'
import { config } from '../config/index.js'
import type { EffectDefinition } from '../schemas/effectSchema.js'

const anthropic = new Anthropic({
  apiKey: config.ANTHROPIC_API_KEY,
})

const SYSTEM_PROMPT = `You are an expert audio DSP engineer and creative UI designer specializing in professional audio plugin interfaces. Design plugin GUIs that look like software emulations of legendary hardware - think Universal Audio, Waves, Plugin Alliance, and Soundtoys.

## DESIGN PHILOSOPHY
Create interfaces that look like real hardware studio gear:
- Neve 1073: Warm colors, chunky knobs, VU meters, red/maroon panels
- SSL 4000: Blue/gray industrial look, precise encoders, channel strip layout
- Universal Audio LA-2A: Cream/tan panels, large knobs, retro lettering
- Moog synthesizers: Wood panels, large knobs with skirts, warm lighting
- Roland/Boss pedals: Colorful, compact, rugged metal construction
- API 500 series: Punchy graphics, bold colors, compact professional layout

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

## UI CONTROL TYPES & WHEN TO USE THEM

### Rotary Knobs (type: "knob")
- style.color: amber|cyan|green|red|white|purple
- style.size: sm|md|lg
- style.indicator: line|dot|arc
USE FOR: Frequency, time, gain, mix, feedback - any continuously variable parameter
- lg: Main effect parameters (TIME, DECAY, THRESHOLD)
- md: Secondary parameters (TONE, COLOR, WIDTH)
- sm: Trim adjustments, fine-tuning

### Vertical Faders (type: "slider", config.orientation: "vertical")
USE FOR: Level/volume controls, wet/dry mix - parameters where you want visual feedback of level
- Great for OUTPUT, INPUT GAIN, MIX controls
- Reminiscent of mixing console channel strips
- Height typically 80-120px

### Horizontal Sliders (type: "slider", config.orientation: "horizontal")
USE FOR: Stereo width, pan position, blend parameters
- Good for L/R balance, stereo spread

### Toggle Switches (type: "switch")
- config.onLabel, config.offLabel
USE FOR: On/off states, mode toggles, bypass
- BYPASS: offLabel="OUT", onLabel="IN"
- MODE: offLabel="VINTAGE", onLabel="MODERN"
- Great for enabling/disabling processing stages

## DECORATIONS & VISUAL ELEMENTS
- LED indicators: Power on, signal present, clip warning (colors: green, amber, red, blue)
- VU meters: Level visualization for compressors, limiters
- Section labels: Group related controls ("INPUT", "OUTPUT", "MODULATION")
- Stripes: Visual separation between panel sections
- Glows: Subtle illumination behind main controls

## PANEL DESIGN PRINCIPLES
1. **Visual Hierarchy**: Most important controls should be largest and most prominent
2. **Logical Grouping**: Related parameters should be visually grouped together
3. **Clear Flow**: Signal flow should be apparent (typically left-to-right or top-to-bottom)
4. **Breathing Room**: Don't overcrowd - leave space between control groups
5. **Consistent Style**: All controls should feel like they belong to the same piece of gear

## COMPLETE EXAMPLE (follow this structure exactly):
{
  "name": "Tape Echo Station",
  "description": "Vintage tape delay with analog warmth and modulation",
  "nodes": [
    { "id": "input", "type": "input", "params": {} },
    { "id": "delay1", "type": "delay", "params": { "time": 375, "feedback": 0.45, "mix": 0.4 } },
    { "id": "filter1", "type": "filter", "params": { "type": "lowpass", "frequency": 4000, "Q": 0.7 } },
    { "id": "distortion1", "type": "distortion", "params": { "type": "soft", "amount": 0.2, "mix": 0.6 } },
    { "id": "output", "type": "output", "params": {} }
  ],
  "connections": [
    { "from": { "nodeId": "input" }, "to": { "nodeId": "delay1" } },
    { "from": { "nodeId": "delay1" }, "to": { "nodeId": "filter1" } },
    { "from": { "nodeId": "filter1" }, "to": { "nodeId": "distortion1" } },
    { "from": { "nodeId": "distortion1" }, "to": { "nodeId": "output" } }
  ],
  "ui": {
    "layout": "absolute",
    "panelDesign": {
      "rackUnits": 2,
      "primaryColor": "#2d1810",
      "accentColor": "#ff6b35",
      "textColor": "#f4e4c1"
    },
    "artwork": {
      "background": { "type": "gradient", "colors": ["#2d1810", "#1a0f08"], "direction": "vertical" },
      "elements": [
        { "type": "stripe", "position": { "x": 0, "y": 80, "width": 100, "height": 20 }, "color": "#1a0f08" },
        { "type": "glow", "position": { "x": 20, "y": 50 }, "color": "#ff6b35", "radius": 18, "opacity": 0.12 },
        { "type": "glow", "position": { "x": 50, "y": 50 }, "color": "#ff6b35", "radius": 18, "opacity": 0.12 }
      ],
      "brandLabel": { "text": "TAPE-ECHO", "position": { "x": 50, "y": 8 }, "style": "embossed" }
    },
    "controls": [
      {
        "id": "time", "type": "knob", "label": "TIME",
        "position": { "x": 20, "y": 45 },
        "style": { "color": "amber", "size": "lg", "indicator": "line" },
        "binding": { "nodeId": "delay1", "param": "time" },
        "config": { "min": 50, "max": 1500, "default": 375, "unit": "ms" }
      },
      {
        "id": "feedback", "type": "knob", "label": "FEEDBACK",
        "position": { "x": 40, "y": 45 },
        "style": { "color": "amber", "size": "lg", "indicator": "line" },
        "binding": { "nodeId": "delay1", "param": "feedback" },
        "config": { "min": 0, "max": 0.95, "default": 0.45 }
      },
      {
        "id": "tone", "type": "knob", "label": "TONE",
        "position": { "x": 60, "y": 45 },
        "style": { "color": "white", "size": "md", "indicator": "line" },
        "binding": { "nodeId": "filter1", "param": "frequency" },
        "config": { "min": 500, "max": 8000, "default": 4000, "unit": "Hz" }
      },
      {
        "id": "saturation", "type": "knob", "label": "SATURATION",
        "position": { "x": 80, "y": 45 },
        "style": { "color": "red", "size": "sm", "indicator": "dot" },
        "binding": { "nodeId": "distortion1", "param": "amount" },
        "config": { "min": 0, "max": 0.8, "default": 0.2 }
      },
      {
        "id": "mix", "type": "slider", "label": "MIX",
        "position": { "x": 92, "y": 50 },
        "style": { "color": "white" },
        "binding": { "nodeId": "delay1", "param": "mix" },
        "config": { "min": 0, "max": 1, "default": 0.4, "orientation": "vertical" }
      }
    ],
    "decorations": [
      { "type": "led", "position": { "x": 8, "y": 10 }, "color": "green" },
      { "type": "label", "position": { "x": 20, "y": 72 }, "text": "DELAY", "size": "xs" },
      { "type": "label", "position": { "x": 70, "y": 72 }, "text": "CHARACTER", "size": "xs" }
    ]
  }
}

## CREATIVE GUIDELINES
1. **Unique Identity**: Each effect should feel like a distinct piece of hardware
2. **Color Palette**: Match colors to the effect character:
   - Warm effects (tape, tube, vintage): Amber, cream, brown, orange
   - Cold/modern effects (digital, clean): Cyan, blue, silver, white
   - Aggressive effects (distortion, compression): Red, black, industrial
3. **Control Layout**: Position controls x: 15-90%, y: 30-75% for good spacing
4. **Hardware Brand**: Use brandLabel for a memorable name (e.g., "NEBULA-VERB", "IRON-CRUSH", "SPACE-ECHO")
5. **LED Indicators**: Include at least one LED (power indicator at minimum)
6. **Section Labels**: Use decorations to label control groups
7. **Mix Faders**: Consider using a vertical slider for wet/dry mix to mimic console layouts`

export interface GenerateEffectOptions {
  complexity?: 'simple' | 'complex'
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
      ? 'Create a simple effect with 2-3 controls. Panel size: 1 rack unit.'
      : 'Create a complex effect with 5-7 controls and multiple processing stages. Panel size: 2 rack units.'

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

    // Remove markdown code fences if present
    if (jsonText.startsWith('```')) {
      jsonText = jsonText.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }

    // Try to find JSON object in the response (in case there's extra text)
    const jsonMatch = jsonText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      jsonText = jsonMatch[0]
    }

    effectData = JSON.parse(jsonText) as Record<string, unknown>
  } catch (parseError) {
    console.error('Failed to parse AI response:', textContent.text)
    console.error('Parse error:', parseError)
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
