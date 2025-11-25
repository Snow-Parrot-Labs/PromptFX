import * as Tone from 'tone'
import type { EffectDefinition, DSPNode, Connection } from '@/types/effect'

type ToneNode = Tone.ToneAudioNode

interface NodeInstance {
  node: ToneNode
  type: string
}

class EffectBuilder {
  private nodes: Map<string, NodeInstance> = new Map()
  private inputNode: Tone.Gain | null = null
  private outputNode: Tone.Gain | null = null

  getInputNode(): Tone.Gain | null {
    return this.inputNode
  }

  getOutputNode(): Tone.Gain | null {
    return this.outputNode
  }

  buildAudioGraph(definition: EffectDefinition): { input: Tone.Gain; output: Tone.Gain } {
    // Cleanup existing graph
    this.destroyGraph()

    // Create nodes
    for (const nodeDef of definition.nodes) {
      const node = this.createNode(nodeDef)
      if (node !== null) {
        this.nodes.set(nodeDef.id, { node, type: nodeDef.type })
      }
    }

    // Create connections
    for (const connection of definition.connections) {
      this.connectNodes(connection)
    }

    // Get input and output nodes
    const inputInstance = this.nodes.get('input')
    const outputInstance = this.nodes.get('output')

    if (inputInstance === undefined || outputInstance === undefined) {
      throw new Error('Effect definition must have input and output nodes')
    }

    this.inputNode = inputInstance.node as Tone.Gain
    this.outputNode = outputInstance.node as Tone.Gain

    return { input: this.inputNode, output: this.outputNode }
  }

  private createNode(nodeDef: DSPNode): ToneNode | null {
    const { type, params } = nodeDef

    switch (type) {
      case 'input':
        return new Tone.Gain(1)

      case 'output':
        return new Tone.Gain(1)

      case 'gain':
        return new Tone.Gain(Tone.dbToGain(Number(params.gain ?? 0)))

      case 'delay': {
        const delay = new Tone.FeedbackDelay({
          delayTime: Number(params.time ?? 300) / 1000,
          feedback: Number(params.feedback ?? 0.3),
        })
        if (params.mix !== undefined) {
          delay.wet.value = Number(params.mix)
        }
        return delay
      }

      case 'reverb': {
        const reverb = new Tone.Reverb({
          decay: Number(params.decay ?? 2),
          preDelay: Number(params.preDelay ?? 10) / 1000,
        })
        if (params.mix !== undefined) {
          reverb.wet.value = Number(params.mix)
        }
        return reverb
      }

      case 'filter': {
        const filterType = String(params.type ?? 'lowpass') as BiquadFilterType
        return new Tone.Filter({
          frequency: Number(params.frequency ?? 1000),
          type: filterType,
          Q: Number(params.Q ?? 1),
        })
      }

      case 'distortion': {
        const distType = String(params.type ?? 'soft')
        if (distType === 'bitcrush') {
          return new Tone.BitCrusher({
            bits: Math.max(1, Math.round(16 - Number(params.amount ?? 0.5) * 14)),
          })
        }
        const distortion = new Tone.Distortion({
          distortion: Number(params.amount ?? 0.5),
          oversample: distType === 'hard' ? '4x' : '2x',
        })
        if (params.mix !== undefined) {
          distortion.wet.value = Number(params.mix)
        }
        return distortion
      }

      case 'compressor':
        return new Tone.Compressor({
          threshold: Number(params.threshold ?? -24),
          ratio: Number(params.ratio ?? 4),
          attack: Number(params.attack ?? 10) / 1000,
          release: Number(params.release ?? 200) / 1000,
        })

      case 'chorus': {
        const chorus = new Tone.Chorus({
          frequency: Number(params.rate ?? 1.5),
          depth: Number(params.depth ?? 0.5),
          delayTime: 3.5,
        })
        if (params.mix !== undefined) {
          chorus.wet.value = Number(params.mix)
        }
        return chorus.start()
      }

      case 'tremolo': {
        const shape = String(params.shape ?? 'sine') as 'sine' | 'square' | 'triangle'
        const tremolo = new Tone.Tremolo({
          frequency: Number(params.rate ?? 4),
          depth: Number(params.depth ?? 0.5),
          type: shape,
        })
        return tremolo.start()
      }

      case 'panner':
        return new Tone.Panner(Number(params.pan ?? 0))

      default:
        console.warn(`Unknown node type: ${type as string}`)
        return null
    }
  }

  private connectNodes(connection: Connection): void {
    const fromInstance = this.nodes.get(connection.from.nodeId)
    const toInstance = this.nodes.get(connection.to.nodeId)

    if (fromInstance === undefined || toInstance === undefined) {
      console.warn(`Connection failed: nodes not found`, connection)
      return
    }

    fromInstance.node.connect(toInstance.node)
  }

  updateParameter(nodeId: string, param: string, value: number | string): void {
    const instance = this.nodes.get(nodeId)
    if (instance === undefined) {
      console.warn(`Node not found: ${nodeId}`)
      return
    }

    const { node, type } = instance
    const rampTime = 0.02 // 20ms for smooth transitions

    switch (type) {
      case 'gain': {
        const gainNode = node as Tone.Gain
        if (param === 'gain') {
          gainNode.gain.rampTo(Tone.dbToGain(Number(value)), rampTime)
        }
        break
      }

      case 'delay': {
        const delay = node as Tone.FeedbackDelay
        if (param === 'time') {
          delay.delayTime.rampTo(Number(value) / 1000, rampTime)
        } else if (param === 'feedback') {
          delay.feedback.rampTo(Number(value), rampTime)
        } else if (param === 'mix') {
          delay.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'reverb': {
        const reverb = node as Tone.Reverb
        if (param === 'mix') {
          reverb.wet.rampTo(Number(value), rampTime)
        }
        // Note: decay and preDelay can't be changed in real-time in Tone.js Reverb
        break
      }

      case 'filter': {
        const filter = node as Tone.Filter
        if (param === 'frequency') {
          filter.frequency.rampTo(Number(value), rampTime)
        } else if (param === 'Q') {
          filter.Q.rampTo(Number(value), rampTime)
        } else if (param === 'type') {
          filter.type = String(value) as BiquadFilterType
        }
        break
      }

      case 'distortion': {
        const distortion = node as Tone.Distortion
        if (param === 'amount') {
          distortion.distortion = Number(value)
        } else if (param === 'mix') {
          distortion.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'compressor': {
        const compressor = node as Tone.Compressor
        if (param === 'threshold') {
          compressor.threshold.rampTo(Number(value), rampTime)
        } else if (param === 'ratio') {
          compressor.ratio.rampTo(Number(value), rampTime)
        } else if (param === 'attack') {
          compressor.attack.rampTo(Number(value) / 1000, rampTime)
        } else if (param === 'release') {
          compressor.release.rampTo(Number(value) / 1000, rampTime)
        }
        break
      }

      case 'chorus': {
        const chorus = node as Tone.Chorus
        if (param === 'rate') {
          chorus.frequency.rampTo(Number(value), rampTime)
        } else if (param === 'depth') {
          chorus.depth = Number(value)
        } else if (param === 'mix') {
          chorus.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'tremolo': {
        const tremolo = node as Tone.Tremolo
        if (param === 'rate') {
          tremolo.frequency.rampTo(Number(value), rampTime)
        } else if (param === 'depth') {
          tremolo.depth.rampTo(Number(value), rampTime)
        } else if (param === 'shape') {
          tremolo.type = String(value) as 'sine' | 'square' | 'triangle'
        }
        break
      }

      case 'panner': {
        const panner = node as Tone.Panner
        if (param === 'pan') {
          panner.pan.rampTo(Number(value), rampTime)
        }
        break
      }
    }
  }

  destroyGraph(): void {
    for (const [, instance] of this.nodes) {
      instance.node.dispose()
    }
    this.nodes.clear()
    this.inputNode = null
    this.outputNode = null
  }
}

// Singleton instance
export const effectBuilder = new EffectBuilder()
