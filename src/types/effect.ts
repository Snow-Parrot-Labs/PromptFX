// DSP Node Types
export type DSPNodeType =
  | 'input'
  | 'output'
  | 'delay'
  | 'freeverb'
  | 'filter'
  | 'distortion'
  | 'gain'
  | 'compressor'
  | 'chorus'
  | 'tremolo'
  | 'phaser'
  | 'pitchShift'
  | 'autoFilter'
  | 'autoPanner'
  | 'stereoWidener'
  | 'autoWah'

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

// Position (percentage-based for absolute positioning)
export interface Position {
  x: number // 0-100%
  y: number // 0-100%
}

// Panel Design (rack unit styling)
export interface PanelDesign {
  rackUnits: 1 | 2
  primaryColor: string
  accentColor: string
  textColor: string
}

// Control Style (visual styling for controls)
export type ControlColorTheme = 'amber' | 'cyan' | 'green' | 'red' | 'white' | 'purple'
export type ControlSize = 'sm' | 'md' | 'lg'
export type IndicatorStyle = 'line' | 'dot' | 'arc'

export interface ControlStyle {
  color?: ControlColorTheme
  size?: ControlSize
  indicator?: IndicatorStyle
}

// Artwork Elements
export type ArtworkElementType = 'gradient' | 'stripe' | 'glow' | 'line' | 'circle' | 'rect'

export interface GradientElement {
  type: 'gradient'
  colors: string[]
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial'
}

export interface StripeElement {
  type: 'stripe'
  position: { x: number; y: number; width: number; height: number }
  color: string
}

export interface GlowElement {
  type: 'glow'
  position: Position
  color: string
  radius: number
  opacity: number
}

export interface LineElement {
  type: 'line'
  from: Position
  to: Position
  color: string
  thickness: number
}

export interface CircleElement {
  type: 'circle'
  position: Position
  radius: number
  color: string
  filled?: boolean
}

export interface RectElement {
  type: 'rect'
  position: { x: number; y: number; width: number; height: number }
  color: string
  borderRadius?: number
}

export type ArtworkElement =
  | GradientElement
  | StripeElement
  | GlowElement
  | LineElement
  | CircleElement
  | RectElement

// Brand Label (effect name styling)
export type LabelStyle = 'engraved' | 'embossed' | 'chrome' | 'neon'

export interface BrandLabel {
  text: string
  position: Position
  style: LabelStyle
}

// Artwork Definition
export interface Artwork {
  background?: GradientElement
  backgroundImage?: string // Base64 data URL from AI image generation
  elements?: ArtworkElement[]
  brandLabel?: BrandLabel
}

// Decoration Types (LEDs, meters, labels)
export type DecorationLEDColor = 'green' | 'amber' | 'red' | 'blue' | 'cyan' | 'purple' | 'white'

export interface LEDDecoration {
  type: 'led'
  position: Position
  color: DecorationLEDColor
}

export interface VUMeterDecoration {
  type: 'vuMeter'
  position: Position
  segments: number
  orientation?: 'horizontal' | 'vertical'
}

export interface LabelDecoration {
  type: 'label'
  position: Position
  text: string
  size?: 'xs' | 'sm' | 'md'
}

export type Decoration = LEDDecoration | VUMeterDecoration | LabelDecoration

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
  // New creative positioning/styling fields (optional for backwards compat)
  position?: Position
  style?: ControlStyle
}

export interface UIDefinition {
  layout: 'horizontal' | 'vertical' | 'grid' | 'absolute'
  controls: UIControl[]
  // New creative GUI fields (optional for backwards compat)
  panelDesign?: PanelDesign
  artwork?: Artwork
  decorations?: Decoration[]
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
