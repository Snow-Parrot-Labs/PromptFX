import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { usePresets } from './usePresets'
import type { EffectDefinition } from '@/types/effect'

const mockEffect: EffectDefinition = {
  id: 'test-effect',
  name: 'Test Effect',
  description: 'A test effect',
  prompt: 'test prompt',
  nodes: [
    { id: 'input', type: 'input', params: {} },
    { id: 'output', type: 'output', params: {} },
  ],
  connections: [],
  ui: { layout: 'row', controls: [] },
}

const mockParams = { 'node.param': 0.5 }

describe('usePresets', () => {
  beforeEach(() => {
    // Clear localStorage mock
    vi.mocked(localStorage.getItem).mockReturnValue(null)
    vi.mocked(localStorage.setItem).mockClear()
  })

  describe('initial state', () => {
    it('should return empty presets array initially', () => {
      const { result } = renderHook(() => usePresets())
      expect(result.current.presets).toEqual([])
    })

    it('should load presets from localStorage', () => {
      const savedPresets = [
        {
          id: 'preset-1',
          name: 'Saved Preset',
          createdAt: new Date().toISOString(),
          effect: mockEffect,
          parameterValues: mockParams,
        },
      ]
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedPresets))

      const { result } = renderHook(() => usePresets())
      expect(result.current.presets).toHaveLength(1)
      expect(result.current.presets[0].name).toBe('Saved Preset')
    })
  })

  describe('savePreset', () => {
    it('should save a new preset', () => {
      const { result } = renderHook(() => usePresets())

      act(() => {
        result.current.savePreset('My Preset', mockEffect, mockParams)
      })

      expect(result.current.presets).toHaveLength(1)
      expect(result.current.presets[0].name).toBe('My Preset')
      expect(localStorage.setItem).toHaveBeenCalled()
    })

    it('should generate unique IDs', () => {
      const { result } = renderHook(() => usePresets())

      act(() => {
        result.current.savePreset('Preset 1', mockEffect, mockParams)
        result.current.savePreset('Preset 2', mockEffect, mockParams)
      })

      expect(result.current.presets[0].id).not.toBe(result.current.presets[1].id)
    })
  })

  describe('deletePreset', () => {
    it('should delete a preset by id', () => {
      const savedPresets = [
        {
          id: 'preset-1',
          name: 'Preset 1',
          createdAt: new Date().toISOString(),
          effect: mockEffect,
          parameterValues: mockParams,
        },
        {
          id: 'preset-2',
          name: 'Preset 2',
          createdAt: new Date().toISOString(),
          effect: mockEffect,
          parameterValues: mockParams,
        },
      ]
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedPresets))

      const { result } = renderHook(() => usePresets())

      act(() => {
        result.current.deletePreset('preset-1')
      })

      expect(result.current.presets).toHaveLength(1)
      expect(result.current.presets[0].id).toBe('preset-2')
    })
  })

  describe('renamePreset', () => {
    it('should rename a preset', () => {
      const savedPresets = [
        {
          id: 'preset-1',
          name: 'Old Name',
          createdAt: new Date().toISOString(),
          effect: mockEffect,
          parameterValues: mockParams,
        },
      ]
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedPresets))

      const { result } = renderHook(() => usePresets())

      act(() => {
        result.current.renamePreset('preset-1', 'New Name')
      })

      expect(result.current.presets[0].name).toBe('New Name')
    })
  })

  describe('loadPreset', () => {
    it('should return preset by id', () => {
      const savedPresets = [
        {
          id: 'preset-1',
          name: 'My Preset',
          createdAt: new Date().toISOString(),
          effect: mockEffect,
          parameterValues: mockParams,
        },
      ]
      vi.mocked(localStorage.getItem).mockReturnValue(JSON.stringify(savedPresets))

      const { result } = renderHook(() => usePresets())
      const preset = result.current.loadPreset('preset-1')

      expect(preset).not.toBeNull()
      expect(preset?.name).toBe('My Preset')
    })

    it('should return null for non-existent id', () => {
      const { result } = renderHook(() => usePresets())
      const preset = result.current.loadPreset('nonexistent')

      expect(preset).toBeNull()
    })
  })

  describe('importPresets', () => {
    it('should import presets from file', async () => {
      const { result } = renderHook(() => usePresets())

      const importData = [
        {
          id: 'imported-1',
          name: 'Imported Preset',
          createdAt: new Date().toISOString(),
          effect: mockEffect,
          parameterValues: mockParams,
        },
      ]

      const file = new File([JSON.stringify(importData)], 'presets.json', {
        type: 'application/json',
      })

      let count = 0
      await act(async () => {
        count = await result.current.importPresets(file)
      })

      expect(count).toBe(1)
      expect(result.current.presets).toHaveLength(1)
    })

    it('should throw on invalid JSON', async () => {
      const { result } = renderHook(() => usePresets())

      const file = new File(['not valid json'], 'presets.json', {
        type: 'application/json',
      })

      await expect(
        act(async () => {
          await result.current.importPresets(file)
        })
      ).rejects.toThrow()
    })
  })
})
