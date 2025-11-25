import * as Tone from 'tone'
import type { AudioFileInfo, WaveformData, TestToneFrequency } from '@/types/audio'
import { AUDIO_CONFIG } from '@/types/audio'

type AudioEngineCallback = {
  onTimeUpdate?: (time: number) => void
  onLevelUpdate?: (
    input: { left: number; right: number },
    output: { left: number; right: number }
  ) => void
  onPlaybackEnd?: () => void
  onError?: (error: Error) => void
}

class AudioEngine {
  private player: Tone.Player | null = null
  private oscillator: Tone.Oscillator | null = null
  private microphoneInput: Tone.UserMedia | null = null
  private inputMeter: Tone.Meter | null = null
  private outputMeter: Tone.Meter | null = null
  private effectsChain: Tone.ToneAudioNode[] = []
  private wetGain: Tone.Gain | null = null
  private dryGain: Tone.Gain | null = null
  private masterGain: Tone.Gain | null = null
  private audioBuffer: Tone.ToneAudioBuffer | null = null
  private isInitialized = false
  private liveInputEnabled = false
  private callbacks: AudioEngineCallback = {}
  private animationFrameId: number | null = null

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Start Tone.js context (must be called from user gesture)
    await Tone.start()

    // Configure context
    Tone.getContext().latencyHint = AUDIO_CONFIG.latencyHint

    // Create metering (smoothing parameter)
    this.inputMeter = new Tone.Meter(0.9)
    this.outputMeter = new Tone.Meter(0.9)

    // Create gain nodes for bypass/wet/dry mixing
    this.dryGain = new Tone.Gain(0)
    this.wetGain = new Tone.Gain(1)
    this.masterGain = new Tone.Gain(1)

    // Connect output chain
    this.wetGain.connect(this.masterGain)
    this.dryGain.connect(this.masterGain)
    this.masterGain.connect(this.outputMeter)
    this.outputMeter.connect(Tone.getDestination())

    this.isInitialized = true
    this.startMetering()
  }

  private startMetering(): void {
    const updateMeters = (): void => {
      if (this.inputMeter && this.outputMeter && this.callbacks.onLevelUpdate) {
        const inputLevel = this.inputMeter.getValue()
        const outputLevel = this.outputMeter.getValue()

        // Meter returns a single value (mono sum)
        const inputVal = typeof inputLevel === 'number' ? inputLevel : -100
        const outputVal = typeof outputLevel === 'number' ? outputLevel : -100

        const inputLevels = {
          left: this.dbToLinear(inputVal),
          right: this.dbToLinear(inputVal),
        }

        const outputLevels = {
          left: this.dbToLinear(outputVal),
          right: this.dbToLinear(outputVal),
        }

        this.callbacks.onLevelUpdate(inputLevels, outputLevels)
      }

      // Update time
      if (this.player && this.callbacks.onTimeUpdate) {
        const currentTime = Tone.getTransport().seconds
        this.callbacks.onTimeUpdate(currentTime)
      }

      this.animationFrameId = requestAnimationFrame(updateMeters)
    }

    updateMeters()
  }

  private dbToLinear(db: number): number {
    // Convert dB to linear scale (0-1), clamped
    const linear = Math.pow(10, db / 20)
    return Math.min(1, Math.max(0, linear))
  }

  async loadAudioFile(file: File): Promise<AudioFileInfo> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // Stop current playback
    this.stop()

    // Dispose old player
    if (this.player) {
      this.player.dispose()
      this.player = null
    }

    // Load file as array buffer
    const arrayBuffer = await file.arrayBuffer()

    // Decode audio
    this.audioBuffer = new Tone.ToneAudioBuffer()
    await this.audioBuffer.load(URL.createObjectURL(new Blob([arrayBuffer])))

    // Create player
    this.player = new Tone.Player(this.audioBuffer)
    this.player.onstop = () => {
      this.callbacks.onPlaybackEnd?.()
    }

    // Connect player through meters and effect chain
    this.connectSource(this.player)

    return {
      name: file.name,
      size: file.size,
      duration: this.audioBuffer.duration,
      sampleRate: this.audioBuffer.sampleRate,
      channels: this.audioBuffer.numberOfChannels,
      format: file.type,
    }
  }

  private connectSource(source: Tone.ToneAudioNode): void {
    if (!this.inputMeter || !this.wetGain || !this.dryGain) return

    // Source -> Input Meter -> Effect Chain -> Wet Gain
    // Source -> Dry Gain (for bypass)
    source.connect(this.inputMeter)

    if (this.effectsChain.length > 0) {
      const firstEffect = this.effectsChain[0]
      const lastEffect = this.effectsChain[this.effectsChain.length - 1]
      if (firstEffect && lastEffect) {
        source.connect(firstEffect)
        lastEffect.connect(this.wetGain)
      }
    } else {
      source.connect(this.wetGain)
    }

    source.connect(this.dryGain)
  }

  play(): void {
    if (!this.player || !this.audioBuffer) return

    if (Tone.getTransport().state !== 'started') {
      this.player.start()
      Tone.getTransport().start()
    }
  }

  pause(): void {
    if (this.player) {
      Tone.getTransport().pause()
    }
  }

  stop(): void {
    if (this.player) {
      this.player.stop()
      Tone.getTransport().stop()
      Tone.getTransport().seconds = 0
    }
  }

  seek(time: number): void {
    if (this.player && this.audioBuffer) {
      const wasPlaying = Tone.getTransport().state === 'started'
      this.player.stop()
      Tone.getTransport().seconds = Math.min(time, this.audioBuffer.duration)
      if (wasPlaying) {
        this.player.start(undefined, time)
      }
    }
  }

  setBypass(bypass: boolean): void {
    if (this.wetGain && this.dryGain) {
      this.wetGain.gain.rampTo(bypass ? 0 : 1, 0.01)
      this.dryGain.gain.rampTo(bypass ? 1 : 0, 0.01)
    }
  }

  // Test tone methods
  startTestTone(frequency: TestToneFrequency): void {
    if (!this.isInitialized) return

    this.stopTestTone()

    this.oscillator = new Tone.Oscillator({
      frequency,
      type: 'sine',
    })

    this.connectSource(this.oscillator)
    this.oscillator.start()
  }

  stopTestTone(): void {
    if (this.oscillator) {
      this.oscillator.stop()
      this.oscillator.dispose()
      this.oscillator = null
    }
  }

  setTestToneFrequency(frequency: TestToneFrequency): void {
    if (this.oscillator) {
      this.oscillator.frequency.rampTo(frequency, 0.01)
    }
  }

  // Waveform data extraction
  getWaveformData(): WaveformData | null {
    if (!this.audioBuffer) return null

    const channelData = this.audioBuffer.getChannelData(0)
    const samples = 200 // Number of peaks to display
    const blockSize = Math.floor(channelData.length / samples)
    const peaks = new Float32Array(samples)

    for (let i = 0; i < samples; i++) {
      let max = 0
      for (let j = 0; j < blockSize; j++) {
        const value = Math.abs(channelData[i * blockSize + j] ?? 0)
        if (value > max) max = value
      }
      peaks[i] = max
    }

    return {
      peaks,
      length: samples,
      duration: this.audioBuffer.duration,
    }
  }

  getDuration(): number {
    return this.audioBuffer?.duration ?? 0
  }

  getCurrentTime(): number {
    return Tone.getTransport().seconds
  }

  isPlaying(): boolean {
    return Tone.getTransport().state === 'started'
  }

  // Effect chain management
  private effectInput: Tone.Gain | null = null
  private effectOutput: Tone.Gain | null = null

  setEffectsChain(effects: Tone.ToneAudioNode[]): void {
    // Disconnect current chain
    this.effectsChain.forEach((effect) => effect.disconnect())
    this.effectsChain = effects

    // Reconnect source if player exists
    if (this.player) {
      this.player.disconnect()
      this.connectSource(this.player)
    }

    if (this.oscillator) {
      this.oscillator.disconnect()
      this.connectSource(this.oscillator)
    }
  }

  clearEffectsChain(): void {
    this.setEffectsChain([])
  }

  connectEffect(input: Tone.Gain, output: Tone.Gain): void {
    this.effectInput = input
    this.effectOutput = output
    this.setEffectsChain([input, output])
  }

  disconnectEffect(): void {
    if (this.effectInput !== null) {
      this.effectInput.disconnect()
    }
    if (this.effectOutput !== null) {
      this.effectOutput.disconnect()
    }
    this.effectInput = null
    this.effectOutput = null
    this.clearEffectsChain()
  }

  setBypassed(bypass: boolean): void {
    this.setBypass(bypass)
  }

  // Live microphone input
  async enableLiveInput(): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (this.liveInputEnabled) return

    // Stop any file playback
    this.stop()
    this.stopTestTone()

    // Create microphone input
    this.microphoneInput = new Tone.UserMedia()

    try {
      await this.microphoneInput.open()
      this.connectSource(this.microphoneInput)
      this.liveInputEnabled = true
    } catch {
      this.microphoneInput.dispose()
      this.microphoneInput = null
      throw new Error('Microphone access denied or unavailable')
    }
  }

  disableLiveInput(): void {
    if (!this.liveInputEnabled || this.microphoneInput === null) return

    this.microphoneInput.close()
    this.microphoneInput.dispose()
    this.microphoneInput = null
    this.liveInputEnabled = false
  }

  isLiveInputEnabled(): boolean {
    return this.liveInputEnabled
  }

  // Master volume control
  setMasterVolume(volume: number): void {
    if (this.masterGain !== null) {
      // volume is 0-1, convert to gain
      this.masterGain.gain.rampTo(volume, 0.01)
    }
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 1
  }

  // Audio export
  async exportProcessedAudio(): Promise<Blob | null> {
    if (this.audioBuffer === null) return null

    // Use Tone.Offline to render the audio through effects
    const duration = this.audioBuffer.duration
    const sampleRate = this.audioBuffer.sampleRate

    const audioBufferRef = this.audioBuffer
    const renderedBuffer = await Tone.Offline(
      ({ transport }) => {
        // Recreate the player in offline context
        const offlinePlayer = new Tone.Player(audioBufferRef).toDestination()

        // If there are effects, we'd need to recreate them here
        // For now, just render the source audio
        // TODO: Add effect chain to offline rendering

        offlinePlayer.start(0)
        transport.start(0)
      },
      duration,
      2,
      sampleRate
    )

    // Convert to WAV
    const wavBlob = this.audioBufferToWav(renderedBuffer)
    return wavBlob
  }

  private audioBufferToWav(buffer: Tone.ToneAudioBuffer): Blob {
    const audioBuffer = buffer.get()
    if (audioBuffer === undefined) {
      throw new Error('No audio buffer available')
    }

    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const length = audioBuffer.length
    const bytesPerSample = 2 // 16-bit
    const blockAlign = numChannels * bytesPerSample

    const dataSize = length * blockAlign
    const headerSize = 44
    const arrayBuffer = new ArrayBuffer(headerSize + dataSize)
    const view = new DataView(arrayBuffer)

    // WAV header
    this.writeString(view, 0, 'RIFF')
    view.setUint32(4, 36 + dataSize, true)
    this.writeString(view, 8, 'WAVE')
    this.writeString(view, 12, 'fmt ')
    view.setUint32(16, 16, true) // Subchunk1Size
    view.setUint16(20, 1, true) // AudioFormat (PCM)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true) // ByteRate
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, 16, true) // BitsPerSample
    this.writeString(view, 36, 'data')
    view.setUint32(40, dataSize, true)

    // Write audio data
    const channels: Float32Array[] = []
    for (let i = 0; i < numChannels; i++) {
      channels.push(audioBuffer.getChannelData(i))
    }

    let offset = headerSize
    for (let i = 0; i < length; i++) {
      for (let ch = 0; ch < numChannels; ch++) {
        const sample = Math.max(-1, Math.min(1, channels[ch][i]))
        const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff
        view.setInt16(offset, intSample, true)
        offset += 2
      }
    }

    return new Blob([arrayBuffer], { type: 'audio/wav' })
  }

  private writeString(view: DataView, offset: number, str: string): void {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  hasAudioFile(): boolean {
    return this.audioBuffer !== null
  }

  // Callbacks
  setCallbacks(callbacks: AudioEngineCallback): void {
    this.callbacks = callbacks
  }

  // Cleanup
  dispose(): void {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId)
    }

    this.disableLiveInput()
    this.stopTestTone()
    this.stop()

    this.player?.dispose()
    this.inputMeter?.dispose()
    this.outputMeter?.dispose()
    this.dryGain?.dispose()
    this.wetGain?.dispose()
    this.masterGain?.dispose()
    this.effectsChain.forEach((effect) => effect.dispose())

    this.isInitialized = false
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()
