import { useEffect, useRef } from 'react'
import { audioEngine } from '@/services/audioEngine'
import { MountingScrew } from './MountingScrew'

const NUM_BARS = 32
const BAR_GAP = 2
const MIN_DB = -100
const MAX_DB = -20

// Color thresholds (percentage of max height)
const YELLOW_THRESHOLD = 0.6
const RED_THRESHOLD = 0.85

// Colors matching the vintage theme
const COLORS = {
  green: '#5a9a5a',
  yellow: '#c4a43a',
  red: '#d97638',
  inactive: '#1a1610',
  background: '#0d0c0a',
  glow: {
    green: 'rgba(90, 154, 90, 0.6)',
    yellow: 'rgba(196, 164, 58, 0.6)',
    red: 'rgba(217, 118, 56, 0.6)',
  },
}

function drawSpectrum(
  ctx: CanvasRenderingContext2D,
  data: Float32Array,
  width: number,
  height: number
): void {
  // Clear canvas
  ctx.fillStyle = COLORS.background
  ctx.fillRect(0, 0, width, height)

  const barWidth = (width - (NUM_BARS + 1) * BAR_GAP) / NUM_BARS
  const maxBarHeight = height - 8 // Padding

  for (let i = 0; i < NUM_BARS; i++) {
    // Get dB value and normalize to 0-1
    const db = data[i] ?? MIN_DB
    const normalized = Math.max(0, Math.min(1, (db - MIN_DB) / (MAX_DB - MIN_DB)))

    const barHeight = normalized * maxBarHeight
    const x = BAR_GAP + i * (barWidth + BAR_GAP)
    const y = height - 4 - barHeight

    if (barHeight > 1) {
      // Determine color based on height
      let color: string
      let glowColor: string

      if (normalized >= RED_THRESHOLD) {
        color = COLORS.red
        glowColor = COLORS.glow.red
      } else if (normalized >= YELLOW_THRESHOLD) {
        color = COLORS.yellow
        glowColor = COLORS.glow.yellow
      } else {
        color = COLORS.green
        glowColor = COLORS.glow.green
      }

      // Draw glow effect
      ctx.shadowColor = glowColor
      ctx.shadowBlur = 4
      ctx.shadowOffsetX = 0
      ctx.shadowOffsetY = 0

      // Draw bar with rounded top
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.roundRect(x, y, barWidth, barHeight, [2, 2, 0, 0])
      ctx.fill()

      // Reset shadow
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
    }

    // Draw inactive bar segment (dim background)
    const inactiveHeight = maxBarHeight - barHeight
    if (inactiveHeight > 0) {
      ctx.fillStyle = COLORS.inactive
      ctx.globalAlpha = 0.3
      ctx.beginPath()
      ctx.roundRect(x, 4, barWidth, inactiveHeight, [2, 2, 0, 0])
      ctx.fill()
      ctx.globalAlpha = 1
    }
  }
}

export function SpectrumAnalyzer(): React.JSX.Element {
  const inputCanvasRef = useRef<HTMLCanvasElement>(null)
  const outputCanvasRef = useRef<HTMLCanvasElement>(null)
  const animationRef = useRef<number | null>(null)

  useEffect(() => {
    const inputCanvas = inputCanvasRef.current
    const outputCanvas = outputCanvasRef.current
    if (!inputCanvas || !outputCanvas) return

    const inputCtx = inputCanvas.getContext('2d')
    const outputCtx = outputCanvas.getContext('2d')
    if (!inputCtx || !outputCtx) return

    const draw = (): void => {
      const inputData = audioEngine.getInputSpectrum()
      const outputData = audioEngine.getOutputSpectrum()

      drawSpectrum(inputCtx, inputData, inputCanvas.width, inputCanvas.height)
      drawSpectrum(outputCtx, outputData, outputCanvas.width, outputCanvas.height)

      animationRef.current = requestAnimationFrame(draw)
    }

    draw()

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="relative w-full">
      {/* Corner screws - simplified for 1U */}
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
        className="relative rounded-lg overflow-hidden bg-[--color-bg-panel]"
        style={{
          height: '88px', // 1U
          boxShadow: `
            inset 2px 2px 4px rgba(255,255,255,0.05),
            inset -2px -2px 4px rgba(0,0,0,0.3),
            0 4px 16px rgba(0,0,0,0.5),
            0 8px 32px rgba(0,0,0,0.3)
          `,
        }}
      >
        {/* Panel content */}
        <div className="h-full flex items-center px-4 gap-4">
          {/* Input Spectrum */}
          <div className="flex-1 h-full py-2 flex flex-col">
            <div className="text-[9px] uppercase tracking-wider text-[--color-text-tertiary] mb-1 text-center font-medium">
              Input
            </div>
            <div className="flex-1 relative rounded overflow-hidden border border-[--color-border]">
              <canvas
                ref={inputCanvasRef}
                width={320}
                height={56}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>

          {/* Center divider with label */}
          <div className="flex flex-col items-center justify-center h-full py-2">
            <div
              className="text-[8px] uppercase tracking-widest text-[--color-text-tertiary] font-semibold"
              style={{
                writingMode: 'vertical-rl',
                textOrientation: 'mixed',
                transform: 'rotate(180deg)',
              }}
            >
              Spectrum
            </div>
          </div>

          {/* Output Spectrum */}
          <div className="flex-1 h-full py-2 flex flex-col">
            <div className="text-[9px] uppercase tracking-wider text-[--color-text-tertiary] mb-1 text-center font-medium">
              Output
            </div>
            <div className="flex-1 relative rounded overflow-hidden border border-[--color-border]">
              <canvas
                ref={outputCanvasRef}
                width={320}
                height={56}
                className="w-full h-full"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
