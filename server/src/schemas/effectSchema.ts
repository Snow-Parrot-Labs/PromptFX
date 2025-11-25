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
})

// UI Definition
export const uiDefinitionSchema = z.object({
  layout: z.enum(['horizontal', 'vertical', 'grid']),
  controls: z.array(uiControlSchema),
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
