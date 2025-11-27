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

      case 'stereoWidener':
        return new Tone.StereoWidener({
          width: Number(params.width ?? 0.5),
        })

      case 'phaser': {
        const phaser = new Tone.Phaser({
          frequency: Number(params.rate ?? 0.5),
          octaves: Number(params.octaves ?? 3),
          baseFrequency: Number(params.baseFrequency ?? 350),
          Q: Number(params.Q ?? 10),
        })
        if (params.mix !== undefined) {
          phaser.wet.value = Number(params.mix)
        }
        return phaser
      }

      case 'autoFilter': {
        const autoFilter = new Tone.AutoFilter({
          frequency: Number(params.rate ?? 1),
          depth: Number(params.depth ?? 1),
          baseFrequency: Number(params.baseFrequency ?? 200),
          octaves: Number(params.octaves ?? 2.6),
          type: String(params.shape ?? 'sine') as 'sine' | 'square' | 'triangle',
        })
        if (params.mix !== undefined) {
          autoFilter.wet.value = Number(params.mix)
        }
        return autoFilter.start()
      }

      case 'autoPanner': {
        const autoPanner = new Tone.AutoPanner({
          frequency: Number(params.rate ?? 1),
          depth: Number(params.depth ?? 1),
          type: String(params.shape ?? 'sine') as 'sine' | 'square' | 'triangle',
        })
        if (params.mix !== undefined) {
          autoPanner.wet.value = Number(params.mix)
        }
        return autoPanner.start()
      }

      case 'autoWah': {
        const autoWah = new Tone.AutoWah({
          baseFrequency: Number(params.baseFrequency ?? 100),
          octaves: Number(params.octaves ?? 6),
          sensitivity: Number(params.sensitivity ?? 0),
          Q: Number(params.Q ?? 2),
          gain: Number(params.gain ?? 2),
        })
        if (params.mix !== undefined) {
          autoWah.wet.value = Number(params.mix)
        }
        return autoWah
      }

      case 'freeverb': {
        const freeverb = new Tone.Freeverb({
          roomSize: Number(params.roomSize ?? 0.7),
          dampening: Number(params.dampening ?? 3000),
        })
        if (params.mix !== undefined) {
          freeverb.wet.value = Number(params.mix)
        }
        return freeverb
      }

      case 'pitchShift': {
        const pitchShift = new Tone.PitchShift({
          pitch: Number(params.pitch ?? 0),
          windowSize: Number(params.windowSize ?? 0.1),
          delayTime: Number(params.delayTime ?? 0),
        })
        if (params.mix !== undefined) {
          pitchShift.wet.value = Number(params.mix)
        }
        return pitchShift
      }

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

      case 'stereoWidener': {
        const stereoWidener = node as Tone.StereoWidener
        if (param === 'width') {
          stereoWidener.width.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'phaser': {
        const phaser = node as Tone.Phaser
        if (param === 'rate') {
          phaser.frequency.rampTo(Number(value), rampTime)
        } else if (param === 'octaves') {
          phaser.octaves = Number(value)
        } else if (param === 'baseFrequency') {
          phaser.baseFrequency = Number(value)
        } else if (param === 'Q') {
          phaser.Q.rampTo(Number(value), rampTime)
        } else if (param === 'mix') {
          phaser.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'autoFilter': {
        const autoFilter = node as Tone.AutoFilter
        if (param === 'rate') {
          autoFilter.frequency.rampTo(Number(value), rampTime)
        } else if (param === 'depth') {
          autoFilter.depth.rampTo(Number(value), rampTime)
        } else if (param === 'baseFrequency') {
          autoFilter.baseFrequency = Number(value)
        } else if (param === 'octaves') {
          autoFilter.octaves = Number(value)
        } else if (param === 'shape') {
          autoFilter.type = String(value) as 'sine' | 'square' | 'triangle'
        } else if (param === 'mix') {
          autoFilter.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'autoPanner': {
        const autoPanner = node as Tone.AutoPanner
        if (param === 'rate') {
          autoPanner.frequency.rampTo(Number(value), rampTime)
        } else if (param === 'depth') {
          autoPanner.depth.rampTo(Number(value), rampTime)
        } else if (param === 'shape') {
          autoPanner.type = String(value) as 'sine' | 'square' | 'triangle'
        } else if (param === 'mix') {
          autoPanner.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'autoWah': {
        const autoWah = node as Tone.AutoWah
        if (param === 'baseFrequency') {
          autoWah.baseFrequency = Number(value)
        } else if (param === 'octaves') {
          autoWah.octaves = Number(value)
        } else if (param === 'sensitivity') {
          autoWah.sensitivity = Number(value)
        } else if (param === 'Q') {
          autoWah.Q.rampTo(Number(value), rampTime)
        } else if (param === 'gain') {
          autoWah.gain.rampTo(Number(value), rampTime)
        } else if (param === 'mix') {
          autoWah.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'freeverb': {
        const freeverb = node as Tone.Freeverb
        if (param === 'roomSize') {
          freeverb.roomSize.rampTo(Number(value), rampTime)
        } else if (param === 'dampening') {
          freeverb.dampening = Number(value)
        } else if (param === 'mix') {
          freeverb.wet.rampTo(Number(value), rampTime)
        }
        break
      }

      case 'pitchShift': {
        const pitchShift = node as Tone.PitchShift
        if (param === 'pitch') {
          pitchShift.pitch = Number(value)
        } else if (param === 'windowSize') {
          pitchShift.windowSize = Number(value)
        } else if (param === 'delayTime') {
          pitchShift.delayTime = Number(value)
        } else if (param === 'mix') {
          pitchShift.wet.rampTo(Number(value), rampTime)
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
