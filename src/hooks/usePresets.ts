import { useState, useEffect, useCallback } from 'react'
import type { EffectDefinition } from '@/types/effect'

const PRESETS_STORAGE_KEY = 'promptfx_presets'

export interface Preset {
  id: string
  name: string
  createdAt: string
  effect: EffectDefinition
  parameterValues: Record<string, number | string | boolean>
}

interface UsePresetsReturn {
  presets: Preset[]
  savePreset: (
    name: string,
    effect: EffectDefinition,
    parameterValues: Record<string, number | string | boolean>
  ) => Preset
  loadPreset: (id: string) => Preset | null
  deletePreset: (id: string) => void
  renamePreset: (id: string, newName: string) => void
  exportPreset: (id: string) => void
  exportAllPresets: () => void
  importPresets: (file: File) => Promise<number>
}

function loadPresetsFromStorage(): Preset[] {
  const stored = localStorage.getItem(PRESETS_STORAGE_KEY)
  if (stored !== null) {
    try {
      return JSON.parse(stored) as Preset[]
    } catch {
      console.error('Failed to parse stored presets')
    }
  }
  return []
}

export function usePresets(): UsePresetsReturn {
  const [presets, setPresets] = useState<Preset[]>(loadPresetsFromStorage)

  // Save presets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(PRESETS_STORAGE_KEY, JSON.stringify(presets))
  }, [presets])

  const savePreset = useCallback(
    (
      name: string,
      effect: EffectDefinition,
      parameterValues: Record<string, number | string | boolean>
    ): Preset => {
      const preset: Preset = {
        id: `preset_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`,
        name,
        createdAt: new Date().toISOString(),
        effect,
        parameterValues,
      }

      setPresets((prev) => [...prev, preset])
      return preset
    },
    []
  )

  const loadPreset = useCallback(
    (id: string): Preset | null => {
      return presets.find((p) => p.id === id) ?? null
    },
    [presets]
  )

  const deletePreset = useCallback((id: string): void => {
    setPresets((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const renamePreset = useCallback((id: string, newName: string): void => {
    setPresets((prev) => prev.map((p) => (p.id === id ? { ...p, name: newName } : p)))
  }, [])

  const exportPreset = useCallback(
    (id: string): void => {
      const preset = presets.find((p) => p.id === id)
      if (preset === undefined) return

      const blob = new Blob([JSON.stringify(preset, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${preset.name.replace(/[^a-z0-9]/gi, '_')}.promptfx`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    },
    [presets]
  )

  const exportAllPresets = useCallback((): void => {
    if (presets.length === 0) return

    const blob = new Blob([JSON.stringify(presets, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `promptfx_presets_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [presets])

  const importPresets = useCallback(async (file: File): Promise<number> => {
    const text = await file.text()
    const data = JSON.parse(text) as Preset | Preset[]

    // Handle both single preset and array of presets
    const importedPresets = Array.isArray(data) ? data : [data]

    // Validate and add unique IDs to avoid collisions
    const newPresets = importedPresets.map((p) => ({
      ...p,
      id: `preset_${Date.now().toString()}_${Math.random().toString(36).substring(2, 9)}`,
    }))

    setPresets((prev) => [...prev, ...newPresets])
    return newPresets.length
  }, [])

  return {
    presets,
    savePreset,
    loadPreset,
    deletePreset,
    renamePreset,
    exportPreset,
    exportAllPresets,
    importPresets,
  }
}
