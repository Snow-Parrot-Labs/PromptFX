import { useAudioStore } from '@/stores'
import { FileUploader } from '@/components/audio/FileUploader'
import { Waveform } from '@/components/audio/Waveform'
import { Transport } from '@/components/audio/Transport'
import { TestToneGenerator } from '@/components/audio/TestToneGenerator'
import { LiveInput } from '@/components/audio/LiveInput'
import { ExportAudio } from '@/components/audio/ExportAudio'

export function RightPanel(): React.JSX.Element {
  const { source, fileInfo, testToneActive, liveInputEnabled, levels, masterVolume, bypassEffect } =
    useAudioStore()
  const { setMasterVolume, toggleBypass } = useAudioStore()

  const outputLevel = Math.max(levels.outputLeft, levels.outputRight)

  const getBarColor = (level: number): string => {
    if (level > 0.9) return 'bg-[--color-meter-red]'
    if (level > 0.7) return 'bg-[--color-meter-yellow]'
    return 'bg-[--color-meter-green]'
  }

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
        {/* Source Selector Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            Source
          </h3>
          <div className="space-y-2">
            <LiveInput />
            <TestToneGenerator />
          </div>
        </div>

        {/* Waveform / File Area */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            {liveInputEnabled ? 'Live Input' : testToneActive ? 'Test Tone' : 'Audio File'}
          </h3>

          {liveInputEnabled ? (
            <div className="h-16 bg-[--color-bg-tertiary] rounded flex items-center justify-center">
              <div className="flex items-center gap-2 text-green-500">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs font-medium">Microphone Active</span>
              </div>
            </div>
          ) : testToneActive ? (
            <div className="h-16 bg-[--color-bg-tertiary] rounded flex items-center justify-center">
              <div className="flex items-center gap-2 text-blue-500">
                <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs font-medium">Test Tone Active</span>
              </div>
            </div>
          ) : fileInfo !== null ? (
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

        {/* Output Section */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-3">
          <h3 className="text-xs font-medium text-[--color-text-muted] mb-2 uppercase tracking-wide">
            Output
          </h3>

          {/* Master Volume */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[--color-text-muted] w-12">Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={masterVolume}
              onChange={(e) => {
                setMasterVolume(parseFloat(e.target.value))
              }}
              className="flex-1 h-1.5 bg-[--color-bg-tertiary] rounded appearance-none cursor-pointer accent-[--color-accent-primary]"
            />
            <span className="text-xs text-[--color-text-muted] w-8 text-right">
              {Math.round(masterVolume * 100)}%
            </span>
          </div>

          {/* Output Level Meter */}
          <div className="mt-3 flex items-center gap-3">
            <span className="text-xs text-[--color-text-muted] w-12">Level</span>
            <div className="flex-1 h-2 bg-[--color-bg-tertiary] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${getBarColor(outputLevel)}`}
                style={{ width: `${(outputLevel * 100).toString()}%` }}
              />
            </div>
          </div>

          {/* Stereo Meters */}
          <div className="mt-3 flex justify-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-12 bg-[--color-bg-tertiary] rounded-sm overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all duration-75 ${getBarColor(levels.outputLeft)}`}
                  style={{ height: `${(levels.outputLeft * 100).toString()}%` }}
                />
              </div>
              <span className="text-[10px] text-[--color-text-muted]">L</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-3 h-12 bg-[--color-bg-tertiary] rounded-sm overflow-hidden flex flex-col-reverse">
                <div
                  className={`w-full transition-all duration-75 ${getBarColor(levels.outputRight)}`}
                  style={{ height: `${(levels.outputRight * 100).toString()}%` }}
                />
              </div>
              <span className="text-[10px] text-[--color-text-muted]">R</span>
            </div>
          </div>
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
