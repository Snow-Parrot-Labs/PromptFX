# PromptFX - AI Development Tasklist

This is the master tasklist for building PromptFX. Tasks are organized by phase and should be completed in order unless marked as parallelizable.

---

## Phase 1: Project Foundation

### 1.1 Project Setup
- [x] Initialize Vite project with React + TypeScript template
- [x] Configure TypeScript (`tsconfig.json`) with strict mode
- [x] Set up ESLint with `@typescript-eslint` and React plugins
- [x] Configure Prettier for code formatting
- [x] Set up Husky + lint-staged for pre-commit hooks
- [x] Install and configure Tailwind CSS
- [x] Set up path aliases (`@/` → `src/`)
- [x] Create directory structure per TECHNICAL_DESIGN.md
- [x] Add `.env.example` with required environment variables

### 1.2 Type Definitions
- [x] Create `src/types/effect.ts` - EffectDefinition, DSPNode, Connection, UIControl interfaces
- [x] Create `src/types/audio.ts` - AudioState, AudioSource types
- [x] Create `src/types/api.ts` - API request/response types

### 1.3 State Management Setup
- [x] Install Zustand
- [x] Create `src/stores/audioStore.ts` with initial state and actions
- [x] Create `src/stores/effectStore.ts` with initial state and actions
- [x] Create `src/stores/uiStore.ts` for loading/error states

### 1.4 Basic Layout & Styling
- [x] Create `App.tsx` with main layout structure
- [x] Create `Header` component with logo placeholder
- [x] Create `PromptSection` container component
- [x] Create `EffectSection` container component
- [x] Create `AudioSection` container component
- [x] Set up global styles and Tailwind theme (dark mode, audio-app aesthetic)

---

## Phase 2: Audio Engine Foundation

### 2.1 Core Audio Engine
- [x] Install Tone.js
- [x] Create `src/services/audioEngine.ts` class
- [x] Implement `initialize()` - create AudioContext on user gesture
- [x] Implement `loadAudioFile(file: File)` - decode audio to buffer
- [x] Implement `play()`, `pause()`, `stop()`, `seek(time)` methods
- [x] Implement `getWaveformData()` for visualization
- [x] Implement `getInputLevel()` / `getOutputLevel()` for meters
- [x] Add bypass toggle functionality

### 2.2 Audio Hook
- [x] Create `src/hooks/useAudioEngine.ts`
- [x] Connect hook to audioStore
- [x] Handle AudioContext state (suspended/running)
- [x] Implement cleanup on unmount

### 2.3 File Upload & Playback UI
- [x] Create `src/components/audio/FileUploader.tsx` - drag & drop + file picker
- [x] Validate file types (WAV, MP3, AIFF) and size limits
- [x] Create `src/components/audio/Waveform.tsx` - canvas-based waveform display
- [x] Create `src/components/audio/Transport.tsx` - play/pause/stop buttons + time display
- [x] Wire up Transport to audioStore actions
- [x] Add playhead position indicator to Waveform

### 2.4 Test Tone Generator
- [x] Create `src/components/audio/TestToneGenerator.tsx`
- [x] Implement 1kHz sine wave generator using Tone.js Oscillator
- [x] Add frequency selector (100Hz, 440Hz, 1kHz, 10kHz)
- [x] Add on/off toggle button
- [x] Route test tone through effect chain
- [x] Add visual indicator when tone is active

### 2.5 Basic Audio Test
- [ ] Verify test tone generator works and routes through effects
- [ ] Verify file loads and plays correctly
- [ ] Verify waveform displays correctly
- [ ] Verify transport controls work

---

## Phase 3: Backend & AI Integration

### 3.1 Backend Setup
- [x] Create `server/` directory structure
- [x] Initialize `package.json` with dependencies (express, cors, zod, etc.)
- [x] Create `server/src/app.ts` - Express app setup
- [x] Create `server/src/config/index.ts` - environment config
- [x] Set up CORS for local development
- [x] Create basic health check endpoint (`GET /api/health`)

### 3.2 Effect Generation Endpoint
- [x] Create `server/src/schemas/effectSchema.ts` - Zod schema for EffectDefinition
- [x] Create `server/src/schemas/promptSchema.ts` - Zod schema for generation request
- [x] Create `server/src/services/aiService.ts` - Claude API integration (includes system prompt)
- [x] Create `server/src/services/effectService.ts` - orchestrate generation + validation
- [x] Create `server/src/routes/effects.ts` - effect routes including POST /api/effects/generate
- [x] Implement validation of AI response against schema
- [x] Add error handling and user-friendly error messages

### 3.3 Middleware
- [x] Create `server/src/middleware/errorHandler.ts` - global error handling
- [x] Create `server/src/middleware/rateLimiter.ts` - rate limiting for AI endpoint

### 3.4 Frontend API Integration
- [x] Create `src/services/api.ts` - API client with fetch wrapper
- [x] Add `generateEffect(prompt: string)` function
- [x] Connect effectStore to API
- [x] Handle loading and error states in UI

### 3.5 Prompt Input UI
- [x] Create `src/components/prompt/PromptInput.tsx` - text input with submit button
- [x] Add prompt suggestions (example prompts)
- [x] Add loading state during generation
- [x] Add error display for failed generations
- [x] Wire up to effectStore.generateEffect()

### 3.6 AI Testing
- [ ] Test generation with simple prompts ("basic delay", "simple reverb")
- [ ] Test generation with complex prompts ("warm tape delay with flutter")
- [ ] Verify schema validation catches malformed responses
- [ ] Test error handling for rate limits and API failures

---

## Phase 4: Effect Rendering

### 4.1 UI Control Components
- [x] Create `src/components/ui/Knob.tsx` - canvas-based rotary control
  - Vertical drag for value change
  - Double-click to reset
  - Value display with unit
  - Keyboard accessibility
- [x] Create `src/components/ui/Slider.tsx` - horizontal/vertical slider
  - Click and drag
  - Value display with unit
- [x] Create `src/components/ui/Switch.tsx` - toggle switch
  - On/off labels
  - Click to toggle
- [x] Create `src/components/ui/Select.tsx` - dropdown select

### 4.2 Effect Builder Service
- [x] Create `src/services/effectBuilder.ts`
- [x] Implement `buildAudioGraph(definition: EffectDefinition)`
  - Map JSON nodes to Tone.js nodes
  - Connect nodes based on connections array
- [x] Implement `updateParameter(nodeId, param, value)`
  - Smooth parameter ramping
- [x] Implement `destroyGraph()` - cleanup existing nodes

### 4.3 Control Renderer
- [x] Create `src/components/effect/ControlRenderer.tsx`
  - Read UI definition from effect
  - Render appropriate control type (Knob/Slider/Switch)
  - Bind controls to effectBuilder.updateParameter
- [x] Create `src/components/effect/EffectPanel.tsx` - container with layout
- [x] Create `src/components/effect/EffectHeader.tsx` - name, description, regenerate button

### 4.4 Effect Hook
- [x] Create `src/hooks/useEffectControls.ts`
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
- [x] Implement `enableLiveInput()` in audioEngine
- [x] Request microphone permission
- [x] Create MediaStreamSource from mic input (using Tone.UserMedia)
- [x] Route through effect chain to output

### 5.2 Live Input UI
- [x] Create `src/components/audio/LiveInput.tsx`
  - Enable/disable mic button
  - Permission status indicator
  - Input level meter
- [x] Create `src/components/audio/SourceSelector.tsx` - toggle file/live
- [x] Update AudioSection to integrate live input

### 5.3 Latency Optimization
- [x] Configure AudioContext with `latencyHint: 'interactive'`
- [x] Implement feedback prevention warning (headphones notice)

### 5.4 Output Controls
- [x] Create `src/components/audio/OutputControls.tsx`
  - Output level meter
  - Master volume control
  - Mute button
  - Bypass toggle

---

## Phase 6: Presets & Export

### 6.1 Preset System
- [x] Create `src/hooks/usePresets.ts`
  - Save preset to localStorage
  - Load preset from localStorage
  - List saved presets
  - Delete preset
- [x] Create `src/components/effect/PresetControls.tsx`
  - Save button with name input
  - Preset dropdown/list
  - Delete button

### 6.2 Export/Import
- [x] Implement preset export as JSON file
- [x] Implement preset import from JSON file
- [x] Implement audio export (processed file download)
  - Use OfflineAudioContext for rendering
  - Encode to WAV format

### 6.3 A/B Comparison
- [x] Add A/B toggle to compare original vs processed (via bypass toggle in OutputControls)
- [x] Implement quick switch between dry/wet (bypass button)
- [x] Visual indicator of current mode (bypass state displayed)

---

## Phase 7: Polish & Error Handling

### 7.1 Error States
- [x] Design and implement error UI components (ErrorBanner, Toast)
- [x] Handle network errors gracefully (toast notifications)
- [x] Handle audio loading errors (toast notifications)
- [x] Handle permission denied for microphone (toast notifications)
- [x] Handle unsupported browsers (graceful degradation)

### 7.2 Loading States
- [x] Add skeleton loaders for effect panel (SkeletonEffectPanel)
- [x] Add progress indicator for file upload (FileUploader spinner)
- [x] Add generation progress feedback (skeleton + message)

### 7.3 Empty States
- [x] Design "no effect generated" state (helpful prompt in EffectSection)
- [x] Design "no audio loaded" state (FileUploader drop zone)
- [x] Add helpful prompts and suggestions (PromptInput suggestions)

### 7.4 Accessibility
- [x] Add keyboard navigation for all controls (Knob, Slider arrow keys)
- [x] Add ARIA labels (role="slider", aria-label, aria-valuemin/max/now)
- [x] Test with screen reader (basic support)
- [x] Ensure color contrast meets WCAG AA (dark theme with good contrast)

### 7.5 Performance
- [x] Profile and optimize render performance
- [x] Debounce non-audio parameter updates (utilities added)
- [x] Lazy load non-critical components (code splitting)
- [x] Optimize bundle size (manualChunks: tone, react-vendor, zustand)

---

## Phase 8: Testing & Documentation

### 8.1 Unit Tests
- [x] Set up Vitest (frontend + server)
- [x] Test effectBuilder service (8 tests)
- [x] Test audio utilities (mocked via Tone.js)
- [x] Test Zod schemas (15 tests)
- [x] Test store actions (15 tests)

### 8.2 Integration Tests
- [x] Test effect generation flow (via effectStore tests)
- [x] Test audio playback flow (mocked)
- [x] Test preset save/load flow (10 tests)

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
