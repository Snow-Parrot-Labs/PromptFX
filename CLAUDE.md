# CLAUDE.md - PromptFX Development Guide

## Project Overview

PromptFX is a web-based AI-powered audio effect generator. Users describe effects in natural language, and AI generates interactive GUIs with controls (knobs, sliders, switches) that manipulate real-time audio processing.

## Documentation

- `docs/PRD.md` - Product requirements and MVP scope
- `docs/TECHNICAL_DESIGN.md` - Architecture, schemas, and implementation details

## Tech Stack

**Frontend:**
- React 18+ with TypeScript
- Zustand for state management
- Web Audio API + Tone.js for DSP
- Tailwind CSS for styling
- Vite for build tooling

**Backend:**
- Node.js 20+ with Express
- Claude API for effect generation
- Multer for file uploads
- Zod for schema validation

## Project Structure

```
src/
├── components/
│   ├── ui/          # Knob, Slider, Switch, Button, Meter
│   ├── audio/       # Waveform, Transport, FileUploader, LiveInput
│   ├── effect/      # EffectPanel, ControlRenderer
│   └── prompt/      # PromptInput, PromptSuggestions
├── hooks/           # useAudioEngine, useEffectControls, useLiveInput
├── stores/          # audioStore, effectStore, uiStore
├── services/        # api, audioEngine, effectBuilder
├── types/           # TypeScript interfaces
└── utils/           # Helpers and utilities

server/
├── src/
│   ├── controllers/ # Route handlers
│   ├── services/    # AI, effect generation, audio processing
│   ├── middleware/  # Error handling, rate limiting, validation
│   └── schemas/     # Zod schemas for validation
```

## Key Concepts

### Effect Definition
Effects are defined as JSON with three parts:
1. `nodes` - DSP processing nodes (delay, reverb, filter, etc.)
2. `connections` - Audio signal routing between nodes
3. `ui` - Control definitions (knobs, sliders) bound to node parameters

### Audio Engine
- Web Audio API handles real-time processing
- Tone.js provides higher-level DSP abstractions
- Parameters update via signal ramping for smooth transitions

### AI Generation
- User prompt → Claude API → JSON effect definition
- Output validated against Zod schema before use
- Fallback to safe defaults if validation fails

## Common Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run backend server
npm run server

# Build for production
npm run build

# Run tests
npm test

# Lint code
npm run lint
```

## Development Guidelines

### TypeScript

**Strict Mode Enabled** - The project uses strict TypeScript configuration.

**Type Definitions:**
- Define interfaces in `src/types/` for shared types
- Co-locate component prop types with components
- Use Zod schemas as source of truth, infer types with `z.infer<typeof schema>`

**Preferred Patterns:**
```typescript
// Use interface for object shapes
interface EffectNode {
  id: string;
  type: DSPNodeType;
  params: Record<string, number | string>;
}

// Use type for unions and aliases
type DSPNodeType = 'delay' | 'reverb' | 'filter' | 'distortion';

// Prefer const assertions for literals
const SUPPORTED_FORMATS = ['wav', 'mp3', 'aiff'] as const;
type AudioFormat = typeof SUPPORTED_FORMATS[number];

// Use generics for reusable utilities
function clamp<T extends number>(value: T, min: T, max: T): T;
```

**Avoid:**
- `any` type - use `unknown` and narrow with type guards
- Non-null assertions (`!`) - handle null/undefined explicitly
- Type assertions (`as`) - prefer type guards or generics
- Enums - use union types or const objects instead

**React Components:**
```typescript
// Function components with explicit return type
interface KnobProps {
  value: number;
  onChange: (value: number) => void;
  label: string;
  min?: number;
  max?: number;
}

export function Knob({ value, onChange, label, min = 0, max = 100 }: KnobProps): JSX.Element {
  // ...
}
```

### ESLint

**Configuration:** Uses `@typescript-eslint` with React and hooks plugins.

**Key Rules:**
```javascript
{
  // TypeScript
  "@typescript-eslint/no-explicit-any": "error",
  "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
  "@typescript-eslint/explicit-function-return-type": ["warn", {
    "allowExpressions": true,
    "allowTypedFunctionExpressions": true
  }],
  "@typescript-eslint/no-floating-promises": "error",
  "@typescript-eslint/strict-boolean-expressions": "warn",

  // React
  "react/prop-types": "off",  // Using TypeScript
  "react-hooks/rules-of-hooks": "error",
  "react-hooks/exhaustive-deps": "warn",

  // General
  "no-console": ["warn", { "allow": ["warn", "error"] }],
  "prefer-const": "error",
  "eqeqeq": ["error", "always"]
}
```

**Naming Conventions:**
- Components: `PascalCase` - `EffectPanel.tsx`
- Hooks: `camelCase` with `use` prefix - `useAudioEngine.ts`
- Utilities: `camelCase` - `parameterMapping.ts`
- Constants: `SCREAMING_SNAKE_CASE` - `MAX_DELAY_TIME`
- Types/Interfaces: `PascalCase` - `EffectDefinition`

**Import Order:**
```typescript
// 1. React and external libraries
import { useState, useEffect } from 'react';
import * as Tone from 'tone';

// 2. Internal modules (absolute imports)
import { useAudioEngine } from '@/hooks/useAudioEngine';
import { EffectDefinition } from '@/types/effect';

// 3. Relative imports
import { Knob } from './Knob';

// 4. Styles and assets
import './EffectPanel.css';
```

**Pre-commit Hooks:**
- ESLint runs on staged files via Husky + lint-staged
- Fix auto-fixable issues: `npm run lint:fix`
- Type check: `npm run typecheck`

### Audio Code
- Always initialize AudioContext on user gesture (browser requirement)
- Use `latencyHint: 'interactive'` for live input
- Ramp parameter changes to avoid clicks/pops
- Keep audio graph simple - fewer nodes = better performance

### UI Controls
- Knobs: Use for frequency, time, and familiar audio parameters
- Sliders: Use for mix/blend and linear parameters
- Switches: Use for on/off and mode toggles
- All controls must show current value and unit

### State Management
- `audioStore` - Playback state, levels, source selection
- `effectStore` - Current effect definition and parameters
- `uiStore` - Loading states, errors, UI preferences

### API Calls
- All AI generation goes through `/api/effects/generate`
- Audio uploads use `/api/audio/upload` with multipart/form-data
- Implement proper error handling with user-friendly messages

## DSP Node Types

| Node | Key Parameters |
|------|----------------|
| delay | delayTime, feedback, wetDry |
| reverb | decay, preDelay, wetDry, highCut |
| filter | type, frequency, Q, gain |
| distortion | amount, type, tone |
| compressor | threshold, ratio, attack, release |
| chorus | rate, depth, wetDry |
| tremolo | rate, depth, shape |
| gain | level |
| panner | pan |

## Testing Audio

For testing effects without microphone:
1. Use the included test audio files in `/public/audio/`
2. Or upload any WAV/MP3/ file
3. A/B comparison toggle for before/after

## Troubleshooting

**No audio output:**
- Check AudioContext state (must be 'running')
- Verify effect bypass is off
- Check browser audio permissions

**High latency:**
- Reduce buffer size in AudioContext
- Simplify effect graph
- Check for feedback loops in connections

**AI generation fails:**
- Check API key configuration
- Review prompt for clarity
- Check rate limits (10 req/min)
