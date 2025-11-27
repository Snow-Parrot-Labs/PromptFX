import { useAudioStore } from '@/stores'
import { useAudioEngine } from '@/hooks'
import { AudioIOSection } from '@/components/audio/AudioIOSection'
import { ExportAudio } from '@/components/audio/ExportAudio'
import { RecordingControls } from '@/components/audio/RecordingControls'
import { IOMeter } from '@/components/audio/IOMeter'

export function RightPanel(): React.JSX.Element {
  const { source, fileInfo, liveInputEnabled } = useAudioStore()

  // Initialize audio engine and sync state - must be in always-mounted component
  useAudioEngine()

  return (
    <aside className="w-[320px] flex-shrink-0 bg-[--color-bg-secondary] border-l border-[--color-border] flex flex-col overflow-hidden">
      {/* Panel Header */}
      <div className="px-4 py-3 border-b border-[--color-border]">
        <h2 className="text-sm font-semibold text-[--color-text-primary] uppercase tracking-wider">
          Audio
        </h2>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar p-3 space-y-3">
        {/* I/O Levels Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-3 uppercase tracking-wide text-center">
            Levels
          </h3>
          <IOMeter />
        </div>

        {/* Audio I/O Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            Audio I/O
          </h3>
          <AudioIOSection />
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

        {/* Recording Controls */}
        <RecordingControls />

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
