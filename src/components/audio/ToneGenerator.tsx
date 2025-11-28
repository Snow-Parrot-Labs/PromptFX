import { useAudioStore } from '@/stores'
import { DialKnob } from '@/components/ui/DialKnob'
import {
  TONE_GENERATOR_FREQ_MIN,
  TONE_GENERATOR_FREQ_MAX,
  TONE_GENERATOR_WAVEFORMS,
  WAVEFORM_LABELS,
} from '@/types/audio'

// Waveform marks for the selector dial
const WAVEFORM_MARKS = TONE_GENERATOR_WAVEFORMS.map((waveform, index) => ({
  value: index,
  label: WAVEFORM_LABELS[waveform],
}))

// Format frequency for display
function formatFrequency(freq: number): string {
  if (freq >= 1000) {
    const kHz = freq / 1000
    return kHz >= 10 ? `${String(Math.round(kHz))}kHz` : `${kHz.toFixed(1)}kHz`
  }
  return `${String(Math.round(freq))}Hz`
}

export function ToneGenerator(): React.JSX.Element {
  const {
    toneGeneratorActive,
    toneGeneratorFrequency,
    toneGeneratorWaveform,
    setToneGeneratorActive,
    setToneGeneratorFrequency,
    setToneGeneratorWaveform,
  } = useAudioStore()

  // Convert waveform to index for the dial
  const waveformIndex = TONE_GENERATOR_WAVEFORMS.indexOf(toneGeneratorWaveform)

  const handleWaveformChange = (index: number): void => {
    // index is constrained by DialKnob marks to valid range [0, TONE_GENERATOR_WAVEFORMS.length - 1]
    setToneGeneratorWaveform(TONE_GENERATOR_WAVEFORMS[index])
    if (!toneGeneratorActive) {
      setToneGeneratorActive(true)
    }
  }

  const handleFrequencyChange = (freq: number): void => {
    setToneGeneratorFrequency(freq)
    if (!toneGeneratorActive) {
      setToneGeneratorActive(true)
    }
  }

  return (
    <div className="space-y-3">
      {/* Toggle button */}
      <button
        type="button"
        onClick={() => {
          setToneGeneratorActive(!toneGeneratorActive)
        }}
        className={`w-full flex items-center justify-center gap-2 px-3 py-2 rounded text-xs font-medium transition-all ${
          toneGeneratorActive
            ? 'btn-mechanical-lit text-[--color-led-blue]'
            : 'btn-mechanical text-[--color-text-secondary]'
        }`}
        style={{
          boxShadow: toneGeneratorActive
            ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(90, 122, 154, 0.4)'
            : undefined,
        }}
      >
        <svg
          className={`w-4 h-4 ${toneGeneratorActive ? 'animate-pulse' : ''}`}
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path d="M3.24 6.15C2.51 6.43 2 7.17 2 8v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H8.3l8.26-3.34a.5.5 0 0 0 .3-.64l-.34-.87a.5.5 0 0 0-.64-.3L3.24 6.15zM7 20a3 3 0 1 1 0-6 3 3 0 0 1 0 6zm10-3a3 3 0 1 1 0-6 3 3 0 0 1 0 6z" />
        </svg>
        Tone Generator
      </button>

      {/* Dual dial knobs */}
      <div className="flex items-center justify-center gap-4">
        <DialKnob
          value={toneGeneratorFrequency}
          min={TONE_GENERATOR_FREQ_MIN}
          max={TONE_GENERATOR_FREQ_MAX}
          label="FREQ"
          onChange={handleFrequencyChange}
          size={72}
          curve="logarithmic"
          formatValue={formatFrequency}
        />
        <DialKnob
          value={waveformIndex}
          min={0}
          max={TONE_GENERATOR_WAVEFORMS.length - 1}
          label="WAVE"
          onChange={handleWaveformChange}
          size={72}
          marks={WAVEFORM_MARKS}
          wrapAround={true}
          iconMode="waveform"
        />
      </div>
    </div>
  )
}
