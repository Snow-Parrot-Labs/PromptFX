import * as Tone from 'tone'

const MAX_RECORDING_DURATION = 600 // 10 minutes in seconds

class AudioRecorder {
  private mediaRecorder: MediaRecorder | null = null
  private recordedChunks: Blob[] = []
  private isRecording = false
  private startTime = 0
  private stream: MediaStream | null = null

  start(stream: MediaStream): void {
    if (this.isRecording) {
      throw new Error('Recording already in progress')
    }

    // Check MediaRecorder support
    if (typeof window.MediaRecorder === 'undefined') {
      throw new Error('MediaRecorder not supported in this browser')
    }

    // Clear previous recording
    this.reset()

    this.stream = stream
    this.recordedChunks = []

    // Create MediaRecorder with best available format
    // Try to get WAV if possible, otherwise use default
    const options: MediaRecorderOptions = {}

    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      options.mimeType = 'audio/webm;codecs=opus'
    } else if (MediaRecorder.isTypeSupported('audio/webm')) {
      options.mimeType = 'audio/webm'
    } else if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
      options.mimeType = 'audio/ogg;codecs=opus'
    }

    this.mediaRecorder = new MediaRecorder(stream, options)

    // Collect recorded chunks
    this.mediaRecorder.ondataavailable = (event: BlobEvent) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data)
      }
    }

    // Start recording with 100ms timeslice for smooth chunking
    this.mediaRecorder.start(100)
    this.isRecording = true
    this.startTime = Date.now()

    // Auto-stop at 10 minutes
    setTimeout(() => {
      if (this.isRecording) {
        this.stop().catch((error: unknown) => {
          console.error('Error auto-stopping recording:', error)
        })
      }
    }, MAX_RECORDING_DURATION * 1000)
  }

  async stop(): Promise<Blob> {
    if (!this.isRecording || !this.mediaRecorder) {
      throw new Error('No recording in progress')
    }

    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) {
        reject(new Error('MediaRecorder not initialized'))
        return
      }

      this.mediaRecorder.onstop = async () => {
        try {
          // Merge all chunks into single blob
          const mimeType = this.mediaRecorder?.mimeType ?? 'audio/webm'
          const recordedBlob = new Blob(this.recordedChunks, { type: mimeType })

          // Convert to WAV
          const wavBlob = await this.convertToWav(recordedBlob)

          this.isRecording = false
          resolve(wavBlob)
        } catch (error: unknown) {
          reject(
            error instanceof Error
              ? error
              : new Error('Failed to process recording', { cause: error })
          )
        }
      }

      this.mediaRecorder.onerror = (event: Event) => {
        const errorEvent = event as ErrorEvent
        const error =
          errorEvent.error instanceof Error ? errorEvent.error : new Error('MediaRecorder error')
        reject(error)
      }

      this.mediaRecorder.stop()
    })
  }

  private async convertToWav(blob: Blob): Promise<Blob> {
    try {
      // Decode the recorded audio to AudioBuffer
      const arrayBuffer = await blob.arrayBuffer()
      const audioContext = Tone.getContext().rawContext as AudioContext
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

      // Convert to WAV using the same method as audioEngine export
      return this.audioBufferToWav(audioBuffer)
    } catch (error) {
      console.error('Error converting to WAV:', error)
      // If conversion fails, return original blob
      return blob
    }
  }

  private audioBufferToWav(audioBuffer: AudioBuffer): Blob {
    const numChannels = audioBuffer.numberOfChannels
    const sampleRate = audioBuffer.sampleRate
    const format = 1 // PCM
    const bitDepth = 16

    const bytesPerSample = bitDepth / 8
    const blockAlign = numChannels * bytesPerSample

    const data = new Float32Array(audioBuffer.length * numChannels)
    for (let channel = 0; channel < numChannels; channel++) {
      const channelData = audioBuffer.getChannelData(channel)
      for (let i = 0; i < audioBuffer.length; i++) {
        data[i * numChannels + channel] = channelData[i] ?? 0
      }
    }

    const dataLength = data.length * bytesPerSample
    const buffer = new ArrayBuffer(44 + dataLength)
    const view = new DataView(buffer)

    // Write WAV header
    const writeString = (offset: number, string: string): void => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i))
      }
    }

    writeString(0, 'RIFF')
    view.setUint32(4, 36 + dataLength, true)
    writeString(8, 'WAVE')
    writeString(12, 'fmt ')
    view.setUint32(16, 16, true) // fmt chunk size
    view.setUint16(20, format, true)
    view.setUint16(22, numChannels, true)
    view.setUint32(24, sampleRate, true)
    view.setUint32(28, sampleRate * blockAlign, true) // byte rate
    view.setUint16(32, blockAlign, true)
    view.setUint16(34, bitDepth, true)
    writeString(36, 'data')
    view.setUint32(40, dataLength, true)

    // Write audio data
    const volume = 0.8
    let offset = 44
    for (let i = 0; i < data.length; i++) {
      const sample = Math.max(-1, Math.min(1, (data[i] ?? 0) * volume))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }

    return new Blob([buffer], { type: 'audio/wav' })
  }

  reset(): void {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop()
    }

    this.mediaRecorder = null
    this.recordedChunks = []
    this.isRecording = false
    this.startTime = 0
    this.stream = null
  }

  getIsRecording(): boolean {
    return this.isRecording
  }

  getDuration(): number {
    if (!this.isRecording) return 0
    return (Date.now() - this.startTime) / 1000
  }

  getMaxDuration(): number {
    return MAX_RECORDING_DURATION
  }
}

// Singleton instance
export const audioRecorder = new AudioRecorder()
