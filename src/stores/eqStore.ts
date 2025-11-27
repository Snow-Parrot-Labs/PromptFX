import { create } from 'zustand'

// Types
export interface EQBandState {
  frequency: number
  Q: number
  gain?: number
}

export interface EQSectionState {
  enabled: boolean
  bypassed: boolean
  highpass: { frequency: number; Q: number }
  lowShelf: { frequency: number; gain: number; Q: number }
  midPeak: { frequency: number; gain: number; Q: number }
  highPeak: { frequency: number; gain: number; Q: number }
  lowpass: { frequency: number; Q: number }
}

interface EQState {
  inputEQ: EQSectionState
  outputEQ: EQSectionState

  // Actions
  setInputEQEnabled: (enabled: boolean) => void
  setOutputEQEnabled: (enabled: boolean) => void
  setInputEQBypassed: (bypassed: boolean) => void
  setOutputEQBypassed: (bypassed: boolean) => void

  updateInputEQBand: (
    band: 'highpass' | 'lowShelf' | 'midPeak' | 'highPeak' | 'lowpass',
    param: 'frequency' | 'Q' | 'gain',
    value: number
  ) => void

  updateOutputEQBand: (
    band: 'highpass' | 'lowShelf' | 'midPeak' | 'highPeak' | 'lowpass',
    param: 'frequency' | 'Q' | 'gain',
    value: number
  ) => void

  resetInputEQ: () => void
  resetOutputEQ: () => void
  reset: () => void
}

// Default values (flat EQ curve)
const defaultInputEQ: EQSectionState = {
  enabled: true,
  bypassed: false,
  highpass: { frequency: 80, Q: 0.7 },
  lowShelf: { frequency: 100, gain: 0, Q: 0.7 },
  midPeak: { frequency: 1000, gain: 0, Q: 1.0 },
  highPeak: { frequency: 8000, gain: 0, Q: 1.0 },
  lowpass: { frequency: 12000, Q: 0.7 },
}

const defaultOutputEQ: EQSectionState = {
  enabled: true,
  bypassed: false,
  highpass: { frequency: 80, Q: 0.7 },
  lowShelf: { frequency: 100, gain: 0, Q: 0.7 },
  midPeak: { frequency: 1000, gain: 0, Q: 1.0 },
  highPeak: { frequency: 8000, gain: 0, Q: 1.0 },
  lowpass: { frequency: 12000, Q: 0.7 },
}

// LocalStorage persistence
const STORAGE_KEY = 'promptfx-eq-state'

const loadPersistedState = (): {
  inputEQ: EQSectionState
  outputEQ: EQSectionState
} | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored !== null) {
      const parsed: unknown = JSON.parse(stored)
      // Validate structure before returning
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        'inputEQ' in parsed &&
        'outputEQ' in parsed
      ) {
        return parsed as { inputEQ: EQSectionState; outputEQ: EQSectionState }
      }
    }
  } catch (error) {
    console.warn('Failed to load EQ state from localStorage:', error)
  }
  return null
}

// Debounced persist function (500ms delay)
let persistTimeout: ReturnType<typeof setTimeout> | null = null

const persistEQState = (state: { inputEQ: EQSectionState; outputEQ: EQSectionState }): void => {
  if (persistTimeout !== null) {
    clearTimeout(persistTimeout)
  }

  persistTimeout = setTimeout(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (error) {
      console.warn('Failed to persist EQ state:', error)
    }
  }, 500)
}

// Load persisted state or use defaults
const persistedState = loadPersistedState()
const initialState = {
  inputEQ: persistedState?.inputEQ ?? defaultInputEQ,
  outputEQ: persistedState?.outputEQ ?? defaultOutputEQ,
}

// Zustand store
export const useEQStore = create<EQState>((set) => ({
  ...initialState,

  setInputEQEnabled: (enabled) => {
    set((state) => {
      const newState = {
        ...state,
        inputEQ: { ...state.inputEQ, enabled },
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  setOutputEQEnabled: (enabled) => {
    set((state) => {
      const newState = {
        ...state,
        outputEQ: { ...state.outputEQ, enabled },
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  setInputEQBypassed: (bypassed) => {
    set((state) => {
      const newState = {
        ...state,
        inputEQ: { ...state.inputEQ, bypassed },
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  setOutputEQBypassed: (bypassed) => {
    set((state) => {
      const newState = {
        ...state,
        outputEQ: { ...state.outputEQ, bypassed },
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  updateInputEQBand: (band, param, value) => {
    set((state) => {
      const newState = {
        ...state,
        inputEQ: {
          ...state.inputEQ,
          [band]: {
            ...state.inputEQ[band],
            [param]: value,
          },
        },
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  updateOutputEQBand: (band, param, value) => {
    set((state) => {
      const newState = {
        ...state,
        outputEQ: {
          ...state.outputEQ,
          [band]: {
            ...state.outputEQ[band],
            [param]: value,
          },
        },
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  resetInputEQ: () => {
    set((state) => {
      const newState = {
        ...state,
        inputEQ: defaultInputEQ,
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  resetOutputEQ: () => {
    set((state) => {
      const newState = {
        ...state,
        outputEQ: defaultOutputEQ,
      }
      persistEQState({ inputEQ: newState.inputEQ, outputEQ: newState.outputEQ })
      return newState
    })
  },

  reset: () => {
    set(() => {
      const newState = {
        inputEQ: defaultInputEQ,
        outputEQ: defaultOutputEQ,
      }
      persistEQState(newState)
      return newState
    })
  },
}))
