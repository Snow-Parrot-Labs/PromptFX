import { useEQStore } from '@/stores/eqStore'
import { useEQControls } from '@/hooks/useEQControls'
import { MountingScrew } from '@/components/rack/MountingScrew'
import { StyledKnob } from '@/components/controls/StyledKnob'
import { StyledSwitch } from '@/components/controls/StyledSwitch'

export function EQPanel(): React.JSX.Element {
  const {
    inputEQ,
    outputEQ,
    setInputEQBypassed,
    setOutputEQBypassed,
    updateInputEQBand,
    updateOutputEQBand,
  } = useEQStore()

  // Initialize and sync with audioEngine
  useEQControls()

  return (
    <div className="relative w-full">
      {/* Corner screws */}
      <div className="absolute -left-2 top-2 z-10">
        <MountingScrew size="sm" />
      </div>
      <div className="absolute -right-2 top-2 z-10">
        <MountingScrew size="sm" />
      </div>
      <div className="absolute -left-2 bottom-2 z-10">
        <MountingScrew size="sm" />
      </div>
      <div className="absolute -right-2 bottom-2 z-10">
        <MountingScrew size="sm" />
      </div>

      {/* Panel body */}
      <div
        className="relative rounded-lg overflow-hidden"
        style={{
          height: '176px',
          background: 'linear-gradient(180deg, #1a1a24 0%, #12121a 50%, #0f0f15 100%)',
          boxShadow: `
            inset 2px 2px 4px rgba(255,255,255,0.05),
            inset -2px -2px 4px rgba(0,0,0,0.3),
            0 4px 16px rgba(0,0,0,0.5),
            0 8px 32px rgba(0,0,0,0.3)
          `,
        }}
      >
        <div className="h-full flex items-center px-4 gap-4">
          {/* Input EQ Section */}
          <div className="flex-1 flex flex-col h-full py-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[--color-text-tertiary] font-semibold">
                Input EQ
              </span>
              <StyledSwitch
                value={!inputEQ.bypassed}
                label=""
                onLabel="ON"
                offLabel="BYP"
                onChange={(value) => {
                  setInputEQBypassed(!value)
                }}
                color="green"
              />
            </div>

            <div className="flex-1 flex gap-2 items-center justify-evenly -mt-5">
              {/* HPF */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: inputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  HPF
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={inputEQ.highpass.frequency}
                  min={20}
                  max={500}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateInputEQBand('highpass', 'frequency', value)
                  }}
                />
              </div>

              {/* LOW */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: inputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  LOW
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={inputEQ.lowShelf.frequency}
                  min={80}
                  max={250}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateInputEQBand('lowShelf', 'frequency', value)
                  }}
                />
                <StyledKnob
                  size="xs"
                  color="amber"
                  value={inputEQ.lowShelf.gain}
                  min={-12}
                  max={12}
                  label="GAIN"
                  unit="dB"
                  onChange={(value) => {
                    updateInputEQBand('lowShelf', 'gain', value)
                  }}
                />
              </div>

              {/* MID */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: inputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  MID
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={inputEQ.midPeak.frequency}
                  min={500}
                  max={2000}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateInputEQBand('midPeak', 'frequency', value)
                  }}
                />
                <StyledKnob
                  size="xs"
                  color="amber"
                  value={inputEQ.midPeak.gain}
                  min={-12}
                  max={12}
                  label="GAIN"
                  unit="dB"
                  onChange={(value) => {
                    updateInputEQBand('midPeak', 'gain', value)
                  }}
                />
              </div>

              {/* HIGH */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: inputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  HIGH
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={inputEQ.highPeak.frequency}
                  min={4000}
                  max={12000}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateInputEQBand('highPeak', 'frequency', value)
                  }}
                />
                <StyledKnob
                  size="xs"
                  color="amber"
                  value={inputEQ.highPeak.gain}
                  min={-12}
                  max={12}
                  label="GAIN"
                  unit="dB"
                  onChange={(value) => {
                    updateInputEQBand('highPeak', 'gain', value)
                  }}
                />
              </div>

              {/* LPF */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: inputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  LPF
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={inputEQ.lowpass.frequency}
                  min={5000}
                  max={20000}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateInputEQBand('lowpass', 'frequency', value)
                  }}
                />
              </div>
            </div>
          </div>

          {/* Center divider */}
          <div
            className="w-px h-full"
            style={{
              background:
                'linear-gradient(180deg, transparent 0%, rgba(255,255,255,0.1) 50%, transparent 100%)',
            }}
          />

          {/* Output EQ Section */}
          <div className="flex-1 flex flex-col h-full py-1">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase tracking-wider text-[--color-text-tertiary] font-semibold">
                Output EQ
              </span>
              <StyledSwitch
                value={!outputEQ.bypassed}
                label=""
                onLabel="ON"
                offLabel="BYP"
                onChange={(value) => {
                  setOutputEQBypassed(!value)
                }}
                color="green"
              />
            </div>

            <div className="flex-1 flex gap-2 items-center justify-evenly -mt-5">
              {/* HPF */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: outputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  HPF
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={outputEQ.highpass.frequency}
                  min={20}
                  max={500}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateOutputEQBand('highpass', 'frequency', value)
                  }}
                />
              </div>

              {/* LOW */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: outputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  LOW
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={outputEQ.lowShelf.frequency}
                  min={80}
                  max={250}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateOutputEQBand('lowShelf', 'frequency', value)
                  }}
                />
                <StyledKnob
                  size="xs"
                  color="amber"
                  value={outputEQ.lowShelf.gain}
                  min={-12}
                  max={12}
                  label="GAIN"
                  unit="dB"
                  onChange={(value) => {
                    updateOutputEQBand('lowShelf', 'gain', value)
                  }}
                />
              </div>

              {/* MID */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: outputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  MID
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={outputEQ.midPeak.frequency}
                  min={500}
                  max={2000}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateOutputEQBand('midPeak', 'frequency', value)
                  }}
                />
                <StyledKnob
                  size="xs"
                  color="amber"
                  value={outputEQ.midPeak.gain}
                  min={-12}
                  max={12}
                  label="GAIN"
                  unit="dB"
                  onChange={(value) => {
                    updateOutputEQBand('midPeak', 'gain', value)
                  }}
                />
              </div>

              {/* HIGH */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: outputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  HIGH
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={outputEQ.highPeak.frequency}
                  min={4000}
                  max={12000}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateOutputEQBand('highPeak', 'frequency', value)
                  }}
                />
                <StyledKnob
                  size="xs"
                  color="amber"
                  value={outputEQ.highPeak.gain}
                  min={-12}
                  max={12}
                  label="GAIN"
                  unit="dB"
                  onChange={(value) => {
                    updateOutputEQBand('highPeak', 'gain', value)
                  }}
                />
              </div>

              {/* LPF */}
              <div
                className="flex flex-col items-center gap-0.5"
                style={{ opacity: outputEQ.bypassed ? 0.5 : 1 }}
              >
                <span className="text-[7px] font-semibold text-[--color-text-tertiary] uppercase tracking-widest">
                  LPF
                </span>
                <StyledKnob
                  size="xs"
                  color="cyan"
                  value={outputEQ.lowpass.frequency}
                  min={5000}
                  max={20000}
                  label="FREQ"
                  unit="Hz"
                  onChange={(value) => {
                    updateOutputEQBand('lowpass', 'frequency', value)
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
