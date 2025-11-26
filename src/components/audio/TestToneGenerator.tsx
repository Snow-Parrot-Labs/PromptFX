import { useAudioStore } from '@/stores'
import { TEST_TONE_FREQUENCIES, TEST_TONE_WAVEFORMS, type TestToneWaveform } from '@/types/audio'

const WAVEFORM_LABELS: Record<TestToneWaveform, string> = {
  sine: 'Sin',
  sawtooth: 'Saw',
  square: 'Sqr',
  triangle: 'Tri',
}

export function TestToneGenerator(): React.JSX.Element {
  const {
    testToneActive,
    testToneFrequency,
    testToneWaveform,
    setTestToneActive,
    setTestToneFrequency,
    setTestToneWaveform,
  } = useAudioStore()

  const formatFrequency = (freq: number): string => {
    if (freq >= 1000) {
      return `${String(freq / 1000)}k`
    }
    return String(freq)
  }

  return (
    <div className="space-y-2">
      {/* Top row: Tone toggle and waveform selector */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => {
            setTestToneActive(!testToneActive)
          }}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
            testToneActive
              ? 'btn-mechanical-lit text-[--color-led-blue]'
              : 'btn-mechanical text-[--color-text-secondary]'
          }`}
          style={{
            boxShadow: testToneActive
              ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(90, 122, 154, 0.4)'
              : undefined,
          }}
        >
          <svg
            className={`w-3.5 h-3.5 ${testToneActive ? 'animate-pulse' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8.3l8.26-3.34a.5.5 0 0 0 .3-.64l-.34-.87a.5.5 0 0 0-.64-.3L3.24 6.15zM7 20a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm10-3a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
          </svg>
          Tone
        </button>

        {/* Waveform selector */}
        <div className="flex items-center gap-1">
          {TEST_TONE_WAVEFORMS.map((waveform) => (
            <button
              key={waveform}
              type="button"
              onClick={() => {
                setTestToneWaveform(waveform)
                if (!testToneActive) {
                  setTestToneActive(true)
                }
              }}
              className={`px-1.5 py-0.5 text-[10px] rounded transition-all ${
                testToneActive && testToneWaveform === waveform
                  ? 'btn-mechanical-lit text-[--color-led-blue]'
                  : 'btn-mechanical text-[--color-text-muted]'
              }`}
            >
              {WAVEFORM_LABELS[waveform]}
            </button>
          ))}
        </div>
      </div>

      {/* Bottom row: Frequency selector */}
      <div className="flex items-center justify-center gap-1">
        {TEST_TONE_FREQUENCIES.map((freq) => (
          <button
            key={freq}
            type="button"
            onClick={() => {
              setTestToneFrequency(freq)
              if (!testToneActive) {
                setTestToneActive(true)
              }
            }}
            className={`px-2 py-0.5 text-[10px] rounded transition-all ${
              testToneActive && testToneFrequency === freq
                ? 'btn-mechanical-lit text-[--color-led-blue]'
                : 'btn-mechanical text-[--color-text-muted]'
            }`}
          >
            {formatFrequency(freq)}
          </button>
        ))}
      </div>
    </div>
  )
}
