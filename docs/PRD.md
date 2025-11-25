# PromptFX - Product Requirements Document

## Overview

**Product Name:** PromptFX
**Version:** MVP (1.0)
**Type:** Web-based AI-powered audio effect generator

PromptFX is a web application that allows users to describe audio effects in natural language. An AI interprets the description and generates an interactive GUI with controls (sliders, knobs, buttons, switches) that manipulate the effect parameters in real-time.

---

## Problem Statement

Creating custom audio effects traditionally requires:
- Deep knowledge of DSP (Digital Signal Processing)
- Proficiency in audio programming languages/frameworks
- Significant development time

Musicians, sound designers, and creators often have a clear mental model of the sound they want but lack the technical skills to build it.

---

## Solution

PromptFX bridges this gap by allowing users to describe effects in plain English. The AI:
1. Interprets the user's intent
2. Generates the underlying DSP logic
3. Creates an intuitive, interactive GUI for real-time control

---

## Target Users

- Musicians and producers seeking custom effects
- Sound designers experimenting with new sounds
- Podcasters and content creators
- Audio hobbyists and experimenters

---

## Core Features (MVP)

### 1. Text-to-Effect Generation

**Description:** User enters a natural language prompt describing the desired audio effect.

**Examples:**
- "A warm tape delay with flutter and saturation"
- "Aggressive bit crusher with a wet/dry mix"
- "Dreamy reverb that gets darker over time"

**Requirements:**
- Text input field for effect description
- AI processing to interpret and generate effect
- Error handling for ambiguous or impossible requests

---

### 2. Dynamic GUI Generation

**Description:** AI generates an interactive control interface based on the effect parameters.

**Control Types:**
| Control | Use Case |
|---------|----------|
| Sliders | Continuous parameters (delay time, mix, gain) |
| Knobs | Rotary controls for familiar audio parameters |
| Buttons | Triggers, bypass, presets |
| Switches/Toggles | On/off states, mode selection |

**Requirements:**
- Responsive, visually appealing controls
- Real-time parameter updates
- Labels and value displays for each control
- Logical grouping of related parameters

---

### 3. Audio File Input/Output

**Description:** Users can upload audio files, process them through the effect, and export the result.

**Supported Formats (MVP):**
- Input: WAV, MP3, AIFF
- Output: WAV (lossless)

**Requirements:**
- File upload interface (drag-and-drop + file picker)
- Waveform visualization
- Playback controls (play, pause, stop, scrub)
- Download processed audio button
- A/B comparison (original vs. processed)

---

### 4. Live Audio Input/Output

**Description:** Real-time audio processing from microphone or system audio.

**Requirements:**
- Browser-based audio input (Web Audio API)
- Permission handling for microphone access
- Low-latency processing
- Live monitoring toggle (to prevent feedback)
- Input level meter

---

### 5. Effect Preset Management

**Description:** Save and recall generated effects.

**Requirements:**
- Save current effect (name + parameters)
- Load saved effects
- Local storage for MVP (no account required)
- Export/import preset files (JSON)

---

## Technical Architecture

### Frontend
- **Framework:** React or Vue.js
- **Audio:** Web Audio API + Tone.js
- **UI Components:** Custom canvas-based knobs/sliders or library (e.g., react-dial-knob)
- **State Management:** Zustand or Redux

### Backend
- **Runtime:** Node.js
- **AI Integration:** OpenAI API (GPT-4) or Claude API
- **Audio Processing:** Server-side rendering for export (FFmpeg) if needed

### AI Pipeline
1. User prompt → AI interprets intent
2. AI generates DSP graph definition (JSON schema)
3. AI generates UI layout definition (JSON schema)
4. Frontend renders UI and connects to audio graph

---

## Data Models

### Effect Definition Schema
```json
{
  "name": "Warm Tape Delay",
  "description": "User's original prompt",
  "audioGraph": {
    "nodes": [...],
    "connections": [...]
  },
  "ui": {
    "controls": [
      {
        "type": "knob",
        "label": "Delay Time",
        "param": "delayTime",
        "min": 0,
        "max": 2000,
        "default": 300,
        "unit": "ms"
      }
    ]
  }
}
```

---

## User Flow (MVP)

```
1. User lands on PromptFX homepage
2. User types effect description in prompt field
3. User clicks "Generate Effect"
4. Loading state while AI processes
5. Effect GUI renders with controls
6. User either:
   a. Uploads audio file → processes → downloads result
   b. Enables live input → adjusts controls in real-time
7. User optionally saves effect as preset
8. User can modify prompt to regenerate/refine effect
```

---

## MVP Scope Boundaries

### In Scope
- Single effect generation per prompt
- Basic DSP nodes (delay, reverb, filter, distortion, gain, pan)
- Desktop browser support (Chrome, Firefox, Safari)
- Local preset storage

### Out of Scope (Future Versions)
- User accounts and cloud storage
- Effect chaining / signal routing
- MIDI control mapping
- Mobile-optimized interface
- Collaborative features
- Plugin export (VST/AU)
- Marketplace for sharing effects

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Effect generation success rate | > 85% |
| Average generation time | < 10 seconds |
| Audio latency (live mode) | < 50ms |
| User satisfaction (feedback) | > 4/5 stars |

---

## Risks & Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| AI generates invalid DSP | High | Validate schema, fallback to safe defaults |
| High latency in live mode | Medium | Optimize audio graph, reduce buffer size |
| Browser compatibility issues | Medium | Feature detection, graceful degradation |
| Ambiguous user prompts | Low | Prompt suggestions, clarification UI |

---

## Open Questions

1. Should the AI explain what it created (educational component)?
2. How much control should users have to manually edit the generated DSP?
3. Should we support stereo effects from MVP or start with mono?

---

## Appendix

### Example Prompts and Expected Outputs

**Prompt:** "A lo-fi radio effect with crackle and EQ rolloff"

**Expected Controls:**
- Knob: High Cut Frequency (200Hz - 8kHz)
- Knob: Low Cut Frequency (20Hz - 500Hz)
- Slider: Crackle Amount (0-100%)
- Slider: Noise Floor Level
- Switch: Mono/Stereo
- Knob: Wet/Dry Mix

---

*Document Version: 1.0*
*Last Updated: 2025-11-25*
