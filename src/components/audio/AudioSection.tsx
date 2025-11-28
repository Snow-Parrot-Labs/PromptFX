import { useAudioStore } from '@/stores'
import { FileUploader } from './FileUploader'
import { Waveform } from './Waveform'
import { Transport } from './Transport'
import { ToneGenerator } from './ToneGenerator'
import { LiveInput } from './LiveInput'
import { OutputControls } from './OutputControls'
import { ExportAudio } from './ExportAudio'
import { RecordingControls } from './RecordingControls'

export function AudioSection(): React.JSX.Element {
  const { source, fileInfo, toneGeneratorActive, liveInputEnabled } = useAudioStore()

  return (
    <section className="p-6 border-t border-[--color-border] bg-[--color-bg-secondary]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[--color-text-primary]">Audio</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Controls */}
        <div className="space-y-4">
          {/* Live Input */}
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-4">
            <h3 className="text-sm font-medium text-[--color-text-secondary] mb-3">Live Input</h3>
            <LiveInput />
          </div>

          {/* Tone Generator */}
          <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-4">
            <h3 className="text-sm font-medium text-[--color-text-secondary] mb-3">
              Tone Generator
            </h3>
            <ToneGenerator />
          </div>
        </div>

        {/* Waveform / File Upload Area */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-4 lg:col-span-2">
          <h3 className="text-sm font-medium text-[--color-text-secondary] mb-3">
            {liveInputEnabled
              ? 'Live Input Active'
              : toneGeneratorActive
                ? 'Tone Generator Active'
                : 'Audio File'}
          </h3>
          {liveInputEnabled ? (
            <div className="h-24 bg-[--color-bg-tertiary] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center gap-2 text-green-500">
                  <span className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium">Microphone Active</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Audio is routed through effects in real-time
                </p>
              </div>
            </div>
          ) : toneGeneratorActive ? (
            <div className="h-24 bg-[--color-bg-tertiary] rounded-lg flex items-center justify-center">
              <div className="text-center">
                <div className="flex items-center gap-2 text-blue-500">
                  <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse" />
                  <span className="text-sm font-medium">Tone Generator Active</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">Tone routed through effects</p>
              </div>
            </div>
          ) : fileInfo !== null ? (
            <div className="space-y-3">
              <div className="h-24 bg-[--color-bg-tertiary] rounded-lg overflow-hidden">
                <Waveform />
              </div>
              <FileUploader />
            </div>
          ) : (
            <FileUploader />
          )}
        </div>
      </div>

      {/* Transport Controls */}
      {source === 'file' && fileInfo !== null && (
        <div className="mt-6 flex items-center gap-4">
          <Transport />
          <ExportAudio />
        </div>
      )}

      {/* Recording Controls */}
      <div className="mt-6">
        <RecordingControls />
      </div>

      {/* Output Controls */}
      <div className="mt-6">
        <OutputControls />
      </div>

      {/* Level Meters */}
      <div className="mt-4 flex justify-center gap-8">
        <LevelMeter label="Input" side="input" />
        <LevelMeter label="Output" side="output" />
      </div>
    </section>
  )
}

function LevelMeter({
  label,
  side,
}: {
  label: string
  side: 'input' | 'output'
}): React.JSX.Element {
  const { levels } = useAudioStore()

  const leftLevel = side === 'input' ? levels.inputLeft : levels.outputLeft
  const rightLevel = side === 'input' ? levels.inputRight : levels.outputRight

  const getBarColor = (level: number): string => {
    if (level > 0.9) return 'bg-[--color-meter-red]'
    if (level > 0.7) return 'bg-[--color-meter-yellow]'
    return 'bg-[--color-meter-green]'
  }

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="text-xs text-[--color-text-muted]">{label}</span>
      <div className="flex gap-1">
        {/* Left channel */}
        <div className="w-2 h-16 bg-[--color-bg-tertiary] rounded-sm overflow-hidden flex flex-col-reverse">
          <div
            className={`w-full transition-all duration-75 ${getBarColor(leftLevel)}`}
            style={{ height: `${String(leftLevel * 100)}%` }}
          />
        </div>
        {/* Right channel */}
        <div className="w-2 h-16 bg-[--color-bg-tertiary] rounded-sm overflow-hidden flex flex-col-reverse">
          <div
            className={`w-full transition-all duration-75 ${getBarColor(rightLevel)}`}
            style={{ height: `${String(rightLevel * 100)}%` }}
          />
        </div>
      </div>
      <span className="text-xs text-[--color-text-muted]">L R</span>
    </div>
  )
}
