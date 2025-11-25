import { useRef, useEffect, useCallback } from 'react'
import { useAudioStore } from '@/stores'
import { useAudioEngine } from '@/hooks'

export function Waveform(): React.JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { currentTime, duration, isPlaying, fileInfo } = useAudioStore()
  const { getWaveformData, seek } = useAudioEngine()

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

    // Clear canvas
    ctx.fillStyle = 'var(--color-bg-tertiary)'
    ctx.fillRect(0, 0, width, height)

    // Get waveform data
    const waveformData = getWaveformData()

    if (waveformData && waveformData.peaks.length > 0) {
      const peaks = waveformData.peaks
      const barWidth = width / peaks.length
      const centerY = height / 2

      // Draw waveform
      ctx.fillStyle = 'var(--color-waveform)'

      for (let i = 0; i < peaks.length; i++) {
        const x = i * barWidth
        const peakHeight = (peaks[i] ?? 0) * (height * 0.8)

        // Draw symmetrical bars
        ctx.fillRect(x, centerY - peakHeight / 2, barWidth - 1, peakHeight || 1)
      }

      // Draw playhead position
      if (duration > 0) {
        const playheadX = (currentTime / duration) * width

        // Played region overlay
        ctx.fillStyle = 'rgba(99, 102, 241, 0.3)'
        ctx.fillRect(0, 0, playheadX, height)

        // Playhead line
        ctx.fillStyle = 'var(--color-playhead)'
        ctx.fillRect(playheadX - 1, 0, 2, height)
      }
    } else {
      // No waveform - show placeholder
      ctx.fillStyle = 'var(--color-text-muted)'
      ctx.font = '12px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('No audio loaded', width / 2, height / 2)
    }
  }, [getWaveformData, currentTime, duration])

  // Redraw on relevant state changes
  useEffect(() => {
    draw()
  }, [draw, fileInfo, currentTime, isPlaying])

  // Handle click to seek
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (duration <= 0) return

      const canvas = canvasRef.current
      if (!canvas) return

      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const seekTime = (x / rect.width) * duration

      seek(seekTime)
    },
    [duration, seek]
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
      onClick={handleClick}
      className="w-full h-full rounded cursor-pointer"
      style={{ imageRendering: 'pixelated' }}
    />
  )
}
