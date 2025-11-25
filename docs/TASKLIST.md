# PromptFX - AI Development Tasklist

This is the master tasklist for building PromptFX. Tasks are organized by phase and should be completed in order unless marked as parallelizable.

---

## Phase 1: Project Foundation

### 1.1 Project Setup
- [ ] Initialize Vite project with React + TypeScript template
- [ ] Configure TypeScript (`tsconfig.json`) with strict mode
- [ ] Set up ESLint with `@typescript-eslint` and React plugins
- [ ] Configure Prettier for code formatting
- [ ] Set up Husky + lint-staged for pre-commit hooks
- [ ] Install and configure Tailwind CSS
- [ ] Set up path aliases (`@/` → `src/`)
- [ ] Create directory structure per TECHNICAL_DESIGN.md
- [ ] Add `.env.example` with required environment variables

### 1.2 Type Definitions
- [ ] Create `src/types/effect.ts` - EffectDefinition, DSPNode, Connection, UIControl interfaces
- [ ] Create `src/types/audio.ts` - AudioState, AudioSource types
- [ ] Create `src/types/api.ts` - API request/response types

### 1.3 State Management Setup
- [ ] Install Zustand
- [ ] Create `src/stores/audioStore.ts` with initial state and actions
- [ ] Create `src/stores/effectStore.ts` with initial state and actions
- [ ] Create `src/stores/uiStore.ts` for loading/error states

### 1.4 Basic Layout & Styling
- [ ] Create `App.tsx` with main layout structure
- [ ] Create `Header` component with logo placeholder
- [ ] Create `PromptSection` container component
- [ ] Create `EffectSection` container component
- [ ] Create `AudioSection` container component
- [ ] Set up global styles and Tailwind theme (dark mode, audio-app aesthetic)

---

## Phase 2: Audio Engine Foundation

### 2.1 Core Audio Engine
- [ ] Install Tone.js
- [ ] Create `src/services/audioEngine.ts` class
- [ ] Implement `initialize()` - create AudioContext on user gesture
- [ ] Implement `loadAudioFile(file: File)` - decode audio to buffer
- [ ] Implement `play()`, `pause()`, `stop()`, `seek(time)` methods
- [ ] Implement `getWaveformData()` for visualization
- [ ] Implement `getInputLevel()` / `getOutputLevel()` for meters
- [ ] Add bypass toggle functionality

### 2.2 Audio Hook
- [ ] Create `src/hooks/useAudioEngine.ts`
- [ ] Connect hook to audioStore
- [ ] Handle AudioContext state (suspended/running)
- [ ] Implement cleanup on unmount

### 2.3 File Upload & Playback UI
- [ ] Create `src/components/audio/FileUploader.tsx` - drag & drop + file picker
- [ ] Validate file types (WAV, MP3, AIFF) and size limits
- [ ] Create `src/components/audio/Waveform.tsx` - canvas-based waveform display
- [ ] Create `src/components/audio/Transport.tsx` - play/pause/stop buttons + time display
- [ ] Wire up Transport to audioStore actions
- [ ] Add playhead position indicator to Waveform

### 2.4 Basic Audio Test
- [ ] Add test audio file to `public/audio/`
- [ ] Verify file loads and plays correctly
- [ ] Verify waveform displays correctly
- [ ] Verify transport controls work

---

## Phase 3: Backend & AI Integration

### 3.1 Backend Setup
- [ ] Create `server/` directory structure
- [ ] Initialize `package.json` with dependencies (express, cors, zod, etc.)
- [ ] Create `server/src/app.ts` - Express app setup
- [ ] Create `server/src/config/index.ts` - environment config
- [ ] Set up CORS for local development
- [ ] Create basic health check endpoint (`GET /api/health`)

### 3.2 Effect Generation Endpoint
- [ ] Create `server/src/schemas/effectSchema.ts` - Zod schema for EffectDefinition
- [ ] Create `server/src/schemas/promptSchema.ts` - Zod schema for generation request
- [ ] Create `server/src/utils/promptTemplates.ts` - system prompt for AI
- [ ] Create `server/src/services/aiService.ts` - Claude API integration
- [ ] Create `server/src/services/effectGeneratorService.ts` - orchestrate generation + validation
- [ ] Create `server/src/controllers/effectController.ts` - handle requests
- [ ] Create `POST /api/effects/generate` route
- [ ] Implement validation of AI response against schema
- [ ] Add error handling and user-friendly error messages

### 3.3 Middleware
- [ ] Create `server/src/middleware/errorHandler.ts` - global error handling
- [ ] Create `server/src/middleware/rateLimiter.ts` - rate limiting for AI endpoint
- [ ] Create `server/src/middleware/validator.ts` - request validation middleware

### 3.4 Frontend API Integration
- [ ] Create `src/services/api.ts` - API client with fetch wrapper
- [ ] Add `generateEffect(prompt: string)` function
- [ ] Connect effectStore to API
- [ ] Handle loading and error states in UI

### 3.5 Prompt Input UI
- [ ] Create `src/components/prompt/PromptInput.tsx` - text input with submit button
- [ ] Create `src/components/prompt/PromptSuggestions.tsx` - example prompts
- [ ] Add loading state during generation
- [ ] Add error display for failed generations
- [ ] Wire up to effectStore.generateEffect()

### 3.6 AI Testing
- [ ] Test generation with simple prompts ("basic delay", "simple reverb")
- [ ] Test generation with complex prompts ("warm tape delay with flutter")
- [ ] Verify schema validation catches malformed responses
- [ ] Test error handling for rate limits and API failures

---

## Phase 4: Effect Rendering

### 4.1 UI Control Components
- [ ] Create `src/components/ui/Knob.tsx` - canvas-based rotary control
  - Vertical drag for value change
  - Double-click to reset
  - Value display with unit
  - Keyboard accessibility
- [ ] Create `src/components/ui/Slider.tsx` - horizontal/vertical slider
  - Click and drag
  - Value display with unit
- [ ] Create `src/components/ui/Switch.tsx` - toggle switch
  - On/off labels
  - Click to toggle
- [ ] Create `src/components/ui/Button.tsx` - standard button
- [ ] Create `src/components/ui/Meter.tsx` - level meter (VU-style)

### 4.2 Effect Builder Service
- [ ] Create `src/services/effectBuilder.ts`
- [ ] Implement `buildAudioGraph(definition: EffectDefinition)`
  - Map JSON nodes to Tone.js nodes
  - Connect nodes based on connections array
- [ ] Implement `updateParameter(nodeId, param, value)`
  - Smooth parameter ramping
- [ ] Implement `destroyGraph()` - cleanup existing nodes

### 4.3 Control Renderer
- [ ] Create `src/components/effect/ControlRenderer.tsx`
  - Read UI definition from effect
  - Render appropriate control type (Knob/Slider/Switch)
  - Bind controls to effectBuilder.updateParameter
- [ ] Create `src/components/effect/EffectPanel.tsx` - container with layout
- [ ] Create `src/components/effect/EffectHeader.tsx` - name, description, regenerate button

### 4.4 Effect Hook
- [ ] Create `src/hooks/useEffectControls.ts`
  - Connect effect definition to audio engine
  - Handle parameter updates
  - Rebuild graph when definition changes

### 4.5 Integration Testing
- [ ] Generate effect from prompt
- [ ] Verify UI renders with correct controls
- [ ] Verify knob/slider changes affect audio
- [ ] Test bypass functionality
- [ ] Test regenerate with modified prompt

---

## Phase 5: Live Audio Input

### 5.1 Microphone Input
- [ ] Implement `enableLiveInput()` in audioEngine
- [ ] Request microphone permission
- [ ] Create MediaStreamSource from mic input
- [ ] Route through effect chain to output

### 5.2 Live Input UI
- [ ] Create `src/components/audio/LiveInput.tsx`
  - Enable/disable mic button
  - Permission status indicator
  - Input level meter
- [ ] Create `src/components/audio/SourceSelector.tsx` - toggle file/live
- [ ] Create `src/hooks/useLiveInput.ts` - manage mic state

### 5.3 Latency Optimization
- [ ] Configure AudioContext with `latencyHint: 'interactive'`
- [ ] Test and measure actual latency
- [ ] Add latency display in UI (dev mode)
- [ ] Implement feedback prevention (mute output when enabling mic)

### 5.4 Output Controls
- [ ] Create `src/components/audio/OutputControls.tsx`
  - Output level meter
  - Master volume control
  - Mute button

---

## Phase 6: Presets & Export

### 6.1 Preset System
- [ ] Create `src/hooks/usePresets.ts`
  - Save preset to localStorage
  - Load preset from localStorage
  - List saved presets
  - Delete preset
- [ ] Create `src/components/effect/PresetControls.tsx`
  - Save button with name input
  - Preset dropdown/list
  - Delete button

### 6.2 Export/Import
- [ ] Implement preset export as JSON file
- [ ] Implement preset import from JSON file
- [ ] Implement audio export (processed file download)
  - Use OfflineAudioContext for rendering
  - Encode to WAV format

### 6.3 A/B Comparison
- [ ] Add A/B toggle to compare original vs processed
- [ ] Implement quick switch between dry/wet
- [ ] Visual indicator of current mode

---

## Phase 7: Polish & Error Handling

### 7.1 Error States
- [ ] Design and implement error UI components
- [ ] Handle network errors gracefully
- [ ] Handle audio loading errors
- [ ] Handle permission denied for microphone
- [ ] Handle unsupported browsers

### 7.2 Loading States
- [ ] Add skeleton loaders for effect panel
- [ ] Add progress indicator for file upload
- [ ] Add generation progress feedback

### 7.3 Empty States
- [ ] Design "no effect generated" state
- [ ] Design "no audio loaded" state
- [ ] Add helpful prompts and suggestions

### 7.4 Accessibility
- [ ] Add keyboard navigation for all controls
- [ ] Add ARIA labels
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG AA

### 7.5 Performance
- [ ] Profile and optimize render performance
- [ ] Debounce non-audio parameter updates
- [ ] Lazy load non-critical components
- [ ] Optimize bundle size

---

## Phase 8: Testing & Documentation

### 8.1 Unit Tests
- [ ] Set up Vitest
- [ ] Test effectBuilder service
- [ ] Test audio utilities
- [ ] Test Zod schemas
- [ ] Test store actions

### 8.2 Integration Tests
- [ ] Test effect generation flow
- [ ] Test audio playback flow
- [ ] Test preset save/load flow

### 8.3 E2E Tests (Optional for MVP)
- [ ] Set up Playwright
- [ ] Test full user flow: prompt → generate → play → export

### 8.4 Cross-Browser Testing
- [ ] Test in Chrome
- [ ] Test in Firefox
- [ ] Test in Safari
- [ ] Document any browser-specific issues

### 8.5 Documentation
- [ ] Update CLAUDE.md with any new patterns
- [ ] Document environment setup
- [ ] Document deployment process

---

## Phase 9: Deployment

### 9.1 Build Configuration
- [ ] Configure production build
- [ ] Set up environment variables for production
- [ ] Optimize assets (images, fonts)

### 9.2 Backend Deployment
- [ ] Choose hosting platform (Vercel/Railway/Fly.io)
- [ ] Set up production database (if needed)
- [ ] Configure environment variables
- [ ] Deploy backend

### 9.3 Frontend Deployment
- [ ] Configure static hosting
- [ ] Set up CDN
- [ ] Configure custom domain (if applicable)
- [ ] Deploy frontend

### 9.4 Monitoring
- [ ] Set up error tracking (Sentry)
- [ ] Set up basic analytics
- [ ] Set up uptime monitoring

---

## Task Dependencies

```
Phase 1 ─────────────────────────────────────────────────────────►
         │
         ├─► Phase 2 (Audio) ──────────────────────────────────►
         │                    │
         │                    └─► Phase 5 (Live Audio) ────────►
         │
         └─► Phase 3 (Backend/AI) ─────────────────────────────►
                               │
                               └─► Phase 4 (Effect Rendering) ─►
                                                    │
                                                    └─► Phase 6 (Presets) ─►
                                                                    │
                                                                    └─► Phase 7 ─► Phase 8 ─► Phase 9
```

**Parallelizable Work:**
- Phase 2 (Audio) and Phase 3 (Backend) can be developed in parallel after Phase 1
- UI control components (4.1) can be built while backend is being developed
- Testing can begin as soon as features are complete

---

## Completion Checklist

Before marking MVP complete:

- [ ] User can enter a text prompt and generate an effect
- [ ] Generated effect displays interactive controls (knobs, sliders, switches)
- [ ] User can upload audio file and hear it processed
- [ ] User can use live microphone input with the effect
- [ ] User can save and load effect presets
- [ ] User can export processed audio
- [ ] App works in Chrome, Firefox, and Safari
- [ ] Error states are handled gracefully
- [ ] Performance targets are met (< 5s generation, < 30ms latency)

---

*Last Updated: 2025-11-25*
