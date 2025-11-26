import { useCallback, useEffect, useState } from 'react'
import { useAudioStore } from '@/stores/audioStore'
import { audioEngine } from '@/services/audioEngine'
import { toast } from '@/components/ui'

export function AudioIOSection(): React.JSX.Element {
  const {
    liveInputEnabled,
    audioInputDevices,
    selectedInputDeviceId,
    audioOutputDevices,
    selectedOutputDeviceId,
    outputDeviceSupported,
    setLiveInputEnabled,
    setLiveInputError,
    setSource,
    setTestToneActive,
    setAudioInputDevices,
    setSelectedInputDeviceId,
    setAudioOutputDevices,
    setSelectedOutputDeviceId,
    setOutputDeviceSupported,
  } = useAudioStore()

  const [isLoadingInputDevices, setIsLoadingInputDevices] = useState(false)
  const [isLoadingOutputDevices, setIsLoadingOutputDevices] = useState(false)

  // Check if setSinkId is supported on mount
  useEffect(() => {
    const checkSupport = async (): Promise<void> => {
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

  // Load input devices
  const loadInputDevices = useCallback(async (): Promise<void> => {
    setIsLoadingInputDevices(true)
    try {
      const devices = await audioEngine.getAudioInputDevices()
      setAudioInputDevices(devices)
      if (selectedInputDeviceId === null && devices.length > 0) {
        setSelectedInputDeviceId(devices[0].deviceId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load input devices'
      toast.error(message)
    } finally {
      setIsLoadingInputDevices(false)
    }
  }, [selectedInputDeviceId, setAudioInputDevices, setSelectedInputDeviceId])

  // Load output devices
  const loadOutputDevices = useCallback(async (): Promise<void> => {
    setIsLoadingOutputDevices(true)
    try {
      const devices = await audioEngine.getAudioOutputDevices()
      setAudioOutputDevices(devices)
      if (selectedOutputDeviceId === null && devices.length > 0) {
        setSelectedOutputDeviceId(devices[0].deviceId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to load output devices'
      toast.error(message)
    } finally {
      setIsLoadingOutputDevices(false)
    }
  }, [selectedOutputDeviceId, setAudioOutputDevices, setSelectedOutputDeviceId])

  // Load all devices on mount
  useEffect(() => {
    void loadInputDevices()
    void loadOutputDevices()
  }, [loadInputDevices, loadOutputDevices])

  // Listen for device changes
  useEffect(() => {
    const handleDeviceChange = (): void => {
      void loadInputDevices()
      void loadOutputDevices()
    }

    navigator.mediaDevices.addEventListener('devicechange', handleDeviceChange)
    return () => {
      navigator.mediaDevices.removeEventListener('devicechange', handleDeviceChange)
    }
  }, [loadInputDevices, loadOutputDevices])

  // Handle input device change
  const handleInputDeviceChange = useCallback(
    async (deviceId: string): Promise<void> => {
      setSelectedInputDeviceId(deviceId)

      // If live input is already enabled, switch to the new device
      if (liveInputEnabled) {
        try {
          await audioEngine.enableLiveInputWithDevice(deviceId)
          const device = audioInputDevices.find((d) => d.deviceId === deviceId)
          toast.success(`Input: ${device?.label ?? 'selected device'}`)
        } catch (error) {
          const message = error instanceof Error ? error.message : 'Failed to switch input device'
          toast.error(message)
        }
      }
    },
    [liveInputEnabled, audioInputDevices, setSelectedInputDeviceId]
  )

  // Handle output device change
  const handleOutputDeviceChange = useCallback(
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

  // Handle toggling live input
  const handleToggleLiveInput = useCallback(async (): Promise<void> => {
    if (liveInputEnabled) {
      audioEngine.disableLiveInput()
      setLiveInputEnabled(false)
      setSource(null)
    } else {
      try {
        setTestToneActive(false)
        audioEngine.stopTestTone()

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
    selectedInputDeviceId,
    setLiveInputEnabled,
    setLiveInputError,
    setSource,
    setTestToneActive,
  ])

  return (
    <div className="space-y-3">
      {/* Input Device */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-[10px] text-[--color-text-tertiary] uppercase tracking-wider">
            Input
          </label>
          <button
            type="button"
            onClick={() => {
              void handleToggleLiveInput()
            }}
            className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
              liveInputEnabled
                ? 'btn-mechanical-lit text-[--color-error]'
                : 'btn-mechanical text-[--color-text-tertiary]'
            }`}
            style={{
              boxShadow: liveInputEnabled
                ? 'inset 0 1px 2px rgba(0,0,0,0.5), 0 0 6px rgba(181, 74, 74, 0.4)'
                : undefined,
            }}
          >
            {liveInputEnabled ? '● LIVE' : 'OFF'}
          </button>
        </div>
        {isLoadingInputDevices ? (
          <div className="text-xs text-[--color-text-secondary] py-1">Loading...</div>
        ) : (
          <select
            value={selectedInputDeviceId ?? ''}
            onChange={(e) => {
              void handleInputDeviceChange(e.target.value)
            }}
            className="w-full px-2 py-1.5 bg-[--color-bg-tertiary] text-[--color-text-primary] text-xs rounded border border-[--color-border] focus:outline-none focus:border-[--color-accent]"
          >
            {audioInputDevices.length === 0 ? (
              <option value="">No input devices</option>
            ) : (
              audioInputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))
            )}
          </select>
        )}
      </div>

      {/* Output Device */}
      <div>
        <label className="text-[10px] text-[--color-text-tertiary] uppercase tracking-wider block mb-1.5">
          Output
        </label>
        {!outputDeviceSupported ? (
          <div className="text-xs text-[--color-text-secondary] py-1.5 px-2 bg-[--color-bg-tertiary] rounded border border-[--color-border]">
            System Default (browser limitation)
          </div>
        ) : isLoadingOutputDevices ? (
          <div className="text-xs text-[--color-text-secondary] py-1">Loading...</div>
        ) : (
          <select
            value={selectedOutputDeviceId ?? ''}
            onChange={(e) => {
              void handleOutputDeviceChange(e.target.value)
            }}
            className="w-full px-2 py-1.5 bg-[--color-bg-tertiary] text-[--color-text-primary] text-xs rounded border border-[--color-border] focus:outline-none focus:border-[--color-accent]"
          >
            {audioOutputDevices.length === 0 ? (
              <option value="">No output devices</option>
            ) : (
              audioOutputDevices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))
            )}
          </select>
        )}
      </div>
    </div>
  )
}
