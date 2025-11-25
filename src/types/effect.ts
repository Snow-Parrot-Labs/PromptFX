// DSP Node Types
export type DSPNodeType =
  | 'input'
  | 'output'
  | 'delay'
  | 'reverb'
  | 'filter'
  | 'distortion'
  | 'gain'
  | 'compressor'
  | 'chorus'
  | 'tremolo'
  | 'panner'

export type FilterType = 'lowpass' | 'highpass' | 'bandpass' | 'notch'
export type DistortionType = 'soft' | 'hard' | 'foldback' | 'bitcrush'
export type WaveShape = 'sine' | 'square' | 'triangle'
export type ParameterCurve = 'linear' | 'exponential' | 'logarithmic'

// DSP Node Definition
export interface DSPNode {
  id: string
  type: DSPNodeType
  params: Record<string, number | string | undefined>
}

// Connection between nodes
export interface Connection {
  from: { nodeId: string; output?: number }
  to: { nodeId: string; input?: number }
}

// UI Control Types
export type UIControlType = 'knob' | 'slider' | 'button' | 'switch' | 'select'

export interface ControlBinding {
  nodeId: string
  param: string
}

export interface KnobConfig {
  min: number
  max: number
  default: number
  step?: number
  unit?: string
  curve?: ParameterCurve
}

export interface SliderConfig {
  min: number
  max: number
  default: number
  step?: number
  unit?: string
  orientation?: 'horizontal' | 'vertical'
}

export interface SwitchConfig {
  default: boolean
  onLabel?: string
  offLabel?: string
}

export interface ButtonConfig {
  label: string
  momentary?: boolean
}

export interface SelectConfig {
  options: { value: string; label: string }[]
  default: string
}

export type ControlConfig = KnobConfig | SliderConfig | SwitchConfig | ButtonConfig | SelectConfig

export interface UIControl {
  id: string
  type: UIControlType
  label: string
  binding: ControlBinding
  config: ControlConfig
}

export interface UIDefinition {
  layout: 'horizontal' | 'vertical' | 'grid'
  controls: UIControl[]
}

// Effect Metadata
export interface EffectMetadata {
  createdAt: string
  generationTimeMs: number
  aiModel: string
}

// Complete Effect Definition
export interface EffectDefinition {
  id: string
  name: string
  description: string
  prompt: string
  version: string
  nodes: DSPNode[]
  connections: Connection[]
  ui: UIDefinition
  metadata: EffectMetadata
}

// Preset (saved effect with parameter values)
export interface Preset {
  id: string
  name: string
  effectDefinition: EffectDefinition
  parameterValues: Record<string, number | string | boolean>
  createdAt: string
  updatedAt: string
}
