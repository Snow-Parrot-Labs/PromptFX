import { useRef } from 'react'
import { useAudioStore } from '@/stores'
import { useAudioEngine } from '@/hooks'
import { FileUploader } from '@/components/audio/FileUploader'
import { Waveform } from '@/components/audio/Waveform'
import { Transport } from '@/components/audio/Transport'
import { TestToneGenerator } from '@/components/audio/TestToneGenerator'
import { AudioIOSection } from '@/components/audio/AudioIOSection'
import { ExportAudio } from '@/components/audio/ExportAudio'
import { IOMeter } from '@/components/audio/IOMeter'
import { audioEngine } from '@/services/audioEngine'
import { toast } from '@/components/ui'
import { SUPPORTED_FORMATS, MAX_FILE_SIZE } from '@/types/audio'

function SwapFileButton(): React.JSX.Element {
  const inputRef = useRef<HTMLInputElement>(null)
  const { setFileInfo, setSource, setDuration } = useAudioStore()

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!SUPPORTED_FORMATS.includes(file.type as (typeof SUPPORTED_FORMATS)[number])) {
      toast.error('Unsupported format. Use WAV, MP3, or AIFF.')
      return
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      toast.error('File too large. Max 256MB.')
      return
    }

    try {
      const fileInfo = await audioEngine.loadAudioFile(file)
      setFileInfo(fileInfo)
      setDuration(fileInfo.duration)
      setSource('file')
      toast.success(`Loaded: ${file.name}`)
    } catch {
      toast.error('Failed to load audio file')
    }

    // Reset input so same file can be selected again
    if (inputRef.current) {
      inputRef.current.value = ''
    }
  }

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept=".wav,.mp3,.aiff,audio/wav,audio/mpeg,audio/aiff"
        onChange={(e) => {
          void handleFileChange(e)
        }}
        className="hidden"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-2 py-0.5 text-[10px] font-medium text-[--color-text-tertiary] hover:text-[--color-text-secondary] btn-mechanical rounded transition-colors"
      >
        Swap
      </button>
    </>
  )
}

export function RightPanel(): React.JSX.Element {
  const { source, fileInfo, liveInputEnabled, bypassEffect } = useAudioStore()
  const { toggleBypass } = useAudioStore()

  // Initialize audio engine and sync state - must be in always-mounted component
  useAudioEngine()

  return (
    <aside className="w-[320px] flex-shrink-0 bg-[--color-bg-secondary] border-l border-[--color-border] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-[--color-border] flex items-center justify-between">
        <h2 className="text-sm font-semibold text-[--color-text-primary] uppercase tracking-wider">
          Audio
        </h2>
        {/* Bypass Toggle - vintage lit button with red bulb glow */}
        <button
          type="button"
          onClick={() => {
            toggleBypass()
          }}
          className="relative px-3 py-1.5 rounded text-xs font-medium tracking-wide transition-all btn-mechanical text-[--color-text-muted] overflow-hidden"
          style={{
            boxShadow: bypassEffect
              ? 'inset 0 2px 4px rgba(0,0,0,0.3), 0 0 12px rgba(181, 74, 74, 0.4), 0 0 20px rgba(181, 74, 74, 0.2)'
              : undefined,
          }}
        >
          {/* Red bulb backlight glow when bypassed */}
          {bypassEffect && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  'radial-gradient(ellipse at center bottom, rgba(181, 74, 74, 0.4) 0%, rgba(181, 74, 74, 0.15) 40%, transparent 70%)',
              }}
            />
          )}
          <span className={`relative z-10 ${bypassEffect ? 'text-[#e8a0a0]' : ''}`}>BYPASS</span>
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {/* Audio I/O Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            Audio I/O
          </h3>
          <AudioIOSection />
        </div>

        {/* Test Tone Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            Test Tone
          </h3>
          <TestToneGenerator />
        </div>

        {/* Live Input indicator */}
        {liveInputEnabled && (
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
            <div className="h-12 bg-[--color-bg-tertiary] rounded flex items-center justify-center">
              <div className="flex items-center gap-2 text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium">Audio Input Active</span>
              </div>
            </div>
          </div>
        )}

        {/* Audio File Area - always visible unless live input */}
        {!liveInputEnabled && (
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-medium text-[--color-text-muted] uppercase tracking-wide">
                Audio File
              </h3>
              {fileInfo !== null && <SwapFileButton />}
            </div>
            <div className="space-y-2">
              {/* Waveform area - fixed height, doubles as drop zone when no file */}
              <div className="h-16 bg-[--color-bg-tertiary] rounded overflow-hidden">
                {fileInfo !== null ? <Waveform /> : <FileUploader />}
              </div>
              {/* Transport controls */}
              <div className="flex items-center gap-2">
                <Transport />
              </div>
            </div>
          </div>
        )}

        {/* I/O Levels Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-3 uppercase tracking-wide text-center">
            Levels
          </h3>
          <IOMeter />
        </div>

        {/* Export */}
        {source === 'file' && fileInfo !== null && (
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
            <ExportAudio />
          </div>
        )}
      </div>
    </aside>
  )
}
