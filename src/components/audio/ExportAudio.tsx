import { useState, useCallback } from 'react'
import { audioEngine } from '@/services/audioEngine'
import { useAudioStore } from '@/stores/audioStore'
import { toast } from '@/components/ui'

export function ExportAudio(): React.JSX.Element {
  const { fileInfo } = useAudioStore()
  const [isExporting, setIsExporting] = useState(false)

  const handleExport = useCallback(async (): Promise<void> => {
    if (!audioEngine.hasAudioFile()) return

    setIsExporting(true)
    try {
      const blob = await audioEngine.exportProcessedAudio()
      if (blob === null) {
        throw new Error('Export failed')
      }

      // Download the file
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      const originalName = fileInfo?.name ?? 'audio'
      const baseName = originalName.replace(/\.[^/.]+$/, '')
      a.download = `${baseName}_processed.wav`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      toast.success('Audio exported successfully')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Failed to export audio')
    } finally {
      setIsExporting(false)
    }
  }, [fileInfo])

  const hasAudio = audioEngine.hasAudioFile()

  return (
    <button
      type="button"
      onClick={() => {
        void handleExport()
      }}
      disabled={!hasAudio || isExporting}
      className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg transition-colors flex items-center gap-1.5"
    >
      {isExporting ? (
        <>
          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Exporting...
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
            />
          </svg>
          Export WAV
        </>
      )}
    </button>
  )
}
