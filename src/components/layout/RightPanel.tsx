import { useAudioStore } from '@/stores'
import { useAudioEngine } from '@/hooks'
import { FileUploader } from '@/components/audio/FileUploader'
import { Waveform } from '@/components/audio/Waveform'
import { Transport } from '@/components/audio/Transport'
import { TestToneGenerator } from '@/components/audio/TestToneGenerator'
import { AudioIOSection } from '@/components/audio/AudioIOSection'
import { ExportAudio } from '@/components/audio/ExportAudio'
import { IOMeter } from '@/components/audio/IOMeter'

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
            <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
              Audio File
            </h3>
            {fileInfo !== null ? (
              <div className="space-y-2">
                <div className="h-16 bg-[--color-bg-tertiary] rounded overflow-hidden">
                  <Waveform />
                </div>
                <div className="flex items-center gap-2">
                  <Transport />
                </div>
                <FileUploader />
              </div>
            ) : (
              <FileUploader />
            )}
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
