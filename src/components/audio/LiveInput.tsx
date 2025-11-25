import { useCallback, useEffect, useState } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { audioEngine } from '@/services/audioEngine'
import { toast } from '@/components/ui'

export function LiveInput(): React.JSX.Element {
  const {
    liveInputEnabled,
    liveInputError,
    levels,
    audioInputDevices,
    selectedInputDeviceId,
    setLiveInputEnabled,
    setLiveInputError,
    setSource,
    setTestToneActive,
    setAudioInputDevices,
    setSelectedInputDeviceId,
  } = useAudioStore()

  const [isLoadingDevices, setIsLoadingDevices] = useState(false)
  const [showDeviceSelector, setShowDeviceSelector] = useState(false)

  // Load available devices when component mounts or when selector is shown
  const loadDevices = useCallback(async (): Promise<void> => {
    setIsLoadingDevices(true)
    try {
      const devices = await audioEngine.getAudioInputDevices()
      setAudioInputDevices(devices)
      // Select first device if none selected
      if (selectedInputDeviceId === null && devices.length > 0) {
        setSelectedInputDeviceId(devices[0].deviceId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load audio devices'
      toast.error(message)
    } finally {
      setIsLoadingDevices(false)
    }
  }, [selectedInputDeviceId, setAudioInputDevices, setSelectedInputDeviceId])

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

  const handleToggleLiveInput = useCallback(async (): Promise<void> => {
    if (liveInputEnabled) {
      audioEngine.disableLiveInput()
      setLiveInputEnabled(false)
      setSource(null)
    } else {
      try {
        // Stop test tone if active
        setTestToneActive(false)
        audioEngine.stopTestTone()

        // Load devices if not loaded yet
        if (audioInputDevices.length === 0) {
          await loadDevices()
        }

        await audioEngine.enableLiveInputWithDevice(selectedInputDeviceId)
        setLiveInputEnabled(true)
        setSource('live')
        setLiveInputError(null)
        toast.info('Audio input enabled - use headphones to avoid feedback')
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to enable audio input'
        setLiveInputError(message)
        toast.error(message)
      }
    }
  }, [
    liveInputEnabled,
    audioInputDevices.length,
    selectedInputDeviceId,
    setLiveInputEnabled,
    setLiveInputError,
    setSource,
    setTestToneActive,
    loadDevices,
  ])

  const handleDeviceChange = useCallback(
    async (deviceId: string): Promise<void> => {
      setSelectedInputDeviceId(deviceId)

      // If live input is already enabled, switch to the new device
      if (liveInputEnabled) {
        try {
          await audioEngine.enableLiveInputWithDevice(deviceId)
          const device = audioInputDevices.find((d) => d.deviceId === deviceId)
          toast.success(`Switched to ${device?.label ?? 'selected device'}`)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to switch device'
          toast.error(message)
        }
      }
    },
    [liveInputEnabled, audioInputDevices, setSelectedInputDeviceId]
  )

  const handleShowDeviceSelector = useCallback(async (): Promise<void> => {
    if (!showDeviceSelector && audioInputDevices.length === 0) {
      await loadDevices()
    }
    setShowDeviceSelector(!showDeviceSelector)
  }, [showDeviceSelector, audioInputDevices.length, loadDevices])

  const inputLevel = Math.max(levels.inputLeft, levels.inputRight)
  const selectedDevice = audioInputDevices.find((d) => d.deviceId === selectedInputDeviceId)

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => {
              void handleToggleLiveInput()
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded text-xs font-medium transition-all ${
              liveInputEnabled
                ? 'btn-mechanical-lit text-[--color-error]'
                : 'btn-mechanical text-[--color-text-secondary]'
            }`}
            style={{
              boxShadow: liveInputEnabled
                ? 'inset 0 2px 4px rgba(0,0,0,0.5), 0 0 8px rgba(181, 74, 74, 0.4)'
                : undefined,
            }}
          >
            <svg
              className={`w-3.5 h-3.5 ${liveInputEnabled ? 'animate-pulse' : ''}`}
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5z" />
              <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            </svg>
            {liveInputEnabled ? 'Stop' : 'Input'}
          </button>

          {/* Device selector toggle */}
          <button
            type="button"
            onClick={() => {
              void handleShowDeviceSelector()
            }}
            className={`flex items-center gap-1 px-2 py-1.5 rounded text-[10px] font-medium transition-all ${
              showDeviceSelector
                ? 'btn-mechanical-lit text-[--color-accent]'
                : 'btn-mechanical text-[--color-text-tertiary]'
            }`}
            title="Select audio input device"
          >
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
            {isLoadingDevices ? '...' : '▼'}
          </button>

          {liveInputError !== null && liveInputError !== '' && (
            <span className="text-[10px] text-red-400 truncate max-w-[100px]">
              {liveInputError}
            </span>
          )}
        </div>

        {liveInputEnabled && (
          <div className="flex items-center gap-1.5">
            <div className="w-16 h-1.5 bg-[--color-bg-tertiary] rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-75 ${
                  inputLevel > 0.8
                    ? 'bg-[--color-meter-red]'
                    : inputLevel > 0.5
                      ? 'bg-[--color-meter-yellow]'
                      : 'bg-[--color-meter-green]'
                }`}
                style={{ width: `${(inputLevel * 100).toString()}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Device selector dropdown */}
      {showDeviceSelector && (
        <div className="mt-1 p-2 bg-[--color-bg-tertiary] rounded border border-[--color-border]">
          <div className="text-[10px] text-[--color-text-tertiary] uppercase tracking-wider mb-1.5">
            Audio Input Device
          </div>
          {isLoadingDevices ? (
            <div className="text-xs text-[--color-text-secondary] py-2">Loading devices...</div>
          ) : audioInputDevices.length === 0 ? (
            <div className="text-xs text-[--color-text-secondary] py-2">
              No audio input devices found
            </div>
          ) : (
            <select
              value={selectedInputDeviceId ?? ''}
              onChange={(e) => {
                void handleDeviceChange(e.target.value)
              }}
              className="w-full px-2 py-1.5 bg-[--color-bg-secondary] text-[--color-text-primary] text-xs rounded border border-[--color-border] focus:outline-none focus:border-[--color-accent]"
            >
              {audioInputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          )}
          {selectedDevice !== undefined && liveInputEnabled && (
            <div className="mt-1.5 text-[10px] text-[--color-meter-green]">
              ● Active: {selectedDevice.label}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
