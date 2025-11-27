import { create } from 'zustand'
import type { EffectDefinition } from '@/types/effect'
import { api } from '@/services/api'
import { toast } from '@/components/ui'

interface GenerateOptions {
  complexity?: 'simple' | 'complex'
  style?: string
  chaosMode?: boolean
}

interface EffectState {
  // Current effect
  definition: EffectDefinition | null
  parameterValues: Record<string, number | string | boolean>

  // Generation state
  isGenerating: boolean
  generationError: string | null

  // Actions
  setDefinition: (definition: EffectDefinition | null) => void
  updateParameter: (paramId: string, value: number | string | boolean) => void
  setParameterValues: (values: Record<string, number | string | boolean>) => void
  setIsGenerating: (generating: boolean) => void
  setGenerationError: (error: string | null) => void
  clearEffect: () => void
  reset: () => void

  // API Actions
  generateEffect: (prompt: string, options?: GenerateOptions) => Promise<void>
}

const initialState = {
  definition: null,
  parameterValues: {} as Record<string, number | string | boolean>,
  isGenerating: false,
  generationError: null,
}

export const useEffectStore = create<EffectState>((set) => ({
  ...initialState,

  setDefinition: (definition) => {
    set({
      definition,
      parameterValues: definition
        ? extractDefaultValues(definition)
        : ({} as Record<string, number | string | boolean>),
      generationError: null,
    })
  },

  updateParameter: (paramId, value) => {
    set((state) => ({
      parameterValues: {
        ...state.parameterValues,
        [paramId]: value,
      },
    }))
  },

  setParameterValues: (parameterValues) => {
    set({ parameterValues })
  },

  setIsGenerating: (isGenerating) => {
    set({ isGenerating })
  },

  setGenerationError: (generationError) => {
    set({ generationError, isGenerating: false })
  },

  clearEffect: () => {
    set({
      definition: null,
      parameterValues: {} as Record<string, number | string | boolean>,
      generationError: null,
    })
  },

  reset: () => {
    set(initialState)
  },

  generateEffect: async (prompt, options) => {
    set({ isGenerating: true, generationError: null })

    const request = options !== undefined ? { prompt, options } : { prompt }
    const response = await api.generateEffect(request)

    if (response.success && response.data) {
      set({
        definition: response.data,
        parameterValues: extractDefaultValues(response.data),
        isGenerating: false,
        generationError: null,
      })
      toast.success(`Generated "${response.data.name}"`)
    } else {
      const errorMessage = response.error?.message ?? 'Failed to generate effect'
      set({
        isGenerating: false,
        generationError: errorMessage,
      })
      toast.error(errorMessage)
    }
  },
}))

// Extract default parameter values from effect definition
function extractDefaultValues(
  definition: EffectDefinition
): Record<string, number | string | boolean> {
  const values: Record<string, number | string | boolean> = {}

  for (const control of definition.ui.controls) {
    const key = `${control.binding.nodeId}.${control.binding.param}`

    if ('default' in control.config) {
      values[key] = control.config.default
    }
  }

  return values
}
