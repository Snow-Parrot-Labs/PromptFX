import { useCallback, useEffect, useState } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { audioEngine } from '@/services/audioEngine'
import { toast } from '@/components/ui'

export function OutputDeviceSelector(): React.JSX.Element {
  const {
    audioOutputDevices,
    selectedOutputDeviceId,
    outputDeviceSupported,
    setAudioOutputDevices,
    setSelectedOutputDeviceId,
    setOutputDeviceSupported,
  } = useAudioStore()

  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)

  // Check if setSinkId is supported on mount
  useEffect(() => {
    const checkSupport = async (): Promise<void> => {
      // Need to initialize audio context first to check support
      try {
        await audioEngine.initialize()
        const supported = audioEngine.supportsSinkId()
        setOutputDeviceSupported(supported)
      } catch {
        setOutputDeviceSupported(false)
      }
    }
    void checkSupport()
  }, [setOutputDeviceSupported])

  // Load available devices
  const loadDevices = useCallback(async (): Promise<void> => {
    setIsLoadingDevices(true)
    try {
      const devices = await audioEngine.getAudioOutputDevices()
      setAudioOutputDevices(devices)
      // Select first device if none selected
      if (selectedOutputDeviceId === null && devices.length > 0) {
        setSelectedOutputDeviceId(devices[0].deviceId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load audio devices'
      toast.error(message)
    } finally {
      setIsLoadingDevices(false)
    }
  }, [selectedOutputDeviceId, setAudioOutputDevices, setSelectedOutputDeviceId])

  // Listen for device changes (e.g., plugging/unplugging audio interfaces)
  useEffect(() => {
    const handleDeviceChange = (): void => {
      void loadDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [loadDevices])

  const handleDeviceChange = useCallback(
    async (deviceId: string): Promise<void> => {
      try {
        await audioEngine.setAudioOutputDevice(deviceId)
        setSelectedOutputDeviceId(deviceId)
        const device = audioOutputDevices.find((d) => d.deviceId === deviceId)
        toast.success(`Output: ${device?.label ?? 'selected device'}`)
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to switch output device'
        toast.error(message)
      }
    },
    [audioOutputDevices, setSelectedOutputDeviceId]
  )

  const handleShowDeviceSelector = useCallback(async (): Promise<void> => {
    if (!showDeviceSelector && audioOutputDevices.length === 0) {
      await loadDevices()
    }
    setShowDeviceSelector(!showDeviceSelector)
  }, [showDeviceSelector, audioOutputDevices.length, loadDevices])

  const selectedDevice = audioOutputDevices.find((d) => d.deviceId === selectedOutputDeviceId)

  // Don't render if not supported (Safari)
  if (!outputDeviceSupported) {
    return (
      <div className="flex items-center gap-2 text-[10px] text-[--color-text-tertiary]">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
        </svg>
        <span>Output: System Default</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void handleShowDeviceSelector()
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              showDeviceSelector
                ? 'btn-mechanical-lit text-[--color-accent]'
                : 'btn-mechanical text-[--color-text-secondary]'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            Output
            {isLoadingDevices ? ' ...' : ' ▼'}
          </button>

          {selectedDevice !== undefined && !showDeviceSelector && (
            <span className="text-[10px] text-[--color-text-tertiary] truncate max-w-[120px]">
              {selectedDevice.label}
            </span>
          )}
        </div>
      </div>

      {/* Device selector dropdown */}
      {showDeviceSelector && (
        <div className="mt-1 p-2 bg-[--color-bg-tertiary] rounded border border-[--color-border]">
          <div className="text-[10px] text-[--color-text-tertiary] uppercase tracking-wider mb-1.5">
            Audio Output Device
          </div>
          {isLoadingDevices ? (
            <div className="text-xs text-[--color-text-secondary] py-2">Loading devices...</div>
          ) : audioOutputDevices.length === 0 ? (
            <div className="text-xs text-[--color-text-secondary] py-2">
              No audio output devices found
            </div>
          ) : (
            <select
              value={selectedOutputDeviceId ?? ''}
              onChange={(e) => {
                void handleDeviceChange(e.target.value)
              }}
              className="w-full px-2 py-1.5 bg-[--color-bg-secondary] text-[--color-text-primary] text-xs rounded border border-[--color-border] focus:outline-none focus:border-[--color-accent]"
            >
              {audioOutputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          )}
          {selectedDevice !== undefined && (
            <div className="mt-1.5 text-[10px] text-[--color-meter-green]">
              ● Active: {selectedDevice.label}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
