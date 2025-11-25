import { describe, it, expect, beforeEach, vi } from 'vitest'
import { effectBuilder } from './effectBuilder'
import type { EffectDefinition } from '@/types/effect'

// Sample effect definition for testing
const createSimpleDelay: () => EffectDefinition = () => ({
  id: 'test-delay',
  name: 'Test Delay',
  description: 'A simple delay effect for testing',
  prompt: 'simple delay',
  nodes: [
    { id: 'input', type: 'input', params: {} },
    { id: 'delay1', type: 'delay', params: { time: 300, feedback: 0.5, mix: 0.5 } },
    { id: 'output', type: 'output', params: {} },
  ],
  connections: [
    { from: { nodeId: 'input', output: 'default' }, to: { nodeId: 'delay1', input: 'default' } },
    { from: { nodeId: 'delay1', output: 'default' }, to: { nodeId: 'output', input: 'default' } },
  ],
  ui: {
    layout: 'row',
    controls: [
      {
        id: 'delay-time',
        type: 'knob',
        label: 'Time',
        binding: { nodeId: 'delay1', param: 'time' },
        config: { min: 10, max: 1000, default: 300, unit: 'ms' },
      },
      {
        id: 'delay-feedback',
        type: 'knob',
        label: 'Feedback',
        binding: { nodeId: 'delay1', param: 'feedback' },
        config: { min: 0, max: 0.95, default: 0.5, step: 0.01 },
      },
    ],
  },
})

describe('effectBuilder', () => {
  beforeEach(() => {
    effectBuilder.destroyGraph()
  })

  describe('buildAudioGraph', () => {
    it('should build a graph from effect definition', () => {
      const definition = createSimpleDelay()
      const { input, output } = effectBuilder.buildAudioGraph(definition)

      expect(input).toBeDefined()
      expect(output).toBeDefined()
    })

    it('should store input and output nodes', () => {
      const definition = createSimpleDelay()
      effectBuilder.buildAudioGraph(definition)

      expect(effectBuilder.getInputNode()).toBeDefined()
      expect(effectBuilder.getOutputNode()).toBeDefined()
    })

    it('should throw if input node is missing', () => {
      const definition: EffectDefinition = {
        id: 'bad',
        name: 'Bad',
        description: 'Missing input',
        prompt: 'bad',
        nodes: [{ id: 'output', type: 'output', params: {} }],
        connections: [],
        ui: { layout: 'row', controls: [] },
      }

      expect(() => effectBuilder.buildAudioGraph(definition)).toThrow(
        'Effect definition must have input and output nodes'
      )
    })

    it('should throw if output node is missing', () => {
      const definition: EffectDefinition = {
        id: 'bad',
        name: 'Bad',
        description: 'Missing output',
        prompt: 'bad',
        nodes: [{ id: 'input', type: 'input', params: {} }],
        connections: [],
        ui: { layout: 'row', controls: [] },
      }

      expect(() => effectBuilder.buildAudioGraph(definition)).toThrow(
        'Effect definition must have input and output nodes'
      )
    })
  })

  describe('destroyGraph', () => {
    it('should clean up all nodes', () => {
      const definition = createSimpleDelay()
      effectBuilder.buildAudioGraph(definition)

      effectBuilder.destroyGraph()

      expect(effectBuilder.getInputNode()).toBeNull()
      expect(effectBuilder.getOutputNode()).toBeNull()
    })
  })

  describe('createNode types', () => {
    it('should create all supported node types', () => {
      const nodeTypes = [
        'input',
        'output',
        'gain',
        'delay',
        'reverb',
        'filter',
        'distortion',
        'compressor',
        'chorus',
        'tremolo',
        'panner',
      ]

      for (const type of nodeTypes) {
        const definition: EffectDefinition = {
          id: `test-${type}`,
          name: `Test ${type}`,
          description: `Testing ${type} node`,
          prompt: type,
          nodes: [
            { id: 'input', type: 'input', params: {} },
            { id: `node-${type}`, type, params: {} },
            { id: 'output', type: 'output', params: {} },
          ],
          connections: [
            {
              from: { nodeId: 'input', output: 'default' },
              to: { nodeId: `node-${type}`, input: 'default' },
            },
            {
              from: { nodeId: `node-${type}`, output: 'default' },
              to: { nodeId: 'output', input: 'default' },
            },
          ],
          ui: { layout: 'row', controls: [] },
        }

        expect(() => effectBuilder.buildAudioGraph(definition)).not.toThrow()
        effectBuilder.destroyGraph()
      }
    })
  })

  describe('updateParameter', () => {
    it('should update delay parameters', () => {
      const definition = createSimpleDelay()
      effectBuilder.buildAudioGraph(definition)

      // Should not throw
      expect(() => effectBuilder.updateParameter('delay1', 'time', 500)).not.toThrow()
      expect(() => effectBuilder.updateParameter('delay1', 'feedback', 0.7)).not.toThrow()
      expect(() => effectBuilder.updateParameter('delay1', 'mix', 0.8)).not.toThrow()
    })

    it('should warn when node not found', () => {
      const definition = createSimpleDelay()
      effectBuilder.buildAudioGraph(definition)

      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      effectBuilder.updateParameter('nonexistent', 'param', 0.5)

      expect(warnSpy).toHaveBeenCalledWith('Node not found: nonexistent')
      warnSpy.mockRestore()
    })
  })
})
