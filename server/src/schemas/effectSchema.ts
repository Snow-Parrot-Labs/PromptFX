import { z } from 'zod'

// DSP Node Types
export const dspNodeTypeSchema = z.enum([
  'input',
  'output',
  'delay',
  'reverb',
  'filter',
  'distortion',
  'gain',
  'compressor',
  'chorus',
  'tremolo',
  'panner',
])

export const filterTypeSchema = z.enum(['lowpass', 'highpass', 'bandpass', 'notch'])
export const distortionTypeSchema = z.enum(['soft', 'hard', 'foldback', 'bitcrush'])
export const waveShapeSchema = z.enum(['sine', 'square', 'triangle'])
export const parameterCurveSchema = z.enum(['linear', 'exponential', 'logarithmic'])

// DSP Node
export const dspNodeSchema = z.object({
  id: z.string().min(1),
  type: dspNodeTypeSchema,
  params: z.record(z.union([z.number(), z.string()])),
})

// Connection
export const connectionSchema = z.object({
  from: z.object({
    nodeId: z.string(),
    output: z.number().optional(),
  }),
  to: z.object({
    nodeId: z.string(),
    input: z.number().optional(),
  }),
})

// Position (percentage-based for absolute positioning)
export const positionSchema = z.object({
  x: z.number().min(0).max(100),
  y: z.number().min(0).max(100),
})

// Panel Design (rack unit styling)
export const panelDesignSchema = z.object({
  rackUnits: z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4)]),
  primaryColor: z.string(),
  accentColor: z.string(),
  textColor: z.string(),
})

// Control Style
export const controlColorThemeSchema = z.enum(['amber', 'cyan', 'green', 'red', 'white', 'purple'])
export const controlSizeSchema = z.enum(['sm', 'md', 'lg'])
export const indicatorStyleSchema = z.enum(['line', 'dot', 'arc'])

export const controlStyleSchema = z.object({
  color: controlColorThemeSchema.optional(),
  size: controlSizeSchema.optional(),
  indicator: indicatorStyleSchema.optional(),
})

// Artwork Elements
export const gradientElementSchema = z.object({
  type: z.literal('gradient'),
  colors: z.array(z.string()).min(2),
  direction: z.enum(['horizontal', 'vertical', 'diagonal', 'radial']),
})

export const stripeElementSchema = z.object({
  type: z.literal('stripe'),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  color: z.string(),
})

export const glowElementSchema = z.object({
  type: z.literal('glow'),
  position: positionSchema,
  color: z.string(),
  radius: z.number(),
  opacity: z.number().min(0).max(1),
})

export const lineElementSchema = z.object({
  type: z.literal('line'),
  from: positionSchema,
  to: positionSchema,
  color: z.string(),
  thickness: z.number().min(1),
})

export const circleElementSchema = z.object({
  type: z.literal('circle'),
  position: positionSchema,
  radius: z.number(),
  color: z.string(),
  filled: z.boolean().optional(),
})

export const rectElementSchema = z.object({
  type: z.literal('rect'),
  position: z.object({
    x: z.number(),
    y: z.number(),
    width: z.number(),
    height: z.number(),
  }),
  color: z.string(),
  borderRadius: z.number().optional(),
})

export const artworkElementSchema = z.discriminatedUnion('type', [
  gradientElementSchema,
  stripeElementSchema,
  glowElementSchema,
  lineElementSchema,
  circleElementSchema,
  rectElementSchema,
])

// Brand Label
export const labelStyleSchema = z.enum(['engraved', 'embossed', 'chrome', 'neon'])

export const brandLabelSchema = z.object({
  text: z.string(),
  position: positionSchema,
  style: labelStyleSchema,
})

// Artwork Definition
export const artworkSchema = z.object({
  background: gradientElementSchema.optional(),
  elements: z.array(artworkElementSchema).optional(),
  brandLabel: brandLabelSchema.optional(),
})

// Decoration Types
export const ledColorSchema = z.enum(['green', 'amber', 'red', 'blue'])

export const ledDecorationSchema = z.object({
  type: z.literal('led'),
  position: positionSchema,
  color: ledColorSchema,
})

export const vuMeterDecorationSchema = z.object({
  type: z.literal('vuMeter'),
  position: positionSchema,
  segments: z.number().min(3).max(12),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
})

export const labelDecorationSchema = z.object({
  type: z.literal('label'),
  position: positionSchema,
  text: z.string(),
  size: z.enum(['xs', 'sm', 'md']).optional(),
})

export const decorationSchema = z.discriminatedUnion('type', [
  ledDecorationSchema,
  vuMeterDecorationSchema,
  labelDecorationSchema,
])

// UI Control Configs
export const knobConfigSchema = z.object({
  min: z.number(),
  max: z.number(),
  default: z.number(),
  step: z.number().optional(),
  unit: z.string().optional(),
  curve: parameterCurveSchema.optional(),
})

export const sliderConfigSchema = z.object({
  min: z.number(),
  max: z.number(),
  default: z.number(),
  step: z.number().optional(),
  unit: z.string().optional(),
  orientation: z.enum(['horizontal', 'vertical']).optional(),
})

export const switchConfigSchema = z.object({
  default: z.boolean(),
  onLabel: z.string().optional(),
  offLabel: z.string().optional(),
})

export const selectConfigSchema = z.object({
  options: z.array(z.object({ value: z.string(), label: z.string() })),
  default: z.string(),
})

// UI Control
export const uiControlSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['knob', 'slider', 'button', 'switch', 'select']),
  label: z.string().min(1),
  binding: z.object({
    nodeId: z.string(),
    param: z.string(),
  }),
  config: z.union([knobConfigSchema, sliderConfigSchema, switchConfigSchema, selectConfigSchema]),
  // New creative positioning/styling fields (optional for backwards compat)
  position: positionSchema.optional(),
  style: controlStyleSchema.optional(),
})

// UI Definition
export const uiDefinitionSchema = z.object({
  layout: z.enum(['horizontal', 'vertical', 'grid', 'absolute']),
  controls: z.array(uiControlSchema),
  // New creative GUI fields (optional for backwards compat)
  panelDesign: panelDesignSchema.optional(),
  artwork: artworkSchema.optional(),
  decorations: z.array(decorationSchema).optional(),
})

// Complete Effect Definition
export const effectDefinitionSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1).max(100),
  description: z.string().max(500),
  prompt: z.string(),
  version: z.string(),
  nodes: z.array(dspNodeSchema).min(2), // At least input and output
  connections: z.array(connectionSchema),
  ui: uiDefinitionSchema,
  metadata: z.object({
    createdAt: z.string(),
    generationTimeMs: z.number(),
    aiModel: z.string(),
  }),
})

// Type exports
export type DSPNodeType = z.infer<typeof dspNodeTypeSchema>
export type DSPNode = z.infer<typeof dspNodeSchema>
export type Connection = z.infer<typeof connectionSchema>
export type UIControl = z.infer<typeof uiControlSchema>
export type UIDefinition = z.infer<typeof uiDefinitionSchema>
export type EffectDefinition = z.infer<typeof effectDefinitionSchema>
