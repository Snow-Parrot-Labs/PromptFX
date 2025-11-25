import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Tone.js - audio APIs not available in jsdom
vi.mock('tone', () => {
  // Create chainable mock node
  const createMockNode = (): Record<string, unknown> => ({
    connect: vi.fn(function (this: unknown) {
      return this
    }),
    disconnect: vi.fn(function (this: unknown) {
      return this
    }),
    dispose: vi.fn(),
  })

  // Mock Tone audio nodes as classes
  class MockGain {
    gain = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockPlayer {
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    start = vi.fn()
    stop = vi.fn()
    dispose = vi.fn()
    onstop = null
  }

  class MockOscillator {
    frequency = { rampTo: vi.fn() }
    connect = vi.fn().mockReturnThis()
    start = vi.fn()
    stop = vi.fn()
    dispose = vi.fn()
  }

  class MockMeter {
    connect = vi.fn().mockReturnThis()
    getValue = vi.fn(() => -60)
    dispose = vi.fn()
  }

  class MockToneAudioBuffer {
    duration = 10
    sampleRate = 44100
    numberOfChannels = 2
    load = vi.fn().mockResolvedValue(undefined)
    getChannelData = vi.fn(() => new Float32Array(1000))
    get = vi.fn(() => ({
      numberOfChannels: 2,
      sampleRate: 44100,
      length: 44100,
      getChannelData: vi.fn(() => new Float32Array(44100)),
    }))
  }

  class MockUserMedia {
    open = vi.fn().mockResolvedValue(undefined)
    close = vi.fn()
    connect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockFeedbackDelay {
    delayTime = { rampTo: vi.fn(), value: 0.5 }
    feedback = { rampTo: vi.fn(), value: 0.5 }
    wet = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockReverb {
    decay = 2
    preDelay = 0.01
    wet = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockFilter {
    frequency = { rampTo: vi.fn(), value: 1000 }
    Q = { rampTo: vi.fn(), value: 1 }
    type = 'lowpass'
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockDistortion {
    distortion = 0.5
    wet = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockCompressor {
    threshold = { rampTo: vi.fn(), value: -24 }
    ratio = { rampTo: vi.fn(), value: 4 }
    attack = { rampTo: vi.fn(), value: 0.003 }
    release = { rampTo: vi.fn(), value: 0.25 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockChorus {
    frequency = { rampTo: vi.fn(), value: 1.5 }
    depth = 0.7
    delayTime = 3.5
    wet = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
    start = vi.fn().mockReturnThis()
  }

  class MockTremolo {
    frequency = { rampTo: vi.fn(), value: 10 }
    depth = { rampTo: vi.fn(), value: 0.5 }
    type = 'sine'
    wet = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
    start = vi.fn().mockReturnThis()
  }

  class MockPanner {
    pan = { rampTo: vi.fn(), value: 0 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  class MockBitCrusher {
    bits = 8
    wet = { rampTo: vi.fn(), value: 1 }
    connect = vi.fn().mockReturnThis()
    disconnect = vi.fn().mockReturnThis()
    dispose = vi.fn()
  }

  return {
    start: vi.fn().mockResolvedValue(undefined),
    getContext: vi.fn(() => ({ latencyHint: 'interactive' })),
    getDestination: vi.fn(() => ({})),
    dbToGain: vi.fn((db: number) => Math.pow(10, db / 20)),
    getTransport: vi.fn(() => ({
      state: 'stopped',
      seconds: 0,
      start: vi.fn(),
      stop: vi.fn(),
      pause: vi.fn(),
    })),
    Offline: vi.fn().mockResolvedValue({
      get: vi.fn(() => ({
        numberOfChannels: 2,
        sampleRate: 44100,
        length: 44100,
        getChannelData: vi.fn(() => new Float32Array(44100)),
      })),
    }),
    // Classes
    Gain: MockGain,
    Player: MockPlayer,
    Oscillator: MockOscillator,
    Meter: MockMeter,
    ToneAudioBuffer: MockToneAudioBuffer,
    UserMedia: MockUserMedia,
    FeedbackDelay: MockFeedbackDelay,
    Reverb: MockReverb,
    Filter: MockFilter,
    Distortion: MockDistortion,
    Compressor: MockCompressor,
    Chorus: MockChorus,
    Tremolo: MockTremolo,
    Panner: MockPanner,
    BitCrusher: MockBitCrusher,
    // Aliases used by effectBuilder
    Delay: MockFeedbackDelay,
    PingPongDelay: MockFeedbackDelay,
    AutoFilter: class {
      frequency = { rampTo: vi.fn(), value: 1 }
      baseFrequency = 200
      octaves = 2.6
      wet = { rampTo: vi.fn(), value: 1 }
      connect = vi.fn().mockReturnThis()
      disconnect = vi.fn().mockReturnThis()
      dispose = vi.fn()
      start = vi.fn().mockReturnThis()
    },
    Phaser: class {
      frequency = { rampTo: vi.fn(), value: 0.5 }
      octaves = 3
      baseFrequency = 1000
      wet = { rampTo: vi.fn(), value: 1 }
      connect = vi.fn().mockReturnThis()
      disconnect = vi.fn().mockReturnThis()
      dispose = vi.fn()
    },
    EQ3: class {
      low = { value: 0 }
      mid = { value: 0 }
      high = { value: 0 }
      connect = vi.fn().mockReturnThis()
      disconnect = vi.fn().mockReturnThis()
      dispose = vi.fn()
    },
  }
})

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
})

// Mock fetch
global.fetch = vi.fn()

// Mock URL.createObjectURL
URL.createObjectURL = vi.fn(() => 'blob:mock-url')
URL.revokeObjectURL = vi.fn()

// Mock File.text() for preset import tests
Object.defineProperty(File.prototype, 'text', {
  value: function () {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.readAsText(this)
    })
  },
})
