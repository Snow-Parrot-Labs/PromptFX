import { useAudioStore } from '@/stores/audioStore'

type SourceTab = 'file' | 'live' | 'test'

export function SourceSelector(): React.JSX.Element {
  const { source, testToneActive, liveInputEnabled } = useAudioStore()

  const getCurrentTab = (): SourceTab => {
    if (liveInputEnabled) return 'live'
    if (testToneActive) return 'test'
    return 'file'
  }

  const currentTab = getCurrentTab()

  return (
    <div className="flex gap-1 p-1 bg-gray-800 rounded-lg">
      <TabButton
        label="File"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
            />
          </svg>
        }
        isActive={currentTab === 'file'}
        hasContent={source === 'file'}
      />
      <TabButton
        label="Live"
        icon={
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
          </svg>
        }
        isActive={currentTab === 'live'}
        hasContent={liveInputEnabled}
      />
      <TabButton
        label="Test"
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2z"
            />
          </svg>
        }
        isActive={currentTab === 'test'}
        hasContent={testToneActive}
      />
    </div>
  )
}

interface TabButtonProps {
  label: string
  icon: React.ReactNode
  isActive: boolean
  hasContent: boolean
}

function TabButton({ label, icon, isActive, hasContent }: TabButtonProps): React.JSX.Element {
  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        isActive ? 'bg-gray-700 text-white' : 'text-gray-400'
      }`}
    >
      {icon}
      <span>{label}</span>
      {hasContent && <span className="w-2 h-2 rounded-full bg-green-500" />}
    </div>
  )
}
