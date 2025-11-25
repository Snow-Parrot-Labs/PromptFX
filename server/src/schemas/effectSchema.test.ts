import { describe, it, expect } from 'vitest'
import {
  dspNodeSchema,
  connectionSchema,
  uiControlSchema,
  effectDefinitionSchema,
} from './effectSchema.js'

describe('effectSchema', () => {
  describe('dspNodeSchema', () => {
    it('should validate a valid input node', () => {
      const node = { id: 'input', type: 'input', params: {} }
      const result = dspNodeSchema.safeParse(node)
      expect(result.success).toBe(true)
    })

    it('should validate a delay node with params', () => {
      const node = {
        id: 'delay1',
        type: 'delay',
        params: { time: 300, feedback: 0.5, mix: 0.5 },
      }
      const result = dspNodeSchema.safeParse(node)
      expect(result.success).toBe(true)
    })

    it('should reject invalid node type', () => {
      const node = { id: 'test', type: 'invalid-type', params: {} }
      const result = dspNodeSchema.safeParse(node)
      expect(result.success).toBe(false)
    })

    it('should reject empty id', () => {
      const node = { id: '', type: 'input', params: {} }
      const result = dspNodeSchema.safeParse(node)
      expect(result.success).toBe(false)
    })
  })

  describe('connectionSchema', () => {
    it('should validate a valid connection', () => {
      const connection = {
        from: { nodeId: 'input' },
        to: { nodeId: 'delay1' },
      }
      const result = connectionSchema.safeParse(connection)
      expect(result.success).toBe(true)
    })

    it('should validate connection with optional output/input', () => {
      const connection = {
        from: { nodeId: 'input', output: 0 },
        to: { nodeId: 'delay1', input: 0 },
      }
      const result = connectionSchema.safeParse(connection)
      expect(result.success).toBe(true)
    })
  })

  describe('uiControlSchema', () => {
    it('should validate a knob control', () => {
      const control = {
        id: 'delay-time',
        type: 'knob',
        label: 'Delay Time',
        binding: { nodeId: 'delay1', param: 'time' },
        config: { min: 10, max: 1000, default: 300, unit: 'ms' },
      }
      const result = uiControlSchema.safeParse(control)
      expect(result.success).toBe(true)
    })

    it('should validate a switch control', () => {
      const control = {
        id: 'bypass',
        type: 'switch',
        label: 'Bypass',
        binding: { nodeId: 'effect', param: 'bypass' },
        config: { default: false, onLabel: 'On', offLabel: 'Off' },
      }
      const result = uiControlSchema.safeParse(control)
      expect(result.success).toBe(true)
    })

    it('should validate a select control', () => {
      const control = {
        id: 'filter-type',
        type: 'select',
        label: 'Filter Type',
        binding: { nodeId: 'filter1', param: 'type' },
        config: {
          options: [
            { value: 'lowpass', label: 'Low Pass' },
            { value: 'highpass', label: 'High Pass' },
          ],
          default: 'lowpass',
        },
      }
      const result = uiControlSchema.safeParse(control)
      expect(result.success).toBe(true)
    })

    it('should reject empty label', () => {
      const control = {
        id: 'test',
        type: 'knob',
        label: '',
        binding: { nodeId: 'node', param: 'param' },
        config: { min: 0, max: 1, default: 0.5 },
      }
      const result = uiControlSchema.safeParse(control)
      expect(result.success).toBe(false)
    })
  })

  describe('effectDefinitionSchema', () => {
    const validEffect = {
      id: 'test-effect',
      name: 'Test Effect',
      description: 'A test effect',
      prompt: 'simple delay',
      version: '1.0.0',
      nodes: [
        { id: 'input', type: 'input', params: {} },
        { id: 'delay1', type: 'delay', params: { time: 300, feedback: 0.5 } },
        { id: 'output', type: 'output', params: {} },
      ],
      connections: [
        { from: { nodeId: 'input' }, to: { nodeId: 'delay1' } },
        { from: { nodeId: 'delay1' }, to: { nodeId: 'output' } },
      ],
      ui: {
        layout: 'horizontal',
        controls: [
          {
            id: 'time',
            type: 'knob',
            label: 'Time',
            binding: { nodeId: 'delay1', param: 'time' },
            config: { min: 10, max: 1000, default: 300, unit: 'ms' },
          },
        ],
      },
      metadata: {
        createdAt: new Date().toISOString(),
        generationTimeMs: 1500,
        aiModel: 'claude-3-sonnet',
      },
    }

    it('should validate a complete effect definition', () => {
      const result = effectDefinitionSchema.safeParse(validEffect)
      expect(result.success).toBe(true)
    })

    it('should reject effect with less than 2 nodes', () => {
      const invalid = {
        ...validEffect,
        nodes: [{ id: 'input', type: 'input', params: {} }],
      }
      const result = effectDefinitionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject effect with name over 100 chars', () => {
      const invalid = {
        ...validEffect,
        name: 'a'.repeat(101),
      }
      const result = effectDefinitionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject effect with description over 500 chars', () => {
      const invalid = {
        ...validEffect,
        description: 'a'.repeat(501),
      }
      const result = effectDefinitionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })

    it('should reject effect with invalid layout', () => {
      const invalid = {
        ...validEffect,
        ui: { ...validEffect.ui, layout: 'invalid' },
      }
      const result = effectDefinitionSchema.safeParse(invalid)
      expect(result.success).toBe(false)
    })
  })
})
