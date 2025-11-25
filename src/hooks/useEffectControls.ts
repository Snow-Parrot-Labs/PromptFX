import { useEffect, useCallback } from 'react'
import { useEffectStore } from '@/stores/effectStore'
import { useAudioStore } from '@/stores/audioStore'
import { effectBuilder } from '@/services/effectBuilder'
import { audioEngine } from '@/services/audioEngine'

export function useEffectControls(): {
  handleParameterChange: (
    controlId: string,
    nodeId: string,
    param: string,
    value: number | string | boolean
  ) => void
  handleRegenerate: () => void
} {
  const { definition, parameterValues, updateParameter, generateEffect, isGenerating } =
    useEffectStore()
  const { bypassEffect } = useAudioStore()

  // Build/rebuild effect graph when definition changes
  useEffect(() => {
    if (definition === null) {
      effectBuilder.destroyGraph()
      return
    }

    try {
      const { input, output } = effectBuilder.buildAudioGraph(definition)

      // Connect to audio engine's effect chain
      audioEngine.connectEffect(input, output)
    } catch (error) {
      console.error('Failed to build effect graph:', error)
    }

    return () => {
      effectBuilder.destroyGraph()
      audioEngine.disconnectEffect()
    }
  }, [definition])

  // Apply bypass state
  useEffect(() => {
    audioEngine.setBypassed(bypassEffect)
  }, [bypassEffect])

  // Apply initial parameter values when effect is built
  useEffect(() => {
    if (definition === null) return

    for (const control of definition.ui.controls) {
      const key = `${control.binding.nodeId}.${control.binding.param}`
      const value = parameterValues[key]
      if (value !== undefined && typeof value !== 'boolean') {
        effectBuilder.updateParameter(control.binding.nodeId, control.binding.param, value)
      }
    }
  }, [definition, parameterValues])

  const handleParameterChange = useCallback(
    (_controlId: string, nodeId: string, param: string, value: number | string | boolean): void => {
      // Update store
      const key = `${nodeId}.${param}`
      updateParameter(key, value)

      // Update audio (only for numeric/string values, not booleans)
      if (typeof value !== 'boolean') {
        effectBuilder.updateParameter(nodeId, param, value)
      }
    },
    [updateParameter]
  )

  const handleRegenerate = useCallback((): void => {
    if (definition !== null && !isGenerating) {
      void generateEffect(definition.prompt)
    }
  }, [definition, isGenerating, generateEffect])

  return {
    handleParameterChange,
    handleRegenerate,
  }
}
