import { useCallback } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { audioEngine } from '@/services/audioEngine'

interface ChannelStripProps {
  label: string
  level: number
  gain: number
  onGainChange: (gain: number) => void
  segments?: number
}

function ChannelStrip({
  label,
  level,
  gain,
  onGainChange,
  segments = 12,
}: ChannelStripProps): React.JSX.Element {
  const activeSegments = Math.round(level * segments)

  const getSegmentColor = (index: number): { bg: string; glow: string } => {
    const percentage = index / segments
    if (percentage > 0.85) return { bg: '#b54a4a', glow: 'rgba(181, 74, 74, 0.6)' }
    if (percentage > 0.7) return { bg: '#c4923a', glow: 'rgba(196, 146, 58, 0.5)' }
    return { bg: '#5a9a5a', glow: 'rgba(90, 154, 90, 0.4)' }
  }

  const handleFaderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onGainChange(parseFloat(e.target.value))
    },
    [onGainChange]
  )

  const segmentArray = Array.from({ length: segments }, (_, i) => i)

  return (
    <div className="flex flex-col items-center gap-2">
      {/* Label */}
      <span className="text-[9px] font-semibold text-[--color-text-muted] uppercase tracking-wider">
        {label}
      </span>

      {/* Meter and Fader container */}
      <div className="flex items-center gap-1.5">
        {/* VU Meter - vertical LED style */}
        <div className="flex flex-col-reverse gap-[2px]">
          {segmentArray.map((i) => {
            const isActive = i < activeSegments
            const colors = getSegmentColor(i)
            return (
              <div
                key={i}
                className="w-2.5 h-[6px] rounded-[1px]"
                style={{
                  background: isActive
                    ? colors.bg
                    : 'linear-gradient(180deg, #1a1610 0%, #0d0c0a 100%)',
                  boxShadow: isActive
                    ? `0 0 4px ${colors.glow}`
                    : 'inset 0 1px 2px rgba(0,0,0,0.5)',
                }}
              />
            )
          })}
        </div>

        {/* Vertical Fader */}
        <div className="relative h-[84px] w-6 flex items-center justify-center">
          {/* Track groove */}
          <div
            className="absolute w-1.5 h-full rounded-full"
            style={{
              background: 'linear-gradient(180deg, #0d0c0a 0%, #1a1610 100%)',
              boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.8)',
            }}
          />

          {/* Vertical range input */}
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.01"
            value={gain}
            onChange={handleFaderChange}
            className="fader-vertical"
            style={{
              width: '84px',
              height: '24px',
              transform: 'rotate(-90deg)',
              transformOrigin: 'center center',
            }}
          />
        </div>
      </div>

      {/* dB value display */}
      <div className="text-[9px] text-[--color-text-tertiary] tabular-nums">
        {gain === 0
          ? '-∞'
          : gain <= 1
            ? ((gain - 1) * 40).toFixed(0)
            : `+${((gain - 1) * 10).toFixed(0)}`}
        <span className="text-[8px] ml-0.5">dB</span>
      </div>
    </div>
  )
}

export function IOMeter(): React.JSX.Element {
  const { levels, inputGain, masterVolume, setInputGain, setMasterVolume } = useAudioStore()

  const inputLevel = Math.max(levels.inputLeft, levels.inputRight)
  const outputLevel = Math.max(levels.outputLeft, levels.outputRight)

  const handleInputGainChange = useCallback(
    (gain: number) => {
      setInputGain(gain)
      audioEngine.setInputGain(gain)
    },
    [setInputGain]
  )

  const handleOutputGainChange = useCallback(
    (gain: number) => {
      setMasterVolume(gain)
      audioEngine.setMasterVolume(gain)
    },
    [setMasterVolume]
  )

  return (
    <div className="flex gap-4 justify-center">
      {/* Input Channel */}
      <ChannelStrip
        label="IN"
        level={inputLevel}
        gain={inputGain}
        onGainChange={handleInputGainChange}
      />

      {/* Divider */}
      <div className="w-px bg-[--color-border] self-stretch my-4" />

      {/* Output Channel */}
      <ChannelStrip
        label="OUT"
        level={outputLevel}
        gain={masterVolume}
        onGainChange={handleOutputGainChange}
      />
    </div>
  )
}
