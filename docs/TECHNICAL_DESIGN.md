# PromptFX - Technical Design Document

## Table of Contents
1. [System Architecture](#system-architecture)
2. [Frontend Architecture](#frontend-architecture)
3. [Backend Architecture](#backend-architecture)
4. [AI Pipeline](#ai-pipeline)
5. [Audio Engine](#audio-engine)
6. [Data Schemas](#data-schemas)
7. [API Specification](#api-specification)
8. [Security Considerations](#security-considerations)
9. [Performance Requirements](#performance-requirements)
10. [Development Phases](#development-phases)

---

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   React UI  │  │  Audio      │  │   Web Audio API         │  │
│  │  Components │◄─┤  State      │◄─┤   + Tone.js             │  │
│  │             │  │  Manager    │  │   (DSP Processing)      │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                      ▲                │
│         ▼                                      │                │
│  ┌─────────────────────────────────────────────┴───────────────┐│
│  │                    Effect Renderer                          ││
│  │         (Interprets JSON → Builds Audio Graph + UI)         ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS/WSS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         SERVER (Node.js)                        │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Express   │  │   Effect    │  │   AI Service            │  │
│  │   API       │◄─┤   Generator │◄─┤   (Claude/GPT)          │  │
│  │             │  │   Service   │  │                         │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
│         │                                                       │
│         ▼                                                       │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              File Storage (Audio Uploads)                   ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Frontend Framework | React 18+ | Component model, hooks, ecosystem |
| State Management | Zustand | Lightweight, simple API, good for audio state |
| Audio Processing | Web Audio API + Tone.js | Industry standard, low-latency, rich DSP |
| UI Controls | Custom + Radix UI | Accessible primitives, custom audio controls |
| Styling | Tailwind CSS | Rapid prototyping, consistent design |
| Backend Runtime | Node.js 20+ | JavaScript consistency, async I/O |
| API Framework | Express.js | Simple, well-documented, middleware ecosystem |
| AI Integration | Anthropic Claude API | Strong reasoning, structured output |
| File Handling | Multer + FFmpeg | Robust upload handling, format conversion |
| Hosting | Vercel | Frontend + serverless backend |
| Build Tool | Vite | Fast HMR, optimized builds |

---

## Frontend Architecture

### Directory Structure

```
src/
├── components/
│   ├── ui/                    # Generic UI components
│   │   ├── Button.tsx
│   │   ├── Slider.tsx
│   │   ├── Knob.tsx
│   │   ├── Switch.tsx
│   │   └── Meter.tsx
│   ├── audio/                 # Audio-specific components
│   │   ├── Waveform.tsx
│   │   ├── Transport.tsx
│   │   ├── FileUploader.tsx
│   │   └── LiveInput.tsx
│   ├── effect/                # Effect GUI components
│   │   ├── EffectPanel.tsx
│   │   ├── ControlRenderer.tsx
│   │   └── EffectHeader.tsx
│   └── prompt/                # Prompt input components
│       ├── PromptInput.tsx
│       └── PromptSuggestions.tsx
├── hooks/
│   ├── useAudioEngine.ts
│   ├── useEffectControls.ts
│   ├── useLiveInput.ts
│   └── usePresets.ts
├── stores/
│   ├── audioStore.ts          # Audio playback state
│   ├── effectStore.ts         # Current effect definition
│   └── uiStore.ts             # UI state (loading, errors)
├── services/
│   ├── api.ts                 # Backend API calls
│   ├── audioEngine.ts         # Web Audio / Tone.js wrapper
│   └── effectBuilder.ts       # JSON → Audio Graph builder
├── types/
│   ├── effect.ts              # Effect schema types
│   ├── audio.ts               # Audio-related types
│   └── api.ts                 # API request/response types
├── utils/
│   ├── audioUtils.ts
│   └── parameterMapping.ts
├── App.tsx
└── main.tsx
```

### Component Hierarchy

```
App
├── Header
│   └── Logo, Navigation
├── PromptSection
│   ├── PromptInput
│   ├── GenerateButton
│   └── PromptSuggestions
├── EffectSection
│   ├── EffectHeader (name, description, regenerate)
│   ├── EffectPanel
│   │   └── ControlRenderer (maps JSON → Knob/Slider/Switch)
│   └── PresetControls (save, load, export)
├── AudioSection
│   ├── SourceSelector (file/live toggle)
│   ├── FileUploader
│   ├── LiveInputControls
│   ├── Waveform
│   ├── Transport (play, pause, stop)
│   └── OutputControls (download, A/B compare)
└── Footer
```

### State Management (Zustand)

```typescript
// stores/effectStore.ts
interface EffectState {
  definition: EffectDefinition | null;
  isGenerating: boolean;
  error: string | null;

  // Actions
  generateEffect: (prompt: string) => Promise<void>;
  updateParameter: (paramId: string, value: number) => void;
  clearEffect: () => void;
}

// stores/audioStore.ts
interface AudioState {
  source: 'file' | 'live' | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  inputLevel: number;
  outputLevel: number;
  bypassEffect: boolean;

  // Actions
  loadFile: (file: File) => Promise<void>;
  enableLiveInput: () => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (time: number) => void;
  toggleBypass: () => void;
}
```

### Custom Audio Controls

#### Knob Component
```typescript
interface KnobProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  onChange: (value: number) => void;
  size?: 'sm' | 'md' | 'lg';
}
```

Implementation approach:
- Canvas-based rendering for smooth rotation
- Mouse drag (vertical) for value changes
- Double-click to reset to default
- Keyboard support (arrow keys, page up/down)
- Touch support for future mobile

#### Slider Component
```typescript
interface SliderProps {
  value: number;
  min: number;
  max: number;
  step?: number;
  label: string;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
  onChange: (value: number) => void;
}
```

---

## Backend Architecture

### Directory Structure

```
server/
├── src/
│   ├── controllers/
│   │   ├── effectController.ts
│   │   ├── audioController.ts
│   │   └── presetController.ts
│   ├── services/
│   │   ├── aiService.ts
│   │   ├── effectGeneratorService.ts
│   │   └── audioProcessingService.ts
│   ├── middleware/
│   │   ├── errorHandler.ts
│   │   ├── rateLimiter.ts
│   │   └── validator.ts
│   ├── schemas/
│   │   ├── effectSchema.ts
│   │   └── promptSchema.ts
│   ├── utils/
│   │   ├── promptTemplates.ts
│   │   └── schemaValidator.ts
│   ├── routes/
│   │   └── index.ts
│   ├── config/
│   │   └── index.ts
│   └── app.ts
├── uploads/                   # Temporary audio file storage
└── package.json
```

### API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/effects/generate` | Generate effect from prompt |
| POST | `/api/effects/validate` | Validate effect definition |
| POST | `/api/audio/upload` | Upload audio file |
| GET | `/api/audio/:id` | Retrieve uploaded audio |
| POST | `/api/audio/process` | Server-side audio processing |
| GET | `/api/presets` | List example presets |

---

## AI Pipeline

### Prompt Engineering Strategy

The AI receives a structured system prompt that:
1. Defines available DSP nodes and their parameters
2. Specifies the output JSON schema
3. Provides examples of good effect designs
4. Includes constraints (valid ranges, node compatibility)

### System Prompt Template

```
You are an audio effect designer. Given a user's description, generate a JSON
definition for an audio effect including the DSP processing graph and UI controls.

## Available DSP Nodes

### Delay
- delayTime: 0-5000ms
- feedback: 0-1
- wetDry: 0-1

### Freeverb
- roomSize: 0-1
- dampening: 500-10000Hz
- wetDry: 0-1

### Filter
- type: lowpass | highpass | bandpass | notch
- frequency: 20-20000Hz
- Q: 0.1-20
- gain: -24 to +24dB (for shelving)

### Distortion
- amount: 0-1
- type: soft | hard | foldback | bitcrush
- tone: 200-8000Hz

### Gain
- level: -60 to +12dB

### Compressor
- threshold: -60 to 0dB
- ratio: 1-20
- attack: 0.1-100ms
- release: 10-1000ms

### Chorus
- rate: 0.1-10Hz
- depth: 0-1
- wetDry: 0-1

### Tremolo
- rate: 0.1-20Hz
- depth: 0-1
- shape: sine | square | triangle

### Phaser
- rate: 0.1-10Hz
- octaves: 1-8
- baseFrequency: 50-1000Hz
- Q: 1-20
- wetDry: 0-1

### PitchShift
- pitch: -12 to 12 semitones
- windowSize: 0.01-0.5
- delayTime: 0-0.1
- wetDry: 0-1

### AutoFilter
- rate: 0.1-20Hz
- depth: 0-1
- baseFrequency: 50-2000Hz
- octaves: 1-6
- shape: sine | square | triangle
- wetDry: 0-1

### AutoPanner
- rate: 0.1-20Hz
- depth: 0-1
- shape: sine | square | triangle
- wetDry: 0-1

### StereoWidener
- width: 0-1 (0=mono, 1=wide)

### AutoWah
- baseFrequency: 50-500Hz
- octaves: 1-8
- sensitivity: -40 to 0dB
- Q: 1-10
- gain: 0-10
- wetDry: 0-1

## Output Format

Return valid JSON matching this schema:
{
  "name": "Effect Name",
  "nodes": [...],
  "connections": [...],
  "ui": { "controls": [...] }
}

## Guidelines
- Create intuitive control names
- Group related parameters
- Use appropriate control types (knob for freq/time, slider for mix/amount)
- Provide sensible default values
- Keep the effect focused - don't over-complicate
```

### Generation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  User Prompt │────▶│  AI Service  │────▶│   Validate   │
└──────────────┘     └──────────────┘     └──────────────┘
                                                  │
                     ┌──────────────┐              │
                     │   Return to  │◀─────────────┘
                     │   Frontend   │    (valid JSON)
                     └──────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │ Build Audio  │
                     │ Graph + UI   │
                     └──────────────┘
```

### Validation Layer

```typescript
// Validate AI output before sending to client
function validateEffectDefinition(def: unknown): EffectDefinition {
  // 1. Schema validation (Zod)
  const parsed = effectSchema.parse(def);

  // 2. Semantic validation
  validateNodeConnections(parsed.nodes, parsed.connections);
  validateParameterRanges(parsed.nodes);
  validateUIControlBindings(parsed.ui, parsed.nodes);

  // 3. Safety checks
  ensureNoFeedbackLoops(parsed.connections);
  ensureReasonableDefaults(parsed.nodes);

  return parsed;
}
```

---

## Audio Engine

### Architecture

```typescript
class AudioEngine {
  private context: AudioContext;
  private inputNode: MediaStreamAudioSourceNode | AudioBufferSourceNode | null;
  private outputNode: GainNode;
  private effectChain: Map<string, AudioNode>;
  private analyser: AnalyserNode;

  // Core methods
  async initialize(): Promise<void>;
  async loadAudioFile(file: File): Promise<AudioBuffer>;
  async enableLiveInput(): Promise<void>;

  // Effect management
  buildEffectGraph(definition: EffectDefinition): void;
  updateParameter(nodeId: string, param: string, value: number): void;
  bypass(enabled: boolean): void;

  // Playback
  play(): void;
  pause(): void;
  stop(): void;
  seek(time: number): void;

  // Analysis
  getInputLevel(): number;
  getOutputLevel(): number;
  getWaveformData(): Float32Array;
}
```

### DSP Node Mapping

```typescript
// Map JSON node definitions to Tone.js / Web Audio nodes
const nodeFactories: Record<string, NodeFactory> = {
  delay: (params) => new Tone.FeedbackDelay({
    delayTime: params.delayTime / 1000,
    feedback: params.feedback,
    wet: params.wetDry
  }),

  reverb: (params) => new Tone.Reverb({
    decay: params.decay,
    preDelay: params.preDelay / 1000,
    wet: params.wetDry
  }),

  filter: (params) => new Tone.Filter({
    type: params.type,
    frequency: params.frequency,
    Q: params.Q
  }),

  distortion: (params) => {
    if (params.type === 'bitcrush') {
      return new Tone.BitCrusher({ bits: Math.floor((1 - params.amount) * 7) + 1 });
    }
    return new Tone.Distortion({ distortion: params.amount });
  },

  // ... more node types
};
```

### Real-time Parameter Updates

```typescript
// Efficient parameter updates without rebuilding graph
function updateParameter(nodeId: string, param: string, value: number): void {
  const node = this.effectChain.get(nodeId);
  if (!node) return;

  // Use Tone.js signal ramping for smooth transitions
  if (node[param] instanceof Tone.Signal) {
    node[param].rampTo(value, 0.01); // 10ms ramp
  } else {
    node[param] = value;
  }
}
```

### Latency Management

```typescript
// Configure for low-latency live input
const audioContext = new AudioContext({
  latencyHint: 'interactive',  // Request low latency
  sampleRate: 44100
});

// Monitor actual latency
console.log('Base latency:', audioContext.baseLatency);
console.log('Output latency:', audioContext.outputLatency);
```

---

## Data Schemas

### Effect Definition (Complete)

```typescript
interface EffectDefinition {
  id: string;
  name: string;
  description: string;
  prompt: string;  // Original user prompt
  version: string;

  nodes: DSPNode[];
  connections: Connection[];
  ui: UIDefinition;

  metadata: {
    createdAt: string;
    generationTimeMs: number;
    aiModel: string;
  };
}

interface DSPNode {
  id: string;
  type: DSPNodeType;
  params: Record<string, number | string>;
}

type DSPNodeType =
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
  | 'autoWah';

interface Connection {
  from: { nodeId: string; output?: number };
  to: { nodeId: string; input?: number };
}

interface UIDefinition {
  layout: 'horizontal' | 'vertical' | 'grid';
  controls: UIControl[];
}

interface UIControl {
  id: string;
  type: 'knob' | 'slider' | 'button' | 'switch' | 'select';
  label: string;
  binding: {
    nodeId: string;
    param: string;
  };
  config: KnobConfig | SliderConfig | ButtonConfig | SwitchConfig | SelectConfig;
}

interface KnobConfig {
  min: number;
  max: number;
  default: number;
  step?: number;
  unit?: string;
  curve?: 'linear' | 'exponential' | 'logarithmic';
}

interface SliderConfig {
  min: number;
  max: number;
  default: number;
  step?: number;
  unit?: string;
  orientation?: 'horizontal' | 'vertical';
}

interface SwitchConfig {
  default: boolean;
  onLabel?: string;
  offLabel?: string;
}

interface SelectConfig {
  options: { value: string; label: string }[];
  default: string;
}
```

### Preset Schema

```typescript
interface Preset {
  id: string;
  name: string;
  effectDefinition: EffectDefinition;
  parameterValues: Record<string, number | string | boolean>;
  createdAt: string;
  updatedAt: string;
}
```

---

## API Specification

### POST /api/effects/generate

**Request:**
```typescript
{
  prompt: string;        // User's effect description
  options?: {
    complexity?: 'simple' | 'moderate' | 'complex';
    style?: string;      // e.g., "vintage", "modern", "experimental"
  }
}
```

**Response (Success):**
```typescript
{
  success: true;
  data: EffectDefinition;
}
```

**Response (Error):**
```typescript
{
  success: false;
  error: {
    code: string;
    message: string;
    suggestion?: string;  // Helpful hint for user
  }
}
```

### POST /api/audio/upload

**Request:** `multipart/form-data`
- `file`: Audio file (max 256MB)

**Response:**
```typescript
{
  success: true;
  data: {
    id: string;
    filename: string;
    duration: number;
    sampleRate: number;
    channels: number;
    format: string;
  }
}
```

---

## Security Considerations

### Input Validation
- Sanitize all user prompts before sending to AI
- Validate file uploads (MIME type, magic bytes, size limits)
- Validate all JSON schemas with Zod

### Rate Limiting
- AI generation: 10 requests/minute per IP
- File upload: 5 requests/minute per IP
- General API: 100 requests/minute per IP

### Content Security
- CSP headers to prevent XSS
- Audio files scanned and validated
- No user-generated code execution

### API Security
- CORS configuration for allowed origins
- API key rotation for AI services
- Request signing for sensitive endpoints (future)

---

## Performance Requirements

| Metric | Target | Measurement |
|--------|--------|-------------|
| Effect generation time | < 5s (p50), < 10s (p95) | API response time |
| Audio latency (live) | < 30ms | Web Audio API reporting |
| UI responsiveness | < 16ms frame time | 60fps target |
| File upload | < 30s for 50MB | Upload completion |
| Initial page load | < 3s | First contentful paint |
| Time to interactive | < 5s | Lighthouse metric |

### Optimization Strategies

1. **Audio Processing**
   - Use AudioWorklet for custom DSP (if needed)
   - Minimize node count in audio graph
   - Reuse audio buffers where possible

2. **UI Rendering**
   - Canvas for smooth knob/meter rendering
   - RequestAnimationFrame for animations
   - Debounce parameter updates (except for audio)

3. **Network**
   - Compress API responses
   - Cache static assets aggressively
   - Lazy load non-critical components

---

## Development Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Project setup (Vite, React, TypeScript)
- [ ] Basic UI layout and styling
- [ ] Audio engine initialization
- [ ] File upload and playback
- [ ] Basic waveform display

### Phase 2: AI Integration (Week 3-4)
- [ ] Backend API setup
- [ ] AI service integration
- [ ] Prompt engineering and testing
- [ ] Effect schema validation
- [ ] Error handling

### Phase 3: Effect Rendering (Week 5-6)
- [ ] JSON → Audio graph builder
- [ ] JSON → UI renderer
- [ ] Custom control components (knob, slider, switch)
- [ ] Real-time parameter binding
- [ ] Bypass functionality

### Phase 4: Live Audio (Week 7-8)
- [ ] Microphone input handling
- [ ] Permission management
- [ ] Input/output level meters
- [ ] Latency optimization
- [ ] Feedback prevention

### Phase 5: Polish & Launch (Week 9-10)
- [ ] Preset save/load
- [ ] Export/import functionality
- [ ] A/B comparison
- [ ] Error states and edge cases
- [ ] Performance optimization
- [ ] Cross-browser testing
- [ ] Documentation

---

## Appendix A: Example Effect Definition

```json
{
  "id": "eff_abc123",
  "name": "Warm Tape Delay",
  "description": "A warm tape delay with flutter and saturation",
  "prompt": "A warm tape delay with flutter and saturation",
  "version": "1.0",
  "nodes": [
    { "id": "input", "type": "input", "params": {} },
    { "id": "saturation", "type": "distortion", "params": { "amount": 0.2, "type": "soft" } },
    { "id": "delay", "type": "delay", "params": { "delayTime": 350, "feedback": 0.4, "wetDry": 0.5 } },
    { "id": "filter", "type": "filter", "params": { "type": "lowpass", "frequency": 3000, "Q": 1 } },
    { "id": "output", "type": "output", "params": {} }
  ],
  "connections": [
    { "from": { "nodeId": "input" }, "to": { "nodeId": "saturation" } },
    { "from": { "nodeId": "saturation" }, "to": { "nodeId": "delay" } },
    { "from": { "nodeId": "delay" }, "to": { "nodeId": "filter" } },
    { "from": { "nodeId": "filter" }, "to": { "nodeId": "output" } }
  ],
  "ui": {
    "layout": "horizontal",
    "controls": [
      {
        "id": "ctrl_time",
        "type": "knob",
        "label": "Time",
        "binding": { "nodeId": "delay", "param": "delayTime" },
        "config": { "min": 50, "max": 2000, "default": 350, "unit": "ms" }
      },
      {
        "id": "ctrl_feedback",
        "type": "knob",
        "label": "Feedback",
        "binding": { "nodeId": "delay", "param": "feedback" },
        "config": { "min": 0, "max": 0.95, "default": 0.4, "unit": "%" }
      },
      {
        "id": "ctrl_tone",
        "type": "knob",
        "label": "Tone",
        "binding": { "nodeId": "filter", "param": "frequency" },
        "config": { "min": 500, "max": 8000, "default": 3000, "unit": "Hz", "curve": "logarithmic" }
      },
      {
        "id": "ctrl_warmth",
        "type": "knob",
        "label": "Warmth",
        "binding": { "nodeId": "saturation", "param": "amount" },
        "config": { "min": 0, "max": 0.6, "default": 0.2, "unit": "%" }
      },
      {
        "id": "ctrl_mix",
        "type": "slider",
        "label": "Mix",
        "binding": { "nodeId": "delay", "param": "wetDry" },
        "config": { "min": 0, "max": 1, "default": 0.5, "unit": "%", "orientation": "vertical" }
      }
    ]
  },
  "metadata": {
    "createdAt": "2025-11-25T10:30:00Z",
    "generationTimeMs": 2340,
    "aiModel": "claude-sonnet-4-5-20250929"
  }
}
```

---

*Document Version: 1.0*
*Last Updated: 2025-11-25*
