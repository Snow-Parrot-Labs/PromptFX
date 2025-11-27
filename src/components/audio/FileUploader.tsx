import { useCallback, useState } from 'react'
import { useAudioStore, useUIStore } from '@/stores'
import { useAudioEngine } from '@/hooks'
import { SUPPORTED_FORMATS, MAX_FILE_SIZE, SUPPORTED_EXTENSIONS } from '@/types/audio'
import { toast } from '@/components/ui'

export function FileUploader(): React.JSX.Element {
  const { fileInfo } = useAudioStore()
  const { isFileUploading, setIsFileUploading, setGlobalError } = useUIStore()
  const { loadFile } = useAudioEngine()
  const [isDragOver, setIsDragOver] = useState(false)

  const validateFile = useCallback((file: File): string | null => {
    // Check file type
    const isValidType = SUPPORTED_FORMATS.some((format) => file.type === format)
    const isValidExt = SUPPORTED_EXTENSIONS.some((ext) => file.name.toLowerCase().endsWith(ext))

    if (!isValidType && !isValidExt) {
      return 'Unsupported file format. Please upload WAV, MP3, or AIFF files.'
    }

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      return `File too large. Maximum size is ${String(MAX_FILE_SIZE / (1024 * 1024))}MB.`
    }

    return null
  }, [])

  const handleFile = useCallback(
    async (file: File) => {
      const error = validateFile(file)
      if (error !== null) {
        toast.error(error)
        return
      }

      setIsFileUploading(true)
      try {
        await loadFile(file)
        toast.success(`Loaded "${file.name}"`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load audio file'
        toast.error(message)
        setGlobalError(message)
      } finally {
        setIsFileUploading(false)
      }
    },
    [validateFile, loadFile, setIsFileUploading, setGlobalError]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragOver(false)

      const file = e.dataTransfer.files[0]
      if (file) {
        void handleFile(file)
      }
    },
    [handleFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleClick = useCallback(() => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = SUPPORTED_EXTENSIONS.join(',')
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        void handleFile(file)
      }
    }
    input.click()
  }, [handleFile])

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${String(bytes)} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${String(mins)}:${secs.toString().padStart(2, '0')}`
  }

  if (fileInfo) {
    return (
      <div className="flex items-center justify-between p-3 bg-[--color-bg-tertiary] rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded bg-[--color-accent-primary]/20 flex items-center justify-center">
            <svg
              className="w-5 h-5 text-[--color-accent-primary]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
              />
            </svg>
          </div>
          <div>
            <p className="text-sm font-medium text-[--color-text-primary] truncate max-w-[200px]">
              {fileInfo.name}
            </p>
            <p className="text-xs text-[--color-text-muted]">
              {formatDuration(fileInfo.duration)} • {formatFileSize(fileInfo.size)} •{' '}
              {fileInfo.channels}ch
            </p>
          </div>
        </div>
        <button
          onClick={handleClick}
          className="px-3 py-1.5 text-xs rounded bg-[--color-bg-panel] text-[--color-text-secondary] hover:text-[--color-text-primary] transition-colors"
        >
          Replace
        </button>
      </div>
    )
  }

  return (
    <div
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onClick={handleClick}
      className={`h-full flex items-center justify-center border-2 border-dashed rounded cursor-pointer transition-colors ${
        isDragOver
          ? 'border-[--color-accent-primary] bg-[--color-accent-primary]/10'
          : 'border-[--color-border] hover:border-[--color-text-muted]'
      }`}
    >
      {isFileUploading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[--color-accent-primary] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-[--color-text-secondary]">Loading...</span>
        </div>
      ) : (
        <div className="text-center px-2">
          <p className="text-[--color-text-muted] text-xs">
            {isDragOver ? 'Drop file here' : 'Drop audio or click to upload'}
          </p>
          <p className="text-[--color-text-muted] text-[10px] mt-0.5">WAV, MP3, AIFF</p>
        </div>
      )}
    </div>
  )
}
