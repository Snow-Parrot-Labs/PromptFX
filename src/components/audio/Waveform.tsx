import { useRef, useEffect, useCallback, useState } from 'react'
import { useAudioStore } from '@/stores'
import { useAudioEngine } from '@/hooks'

const RULER_HEIGHT = 14 // Height reserved for time ruler at bottom

// Format time as M:SS.d or MM:SS
function formatTime(seconds: number, short = false): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  if (short) {
    return `${String(mins)}:${secs.toString().padStart(2, '0')}`
  }
  const tenths = Math.floor((seconds % 1) * 10)
  return `${String(mins)}:${secs.toString().padStart(2, '0')}.${String(tenths)}`
}

// Draw time ruler with tick marks
function drawTimeRuler(
  ctx: CanvasRenderingContext2D,
  width: number,
  yOffset: number,
  totalDuration: number
): void {
  if (totalDuration <= 0) return

  // Determine tick interval based on duration
  let majorInterval: number
  let minorInterval: number

  if (totalDuration <= 10) {
    majorInterval = 1
    minorInterval = 0.5
  } else if (totalDuration <= 30) {
    majorInterval = 5
    minorInterval = 1
  } else if (totalDuration <= 60) {
    majorInterval = 10
    minorInterval = 5
  } else if (totalDuration <= 180) {
    majorInterval = 30
    minorInterval = 10
  } else {
    majorInterval = 60
    minorInterval = 30
  }

  ctx.fillStyle = '#6b7280'
  ctx.font = '9px ui-monospace, monospace'
  ctx.textAlign = 'center'

  // Draw minor ticks
  for (let t = 0; t <= totalDuration; t += minorInterval) {
    const x = (t / totalDuration) * width
    ctx.fillStyle = '#3f3f46'
    ctx.fillRect(x, yOffset, 1, 3)
  }

  // Draw major ticks and labels
  for (let t = 0; t <= totalDuration; t += majorInterval) {
    const x = (t / totalDuration) * width

    // Major tick
    ctx.fillStyle = '#71717a'
    ctx.fillRect(x, yOffset, 1, 5)

    // Label (skip if too close to edge)
    if (x > 15 && x < width - 15) {
      ctx.fillStyle = '#71717a'
      ctx.fillText(formatTime(t, true), x, yOffset + RULER_HEIGHT - 2)
    }
  }

  // Always show start and end times
  ctx.fillStyle = '#71717a'
  ctx.textAlign = 'left'
  ctx.fillText('0:00', 2, yOffset + RULER_HEIGHT - 2)
  ctx.textAlign = 'right'
  ctx.fillText(formatTime(totalDuration, true), width - 2, yOffset + RULER_HEIGHT - 2)
}

export function Waveform(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentTime, duration, isPlaying, fileInfo } = useAudioStore()
  const { getWaveformData, seek, play } = useAudioEngine()
  const [hoverX, setHoverX] = useState<number | null>(null)
  const [hoverTime, setHoverTime] = useState<number>(0)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    // Set canvas size accounting for device pixel ratio
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const width = rect.width
    const height = rect.height
    const waveformHeight = height - RULER_HEIGHT

    // Clear canvas with dark background
    ctx.fillStyle = '#1a1a1e'
    ctx.fillRect(0, 0, width, height)

    // Get waveform data
    const waveformData = getWaveformData()

    if (waveformData && waveformData.peaks.length > 0) {
      const peaks = waveformData.peaks
      const barWidth = width / peaks.length
      const centerY = waveformHeight / 2

      // Draw played region with vintage amber tint
      if (duration > 0) {
        const playheadX = (currentTime / duration) * width
        const gradient = ctx.createLinearGradient(0, 0, 0, waveformHeight)
        gradient.addColorStop(0, 'rgba(196, 163, 90, 0.15)')
        gradient.addColorStop(0.5, 'rgba(196, 163, 90, 0.25)')
        gradient.addColorStop(1, 'rgba(196, 163, 90, 0.15)')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, playheadX, waveformHeight)
      }

      // Draw waveform bars with gradient
      for (let i = 0; i < peaks.length; i++) {
        const x = i * barWidth
        const peakValue = peaks[i] ?? 0
        const peakHeight = Math.max(1, peakValue * (waveformHeight * 0.85))

        // Check if this bar is in the played region
        const barProgress = (i + 0.5) / peaks.length
        const isPlayedBar = duration > 0 && barProgress <= currentTime / duration

        if (isPlayedBar) {
          // Played bars - bright amber
          ctx.fillStyle = '#c4a35a'
        } else {
          // Unplayed bars - muted gray-blue
          ctx.fillStyle = '#4a5568'
        }

        // Draw symmetrical bar
        const barX = x + 0.5
        const barY = centerY - peakHeight / 2
        ctx.fillRect(barX, barY, Math.max(1, barWidth - 1), peakHeight)
      }

      // Draw playhead line
      if (duration > 0) {
        const playheadX = (currentTime / duration) * width

        // Playhead glow
        ctx.shadowColor = '#c4a35a'
        ctx.shadowBlur = 6
        ctx.fillStyle = '#c4a35a'
        ctx.fillRect(playheadX - 1, 0, 2, waveformHeight)
        ctx.shadowBlur = 0
      }

      // Draw hover cursor
      if (hoverX !== null) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
        ctx.fillRect(hoverX - 0.5, 0, 1, waveformHeight)
      }

      // Draw time ruler background
      ctx.fillStyle = '#0f0f11'
      ctx.fillRect(0, waveformHeight, width, RULER_HEIGHT)

      // Draw time ruler
      drawTimeRuler(ctx, width, waveformHeight, duration)

      // Draw hover time tooltip
      if (hoverX !== null && hoverTime >= 0) {
        const tooltipText = formatTime(hoverTime)
        ctx.font = '10px ui-monospace, monospace'
        const textWidth = ctx.measureText(tooltipText).width
        const tooltipX = Math.min(Math.max(hoverX - textWidth / 2, 4), width - textWidth - 4)

        // Tooltip background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.85)'
        ctx.beginPath()
        ctx.roundRect(tooltipX - 4, 2, textWidth + 8, 14, 3)
        ctx.fill()

        // Tooltip text
        ctx.fillStyle = '#c4a35a'
        ctx.fillText(tooltipText, tooltipX, 12)
      }
    } else {
      // No waveform - show placeholder
      ctx.fillStyle = '#6b7280'
      ctx.font = '11px system-ui, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('No audio loaded', width / 2, height / 2)
    }
  }, [getWaveformData, currentTime, duration, hoverX, hoverTime])

  // Redraw on relevant state changes
  useEffect(() => {
    draw()
  }, [draw, fileInfo, currentTime, isPlaying])

  // Handle mouse move for hover
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current
      if (!canvas || duration <= 0) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const time = (x / rect.width) * duration

      setHoverX(x)
      setHoverTime(Math.max(0, Math.min(time, duration)))
    },
    [duration]
  )

  const handleMouseLeave = useCallback(() => {
    setHoverX(null)
  }, [])

  // Handle click to seek and play
  const handleClick = useCallback(
    async (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (duration <= 0) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const seekTime = (x / rect.width) * duration

      seek(seekTime)

      // Start playing if not already playing
      if (!isPlaying) {
        await play()
      }
    },
    [duration, seek, isPlaying, play]
  )

  // Handle resize
  useEffect(() => {
    const handleResize = (): void => {
      draw()
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
    }
  }, [draw])

  return (
    <canvas
      ref={canvasRef}
      onClick={(e) => void handleClick(e)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full cursor-pointer"
      style={{ imageRendering: 'crisp-edges' }}
    />
  )
}
