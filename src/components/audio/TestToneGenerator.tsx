import { useAudioStore } from '@/stores'
import { TEST_TONE_FREQUENCIES } from '@/types/audio'

export function TestToneGenerator(): React.JSX.Element {
  const { testToneActive, testToneFrequency, setTestToneActive, setTestToneFrequency } =
    useAudioStore()

  const formatFrequency = (freq: number): string => {
    if (freq >= 1000) {
      return `${String(freq / 1000)}kHz`
    }
    return `${String(freq)}Hz`
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-[--color-text-secondary]">Test Tone</span>
        <button
          onClick={() => {
            setTestToneActive(!testToneActive)
          }}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            testToneActive ? 'bg-[--color-accent-primary]' : 'bg-[--color-bg-tertiary]'
          }`}
        >
          <span
            className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
              testToneActive ? 'left-7' : 'left-1'
            }`}
          />
        </button>
      </div>

      {testToneActive && (
        <div className="flex gap-1">
          {TEST_TONE_FREQUENCIES.map((freq) => (
            <button
              key={freq}
              onClick={() => {
                setTestToneFrequency(freq)
              }}
              className={`flex-1 px-2 py-1.5 text-xs rounded transition-colors ${
                testToneFrequency === freq
                  ? 'bg-[--color-accent-primary] text-white'
                  : 'bg-[--color-bg-tertiary] text-[--color-text-secondary] hover:text-[--color-text-primary]'
              }`}
            >
              {formatFrequency(freq)}
            </button>
          ))}
        </div>
      )}

      {testToneActive && (
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[--color-success] animate-pulse" />
          <span className="text-xs text-[--color-text-muted]">
            Generating {formatFrequency(testToneFrequency)} sine wave
          </span>
        </div>
      )}
    </div>
  )
}
