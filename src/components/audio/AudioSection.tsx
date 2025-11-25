import { useAudioStore } from '@/stores'
import { FileUploader } from './FileUploader'
import { Waveform } from './Waveform'
import { Transport } from './Transport'
import { TestToneGenerator } from './TestToneGenerator'

export function AudioSection(): React.JSX.Element {
  const { source, bypassEffect, toggleBypass, setSource, fileInfo, testToneActive } =
    useAudioStore()

  const handleSourceChange = (newSource: 'file' | 'live' | 'tone'): void => {
    if (source === newSource) return
    setSource(newSource)
  }

  return (
    <section className="p-6 border-t border-[--color-border] bg-[--color-bg-secondary]">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-[--color-text-primary]">Audio</h2>
        <div className="flex items-center gap-4">
          <button
            onClick={toggleBypass}
            className={`px-3 py-1.5 text-sm rounded font-medium transition-colors ${
              bypassEffect
                ? 'bg-[--color-warning] text-black'
                : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary]'
            }`}
          >
            {bypassEffect ? 'Bypassed' : 'Bypass'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Source Selector */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-4">
          <h3 className="text-sm font-medium text-[--color-text-secondary] mb-3">Source</h3>
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => {
                handleSourceChange('file')
              }}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                source === 'file' || (fileInfo !== null && !testToneActive)
                  ? 'bg-[--color-accent-primary] text-white'
                  : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary]'
              }`}
            >
              File
            </button>
            <button
              onClick={() => {
                handleSourceChange('live')
              }}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                source === 'live'
                  ? 'bg-[--color-accent-primary] text-white'
                  : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary]'
              }`}
            >
              Live
            </button>
            <button
              onClick={() => {
                handleSourceChange('tone')
              }}
              className={`flex-1 px-3 py-2 text-sm rounded transition-colors ${
                source === 'tone' || testToneActive
                  ? 'bg-[--color-accent-primary] text-white'
                  : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary]'
              }`}
            >
              Tone
            </button>
          </div>

          {/* Test Tone Generator */}
          <TestToneGenerator />
        </div>

        {/* Waveform / File Upload Area */}
        <div className="bg-[--color-bg-panel] rounded-lg border border-[--color-border] p-4 lg:col-span-2">
          <h3 className="text-sm font-medium text-[--color-text-secondary] mb-3">Waveform</h3>
          {fileInfo ? (
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
      <div className="mt-6">
        <Transport />
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
