import * as Tone from 'tone'
import type {
  AudioFileInfo,
  WaveformData,
  TestToneFrequency,
  TestToneWaveform,
  AudioInputDevice,
  AudioOutputDevice,
} from '@/types/audio'

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
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null
  private currentMediaStream: MediaStream | null = null
  private currentDeviceId: string | null = null
  private currentOutputDeviceId: string | null = null
  private liveInputGain: Tone.Gain | null = null // Store live input gain for reconnection
  private activeSource: Tone.ToneAudioNode | null = null // Track current active source
  private inputGainNode: Tone.Gain | null = null // Master input gain control
  private inputMeter: Tone.Meter | null = null
  private outputMeter: Tone.Meter | null = null
  private inputAnalyser: Tone.Analyser | null = null
  private outputAnalyser: Tone.Analyser | null = null
  private effectsChain: Tone.ToneAudioNode[] = []
  private wetGain: Tone.Gain | null = null
  private dryGain: Tone.Gain | null = null
  private masterGain: Tone.Gain | null = null
  private recorderDestination: MediaStreamAudioDestinationNode | null = null
  private audioBuffer: Tone.ToneAudioBuffer | null = null
  private isInitialized = false
  private liveInputEnabled = false
  private isPlayerPlaying = false
  private playbackPosition = 0
  private playbackStartTime = 0
  private callbacks: AudioEngineCallback = {}
  private animationFrameId: number | null = null
  private loopEnabled = false

  async initialize(): Promise<void> {
    if (this.isInitialized) return

    // Start Tone.js context (must be called from user gesture)
    // Note: latencyHint is set at context creation time, not after
    await Tone.start()

    // Create metering (smoothing parameter)
    this.inputMeter = new Tone.Meter(0.9)
    this.outputMeter = new Tone.Meter(0.9)

    // Create FFT analyzers for spectrum display (64 bins = 32 usable frequency bands)
    this.inputAnalyser = new Tone.Analyser('fft', 64)
    this.outputAnalyser = new Tone.Analyser('fft', 64)

    // Create gain nodes
    this.inputGainNode = new Tone.Gain(1) // Input gain control
    this.dryGain = new Tone.Gain(0) // Bypass (dry) signal
    this.wetGain = new Tone.Gain(1) // Processed (wet) signal
    this.masterGain = new Tone.Gain(1) // Master output

    // Create MediaStreamAudioDestinationNode for recording
    const rawContext = Tone.getContext().rawContext as AudioContext
    this.recorderDestination = rawContext.createMediaStreamDestination()

    // Connect output chain
    this.wetGain.connect(this.masterGain)
    this.dryGain.connect(this.masterGain)
    this.masterGain.connect(this.outputMeter)
    this.masterGain.connect(this.outputAnalyser) // Tap for spectrum analysis
    this.masterGain.connect(
      Tone.getContext()
        .createGain({
          gain: 1,
          context: Tone.getContext().rawContext,
        })
        .connect(this.recorderDestination) as unknown as Tone.InputNode
    ) // Tap for recording
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

      // Update time for file playback
      if (this.callbacks.onTimeUpdate) {
        const currentTime = this.getCurrentTime()
        this.callbacks.onTimeUpdate(currentTime)

        // Check if playback has reached the end
        if (this.isPlayerPlaying && this.audioBuffer) {
          if (currentTime >= this.audioBuffer.duration) {
            if (this.loopEnabled) {
              // Loop: restart from beginning
              this.playbackPosition = 0
              this.playbackStartTime = Tone.now()
              if (this.player) {
                this.player.stop()
                this.player.start(Tone.now(), 0)
              }
            } else {
              this.isPlayerPlaying = false
              this.playbackPosition = 0
              this.callbacks.onPlaybackEnd?.()
            }
          }
        }
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

  private connectSource(source: Tone.ToneAudioNode, setAsActive = true): void {
    if (!this.inputMeter || !this.inputGainNode || !this.wetGain || !this.dryGain) return

    // Disconnect previous source and inputGainNode connections before connecting new source
    if (this.activeSource && this.activeSource !== source) {
      this.activeSource.disconnect()
    }
    this.inputGainNode.disconnect()

    // Track this as the active source for reconnection when effects change
    if (setAsActive) {
      this.activeSource = source
    }

    // Source -> InputGain
    source.connect(this.inputGainNode)

    // InputGain -> InputMeter (tap for level display - meter is a dead end, doesn't pass audio)
    this.inputGainNode.connect(this.inputMeter)

    // InputGain -> InputAnalyser (tap for spectrum analysis)
    if (this.inputAnalyser) {
      this.inputGainNode.connect(this.inputAnalyser)
    }

    // InputGain -> Effect Chain -> Wet Gain
    // OR InputGain -> Wet Gain (if no effects)
    if (this.effectsChain.length > 0) {
      const firstEffect = this.effectsChain[0]
      const lastEffect = this.effectsChain[this.effectsChain.length - 1]
      if (firstEffect && lastEffect) {
        this.inputGainNode.connect(firstEffect)
        lastEffect.connect(this.wetGain)
      }
    } else {
      // No effects - connect directly to wet gain for output
      this.inputGainNode.connect(this.wetGain)
    }

    // InputGain -> Dry Gain (for bypass - unprocessed signal)
    this.inputGainNode.connect(this.dryGain)
  }

  // Reconnect the current active source (used when effect chain changes)
  private reconnectActiveSource(): void {
    if (this.activeSource === null) return

    // Disconnect source and input gain node
    this.activeSource.disconnect()
    this.inputGainNode?.disconnect()

    // Reconnect through new effect chain
    this.connectSource(this.activeSource, false)
  }

  async play(): Promise<void> {
    if (!this.player || !this.audioBuffer) return

    // Don't restart if already playing
    if (this.isPlayerPlaying) return

    // Ensure audio context is running (required after user gesture)
    if (Tone.getContext().state !== 'running') {
      await Tone.start()
    }

    // Start player from current position
    const currentPos = this.playbackPosition
    this.player.start(Tone.now(), currentPos)
    this.isPlayerPlaying = true
    this.playbackStartTime = Tone.now() - currentPos
  }

  pause(): void {
    if (this.player && this.isPlayerPlaying) {
      // Save current position before stopping
      this.playbackPosition = this.getCurrentTime()
      this.player.stop()
      this.isPlayerPlaying = false
    }
  }

  stop(): void {
    if (this.player) {
      this.player.stop()
      this.isPlayerPlaying = false
      this.playbackPosition = 0
      this.playbackStartTime = 0
    }
  }

  seek(time: number): void {
    if (this.player && this.audioBuffer) {
      const wasPlaying = this.isPlayerPlaying
      const seekTime = Math.min(time, this.audioBuffer.duration)

      if (wasPlaying) {
        this.player.stop()
        this.player.start(undefined, seekTime)
        this.playbackStartTime = Tone.now() - seekTime
      } else {
        this.playbackPosition = seekTime
      }
    }
  }

  setBypass(bypass: boolean): void {
    if (this.wetGain && this.dryGain) {
      this.wetGain.gain.rampTo(bypass ? 0 : 1, 0.01)
      this.dryGain.gain.rampTo(bypass ? 1 : 0, 0.01)
    }
  }

  setLooping(loop: boolean): void {
    this.loopEnabled = loop
  }

  isLoopingEnabled(): boolean {
    return this.loopEnabled
  }

  // Set master wet/dry mix (0 = fully dry, 1 = fully wet)
  setMasterMix(mix: number): void {
    if (this.wetGain && this.dryGain) {
      const clampedMix = Math.max(0, Math.min(1, mix))
      this.wetGain.gain.rampTo(clampedMix, 0.02)
      this.dryGain.gain.rampTo(1 - clampedMix, 0.02)
    }
  }

  getMasterMix(): number {
    return this.wetGain?.gain.value ?? 1
  }

  // Test tone methods
  startTestTone(frequency: TestToneFrequency, waveform: TestToneWaveform = 'sine'): void {
    if (!this.isInitialized) return

    this.stopTestTone()

    this.oscillator = new Tone.Oscillator({
      frequency,
      type: waveform,
    })

    this.connectSource(this.oscillator)
    this.oscillator.start()
  }

  setTestToneWaveform(waveform: TestToneWaveform): void {
    if (this.oscillator) {
      this.oscillator.type = waveform
    }
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
    const samples = 400 // Number of peaks to display (increased for detail)
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

  getRecorderStream(): MediaStream | null {
    return this.recorderDestination?.stream ?? null
  }

  getCurrentTime(): number {
    if (this.isPlayerPlaying) {
      // Calculate current position based on when playback started
      const elapsed = Tone.now() - this.playbackStartTime
      const duration = this.audioBuffer?.duration ?? 0
      return Math.min(elapsed, duration)
    }
    return this.playbackPosition
  }

  isPlaying(): boolean {
    return this.isPlayerPlaying
  }

  // Effect chain management
  private effectInput: Tone.Gain | null = null
  private effectOutput: Tone.Gain | null = null

  setEffectsChain(effects: Tone.ToneAudioNode[]): void {
    // Disconnect current effect chain from wetGain
    this.effectsChain.forEach((effect) => effect.disconnect())
    this.effectsChain = effects

    // Reconnect the active source through the new effect chain
    // This handles player, oscillator, AND live input
    this.reconnectActiveSource()
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
    // Clean up Tone.UserMedia (legacy)
    if (this.microphoneInput !== null) {
      this.microphoneInput.close()
      this.microphoneInput.dispose()
      this.microphoneInput = null
    }

    // Clean up native MediaStream
    this.cleanupMediaStream()

    this.liveInputEnabled = false
  }

  isLiveInputEnabled(): boolean {
    return this.liveInputEnabled
  }

  // Get available audio input devices
  async getAudioInputDevices(): Promise<AudioInputDevice[]> {
    try {
      // Request permission first (needed to get device labels)
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioInputs = devices
        .filter((device) => device.kind === 'audioinput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId,
        }))

      return audioInputs
    } catch {
      throw new Error('Unable to access audio devices. Please check browser permissions.')
    }
  }

  // Enable live input with specific device
  async enableLiveInputWithDevice(deviceId: string | null): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    // If already enabled with same device, do nothing
    if (this.liveInputEnabled && this.currentDeviceId === deviceId) return

    // Stop any file playback
    this.stop()
    this.stopTestTone()

    // Disable current input first
    this.disableLiveInput()

    try {
      // Get media stream with specific device
      const constraints: MediaStreamConstraints = {
        audio: deviceId !== null && deviceId !== '' ? { deviceId: { exact: deviceId } } : true,
      }

      this.currentMediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      this.currentDeviceId = deviceId

      // Create audio source from stream using Tone.js context
      const context = Tone.getContext().rawContext as AudioContext
      this.mediaStreamSource = context.createMediaStreamSource(this.currentMediaStream)

      // Create a Tone.js Gain node to interface with our routing
      // Store it so we can reconnect when effects change
      this.liveInputGain = new Tone.Gain(1)

      // Connect native node to Tone.js node
      this.mediaStreamSource.connect(this.liveInputGain.input as unknown as AudioNode)

      // Connect through our routing (this sets activeSource)
      this.connectSource(this.liveInputGain)

      this.liveInputEnabled = true
    } catch (error: unknown) {
      this.cleanupMediaStream()
      if (error instanceof Error && error.name === 'NotAllowedError') {
        throw new Error(
          'Microphone access denied. Please allow microphone access in your browser settings.'
        )
      }
      throw new Error('Failed to access audio input device')
    }
  }

  private cleanupMediaStream(): void {
    // Clear active source if it was the live input (check before disposing)
    if (this.liveInputGain !== null && this.activeSource === this.liveInputGain) {
      this.activeSource = null
    }

    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect()
      this.mediaStreamSource = null
    }
    if (this.currentMediaStream) {
      this.currentMediaStream.getTracks().forEach((track) => {
        track.stop()
      })
      this.currentMediaStream = null
    }
    if (this.liveInputGain) {
      this.liveInputGain.disconnect()
      this.liveInputGain.dispose()
      this.liveInputGain = null
    }
    this.currentDeviceId = null
  }

  getCurrentDeviceId(): string | null {
    return this.currentDeviceId
  }

  // Get available audio output devices
  async getAudioOutputDevices(): Promise<AudioOutputDevice[]> {
    try {
      // Request permission first (needed to get device labels)
      await navigator.mediaDevices.getUserMedia({ audio: true })

      const devices = await navigator.mediaDevices.enumerateDevices()
      const audioOutputs = devices
        .filter((device) => device.kind === 'audiooutput')
        .map((device) => ({
          deviceId: device.deviceId,
          label: device.label || `Speaker ${device.deviceId.slice(0, 8)}`,
          groupId: device.groupId,
        }))

      return audioOutputs
    } catch {
      throw new Error('Unable to access audio devices. Please check browser permissions.')
    }
  }

  // Check if setSinkId is supported (Safari doesn't support it)
  supportsSinkId(): boolean {
    try {
      const context = Tone.getContext().rawContext as AudioContext & {
        setSinkId?: (sinkId: string) => Promise<void>
      }
      return typeof context?.setSinkId === 'function'
    } catch {
      return false
    }
  }

  // Set the audio output device
  async setAudioOutputDevice(deviceId: string | null): Promise<void> {
    if (!this.isInitialized) {
      await this.initialize()
    }

    if (!this.supportsSinkId()) {
      throw new Error('Output device selection is not supported in this browser')
    }

    try {
      const context = Tone.getContext().rawContext as AudioContext & {
        setSinkId: (sinkId: string) => Promise<void>
      }
      await context.setSinkId(deviceId ?? 'default')
      this.currentOutputDeviceId = deviceId
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'NotFoundError') {
        throw new Error('Audio output device not found. It may have been disconnected.')
      }
      throw new Error('Failed to set audio output device')
    }
  }

  getCurrentOutputDeviceId(): string | null {
    return this.currentOutputDeviceId
  }

  // Input gain control
  setInputGain(gain: number): void {
    if (this.inputGainNode !== null) {
      // gain is 0-1, ramp to avoid clicks
      this.inputGainNode.gain.rampTo(gain, 0.01)
    }
  }

  getInputGain(): number {
    return this.inputGainNode?.gain.value ?? 1
  }

  // Master volume control (output)
  setMasterVolume(volume: number): void {
    if (this.masterGain !== null) {
      // volume is 0-1, convert to gain
      this.masterGain.gain.rampTo(volume, 0.01)
    }
  }

  getMasterVolume(): number {
    return this.masterGain?.gain.value ?? 1
  }

  // Spectrum analysis - return silence when no analyser or no signal
  private createSilenceSpectrum(): Float32Array {
    return new Float32Array(32).fill(-100) // MIN_DB threshold
  }

  getInputSpectrum(): Float32Array {
    if (this.inputAnalyser) {
      const data = this.inputAnalyser.getValue() as Float32Array
      // Check if we have actual signal (not all zeros or very low values)
      if (data.length > 0 && data.some((v) => v > -95 && isFinite(v))) {
        return data
      }
    }
    return this.createSilenceSpectrum()
  }

  getOutputSpectrum(): Float32Array {
    if (this.outputAnalyser) {
      const data = this.outputAnalyser.getValue() as Float32Array
      // Check if we have actual signal (not all zeros or very low values)
      if (data.length > 0 && data.some((v) => v > -95 && isFinite(v))) {
        return data
      }
    }
    return this.createSilenceSpectrum()
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
    this.cleanupMediaStream()
    this.stopTestTone()
    this.stop()

    this.player?.dispose()
    this.inputGainNode?.dispose()
    this.inputMeter?.dispose()
    this.outputMeter?.dispose()
    this.inputAnalyser?.dispose()
    this.outputAnalyser?.dispose()
    this.dryGain?.dispose()
    this.wetGain?.dispose()
    this.masterGain?.dispose()
    this.effectsChain.forEach((effect) => effect.dispose())
    this.recorderDestination = null

    this.isInitialized = false
  }
}

// Singleton instance
export const audioEngine = new AudioEngine()
