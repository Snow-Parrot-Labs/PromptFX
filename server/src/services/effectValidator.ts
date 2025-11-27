import type { EffectDefinition, DSPNode } from '../schemas/effectSchema.js'

export interface EffectQualityCheck {
  passed: boolean
  warnings: string[]
  suggestions: string[]
}

/**
 * Validates effect quality based on audio engineering best practices
 * Checks parameter wisdom, effect ordering, and technical correctness
 */
export function validateEffectQuality(effect: EffectDefinition): EffectQualityCheck {
  const warnings: string[] = []
  const suggestions: string[] = []

  // Build node map for easy lookup
  const nodeMap = new Map<string, DSPNode>()
  for (const node of effect.nodes) {
    nodeMap.set(node.id, node)
  }

  // Check 1: Effect chain ordering
  checkEffectChainOrdering(effect, nodeMap, warnings, suggestions)

  // Check 2: Parameter sweet spots
  checkParameterSweetSpots(effect.nodes, warnings, suggestions)

  // Check 3: Gain staging
  checkGainStaging(effect, nodeMap, warnings, suggestions)

  // Check 4: Frequency conflicts
  checkFrequencyConflicts(effect.nodes, warnings, suggestions)

  // Check 5: Mix/feedback relationships
  checkMixFeedbackRelationships(effect.nodes, warnings, suggestions)

  // Check 6: Control diversity
  checkControlDiversity(effect, warnings, suggestions)

  return {
    passed: warnings.length === 0,
    warnings,
    suggestions,
  }
}

/**
 * Check if effects are in proper order (dynamics → EQ → modulation → time → space)
 */
function checkEffectChainOrdering(
  effect: EffectDefinition,
  nodeMap: Map<string, DSPNode>,
  warnings: string[],
  suggestions: string[]
): void {
  // Build ordered chain from connections
  const chain: DSPNode[] = []
  const connections = effect.connections

  // Find input node
  const inputNode = nodeMap.get('input')
  if (!inputNode) return

  // Trace the chain
  let currentNodeId = 'input'
  const visited = new Set<string>()

  while (currentNodeId && currentNodeId !== 'output' && !visited.has(currentNodeId)) {
    visited.add(currentNodeId)
    const node = nodeMap.get(currentNodeId)
    if (node && node.type !== 'input') {
      chain.push(node)
    }

    // Find next connection
    const nextConnection = connections.find((c) => c.from.nodeId === currentNodeId)
    currentNodeId = nextConnection?.to.nodeId || ''
  }

  // Check for reverb before other effects
  const reverbIndex = chain.findIndex((n) => n.type === 'freeverb')
  const filterAfterReverb = chain.slice(reverbIndex + 1).some((n) => n.type === 'filter')
  const distortionAfterReverb = chain.slice(reverbIndex + 1).some((n) => n.type === 'distortion')

  if (reverbIndex >= 0 && reverbIndex < chain.length - 1) {
    if (filterAfterReverb) {
      warnings.push('Reverb appears before filter - may sound muddy (bass frequencies get reverb)')
      suggestions.push('Move filter nodes before reverb for cleaner sound')
    }
    if (distortionAfterReverb) {
      warnings.push('Reverb before distortion - creates gritty spatial effect (may be intentional)')
    }
  }

  // Check for compression after distortion
  const distortionIndex = chain.findIndex((n) => n.type === 'distortion')
  const compressorAfterDistortion = chain
    .slice(distortionIndex + 1)
    .some((n) => n.type === 'compressor')

  if (distortionIndex >= 0 && compressorAfterDistortion) {
    warnings.push('Compressor after distortion - amplifies noise and harshness')
    suggestions.push('Move compressor before distortion for cleaner dynamics control')
  }
}

/**
 * Check if parameters are in safe/musical ranges
 */
function checkParameterSweetSpots(
  nodes: DSPNode[],
  warnings: string[],
  suggestions: string[]
): void {
  for (const node of nodes) {
    const params = node.params

    switch (node.type) {
      case 'delay': {
        const feedback = Number(params.feedback ?? 0)
        const time = Number(params.time ?? 0)
        const mix = Number(params.mix ?? 0)

        // Check feedback safety
        if (feedback > 0.85) {
          warnings.push(
            `Delay feedback is very high (${feedback.toFixed(2)}) - may cause runaway feedback`
          )
          suggestions.push('Reduce delay feedback to 0.6-0.8 range for safety')
        }

        // Check for awkward delay times
        if (time > 150 && time < 200) {
          warnings.push(`Delay time ${time}ms is in awkward range - not slapback, not rhythmic`)
          suggestions.push('Use <150ms for slapback or >200ms for rhythmic delay')
        }

        // Check delay time is somewhat musical (divisible by common note values at 120 BPM)
        const musicalTimes = [125, 167, 188, 250, 333, 375, 500, 667, 750, 1000, 1333, 1500] // Common subdivisions at 120 BPM
        const isMusical = musicalTimes.some((t) => Math.abs(time - t) < 25)
        if (time > 200 && !isMusical) {
          suggestions.push(
            `Delay time ${time}ms may not be rhythmic - consider tempo-synced values like 375ms (dotted 8th) or 500ms (quarter note)`
          )
        }

        // Check mix vs feedback balance
        if (feedback > 0.7 && mix > 0.5) {
          warnings.push('High delay feedback + high mix = muddy, indistinct sound')
          suggestions.push('With high feedback, reduce mix to 0.2-0.3')
        }
        break
      }

      case 'freeverb': {
        const roomSize = Number(params.roomSize ?? 0.5)
        const mix = Number(params.mix ?? 0.3)

        // Check roomSize vs mix balance
        if (roomSize > 0.8 && mix > 0.5) {
          warnings.push('Large reverb roomSize + high mix = drowning in reverb')
          suggestions.push('With large roomSize (>0.8), keep mix under 0.3')
        }
        break
      }

      case 'filter': {
        const frequency = Number(params.frequency ?? 1000)
        const Q = Number(params.Q ?? 1)

        // Check for dangerous high Q at low frequencies
        if (Q > 15 && frequency < 100) {
          warnings.push(
            `High Q (${Q.toFixed(1)}) at low frequency (${frequency}Hz) can cause loud resonant peak and clipping`
          )
          suggestions.push('Reduce Q to <10 for low frequencies, or raise frequency above 200Hz')
        }
        break
      }

      case 'compressor': {
        const threshold = Number(params.threshold ?? -24)
        const ratio = Number(params.ratio ?? 4)
        const attack = Number(params.attack ?? 10)

        // Check for extreme over-compression
        if (threshold < -35 && ratio > 8) {
          warnings.push(
            `Very low threshold (${threshold}dB) + high ratio (${ratio}:1) = extreme over-compression`
          )
          suggestions.push('Raise threshold to -25dB or lower ratio to 6:1')
        }

        // Check for pumping artifacts
        if (attack < 5 && ratio > 8) {
          warnings.push('Very fast attack + high ratio = potential pumping artifacts')
          suggestions.push('Increase attack to 10-30ms for more natural compression')
        }
        break
      }

      case 'distortion': {
        const amount = Number(params.amount ?? 0.5)

        if (amount > 0.85) {
          suggestions.push(
            'Very high distortion amount - consider adding gain nodes for level control'
          )
        }
        break
      }

      case 'chorus':
      case 'tremolo':
      case 'phaser': {
        const rate = Number(params.rate ?? 1)
        const depth = Number(params.depth ?? 0.5)

        // Check for disorienting modulation
        if (rate > 7 && depth > 0.8) {
          warnings.push('Very high modulation rate + depth = disorienting, chaotic effect')
          suggestions.push('Reduce either rate (<6Hz) or depth (<0.7) for more musical modulation')
        }
        break
      }
    }
  }
}

/**
 * Check if gain staging is appropriate (especially with distortion)
 */
function checkGainStaging(
  effect: EffectDefinition,
  nodeMap: Map<string, DSPNode>,
  warnings: string[],
  suggestions: string[]
): void {
  const hasDistortion = effect.nodes.some((n) => n.type === 'distortion')
  const distortionNodes = effect.nodes.filter((n) => n.type === 'distortion')
  const hasGainControl = effect.nodes.some((n) => n.type === 'gain')

  // Check for heavy distortion without gain control
  for (const distNode of distortionNodes) {
    const amount = Number(distNode.params.amount ?? 0.5)
    if (amount > 0.6 && !hasGainControl) {
      suggestions.push(
        'Heavy distortion detected - consider adding gain nodes for level control to prevent clipping'
      )
      break
    }
  }
}

/**
 * Check for frequency conflicts (e.g., long reverb without bass filtering)
 */
function checkFrequencyConflicts(
  nodes: DSPNode[],
  warnings: string[],
  suggestions: string[]
): void {
  const hasLongReverb = nodes.some(
    (n) => n.type === 'freeverb' && Number(n.params.roomSize ?? 0) > 0.8
  )
  const hasLowFreqFilter = nodes.some(
    (n) =>
      n.type === 'filter' &&
      n.params.type === 'highpass' &&
      Number(n.params.frequency ?? 20000) < 200
  )

  if (hasLongReverb && !hasLowFreqFilter) {
    suggestions.push(
      'Long reverb without bass filtering may sound muddy - consider adding highpass filter (80-120Hz)'
    )
  }

  // Check for multiple time-based effects with high mix
  const delayNodes = nodes.filter((n) => n.type === 'delay')
  const reverbNodes = nodes.filter((n) => n.type === 'freeverb')

  if (delayNodes.length > 0 && reverbNodes.length > 0) {
    const highMixDelay = delayNodes.some((n) => Number(n.params.mix ?? 0) > 0.5)
    const highMixReverb = reverbNodes.some((n) => Number(n.params.mix ?? 0) > 0.5)

    if (highMixDelay && highMixReverb) {
      warnings.push('Delay + reverb both with high mix = muddy, indistinct sound')
      suggestions.push('With both delay and reverb, keep mix values moderate (0.2-0.35)')
    }
  }
}

/**
 * Check mix vs feedback relationships for time-based effects
 */
function checkMixFeedbackRelationships(
  nodes: DSPNode[],
  warnings: string[],
  suggestions: string[]
): void {
  // Already covered in checkParameterSweetSpots for delay
  // This function can be extended for other effects in the future
}

/**
 * Check control type diversity - warn if too homogeneous
 */
function checkControlDiversity(
  effect: EffectDefinition,
  warnings: string[],
  suggestions: string[]
): void {
  const controls = effect.ui.controls
  const totalControls = controls.length

  if (totalControls < 3) return // Small effects are OK

  // Count control types
  const typeCounts: Record<string, number> = {}
  for (const control of controls) {
    typeCounts[control.type] = (typeCounts[control.type] || 0) + 1
  }

  const uniqueTypes = Object.keys(typeCounts).length

  // Check if complex effects use only 1-2 control types
  if (totalControls >= 4 && uniqueTypes < 3) {
    warnings.push(
      `Control variety: Complex effect (${totalControls} controls) uses only ${uniqueTypes} control type(s) - lacks variety for professional aesthetic`
    )
    suggestions.push(
      'Professional effects use 3+ control types: knobs for parameters, faders for levels/mix, switches for modes, selects for multi-option parameters'
    )
  }

  // Check if one type dominates (>70%)
  for (const [type, count] of Object.entries(typeCounts)) {
    const percentage = (count / totalControls) * 100

    if (percentage > 70 && totalControls >= 4) {
      warnings.push(
        `Control variety: Effect uses ${count}/${totalControls} ${type} controls (${percentage.toFixed(0)}%) - too homogeneous`
      )

      // Suggest alternatives based on what's overused
      if (type === 'knob') {
        suggestions.push(
          'Consider using vertical faders (sliders with orientation: vertical) for mix/level parameters and switches for mode toggles'
        )
      } else if (type === 'slider') {
        suggestions.push(
          'Consider using knobs for frequency/time parameters and switches for on/off states'
        )
      }
    }
  }

  // Check for missing fader on mix parameter
  const mixControls = controls.filter((c) => {
    const label = c.label.toLowerCase()
    return (
      label.includes('mix') ||
      label.includes('wet') ||
      label.includes('dry') ||
      label.includes('blend')
    )
  })

  const mixFaders = mixControls.filter((c) => c.type === 'slider')

  if (mixControls.length > 0 && mixFaders.length === 0) {
    suggestions.push(
      'Professional convention: Mix/wet/dry parameters should use vertical faders (sliders with orientation: vertical), not knobs'
    )
  }

  // Check for level parameters not using faders
  const levelControls = controls.filter((c) => {
    const label = c.label.toLowerCase()
    return (
      label.includes('level') ||
      label.includes('output') ||
      label.includes('input') ||
      label.includes('drive') ||
      label.includes('gain')
    )
  })

  const levelFaders = levelControls.filter((c) => c.type === 'slider')

  if (levelControls.length > 0 && levelFaders.length === 0) {
    suggestions.push(
      'Professional convention: Level/output/input parameters should use vertical faders like mixing consoles'
    )
  }
}
