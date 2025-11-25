import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEffectStore } from './effectStore'
import type { EffectDefinition } from '@/types/effect'

// Mock the api module
vi.mock('@/services/api', () => ({
  api: {
    generateEffect: vi.fn(),
  },
}))

// Mock toast
vi.mock('@/components/ui', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const mockEffectDefinition: EffectDefinition = {
  id: 'test-effect',
  name: 'Test Effect',
  description: 'A test effect',
  prompt: 'test prompt',
  nodes: [
    { id: 'input', type: 'input', params: {} },
    { id: 'output', type: 'output', params: {} },
  ],
  connections: [
    { from: { nodeId: 'input', output: 'default' }, to: { nodeId: 'output', input: 'default' } },
  ],
  ui: {
    layout: 'row',
    controls: [
      {
        id: 'test-control',
        type: 'knob',
        label: 'Test',
        binding: { nodeId: 'input', param: 'gain' },
        config: { min: 0, max: 1, default: 0.5 },
      },
    ],
  },
}

describe('effectStore', () => {
  beforeEach(() => {
    useEffectStore.getState().reset()
  })

  describe('initial state', () => {
    it('should have null definition initially', () => {
      const state = useEffectStore.getState()
      expect(state.definition).toBeNull()
    })

    it('should have empty parameter values initially', () => {
      const state = useEffectStore.getState()
      expect(state.parameterValues).toEqual({})
    })

    it('should not be generating initially', () => {
      const state = useEffectStore.getState()
      expect(state.isGenerating).toBe(false)
    })

    it('should have no error initially', () => {
      const state = useEffectStore.getState()
      expect(state.generationError).toBeNull()
    })
  })

  describe('setDefinition', () => {
    it('should set the definition', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      expect(useEffectStore.getState().definition).toEqual(mockEffectDefinition)
    })

    it('should extract default parameter values', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      const state = useEffectStore.getState()
      expect(state.parameterValues['input.gain']).toBe(0.5)
    })

    it('should clear generation error', () => {
      useEffectStore.getState().setGenerationError('Some error')
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      expect(useEffectStore.getState().generationError).toBeNull()
    })

    it('should clear parameters when setting null', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      useEffectStore.getState().setDefinition(null)
      expect(useEffectStore.getState().parameterValues).toEqual({})
    })
  })

  describe('updateParameter', () => {
    it('should update a parameter value', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      useEffectStore.getState().updateParameter('input.gain', 0.8)
      expect(useEffectStore.getState().parameterValues['input.gain']).toBe(0.8)
    })

    it('should preserve other parameters', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      useEffectStore.getState().updateParameter('other.param', 0.3)
      expect(useEffectStore.getState().parameterValues['input.gain']).toBe(0.5)
      expect(useEffectStore.getState().parameterValues['other.param']).toBe(0.3)
    })
  })

  describe('setParameterValues', () => {
    it('should replace all parameter values', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      useEffectStore.getState().setParameterValues({ 'new.param': 0.9 })
      expect(useEffectStore.getState().parameterValues).toEqual({ 'new.param': 0.9 })
    })
  })

  describe('setIsGenerating', () => {
    it('should set generating state', () => {
      useEffectStore.getState().setIsGenerating(true)
      expect(useEffectStore.getState().isGenerating).toBe(true)
    })
  })

  describe('setGenerationError', () => {
    it('should set error and stop generating', () => {
      useEffectStore.getState().setIsGenerating(true)
      useEffectStore.getState().setGenerationError('Test error')

      const state = useEffectStore.getState()
      expect(state.generationError).toBe('Test error')
      expect(state.isGenerating).toBe(false)
    })
  })

  describe('clearEffect', () => {
    it('should clear definition and parameters', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      useEffectStore.getState().clearEffect()

      const state = useEffectStore.getState()
      expect(state.definition).toBeNull()
      expect(state.parameterValues).toEqual({})
      expect(state.generationError).toBeNull()
    })
  })

  describe('reset', () => {
    it('should reset to initial state', () => {
      useEffectStore.getState().setDefinition(mockEffectDefinition)
      useEffectStore.getState().setIsGenerating(true)
      useEffectStore.getState().setGenerationError('error')

      useEffectStore.getState().reset()

      const state = useEffectStore.getState()
      expect(state.definition).toBeNull()
      expect(state.parameterValues).toEqual({})
      expect(state.isGenerating).toBe(false)
      expect(state.generationError).toBeNull()
    })
  })
})
