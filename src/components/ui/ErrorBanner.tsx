import { useState, useCallback, useEffect } from 'react'

interface ErrorBannerProps {
  message: string
  type?: 'error' | 'warning' | 'info'
  dismissible?: boolean
  onDismiss?: () => void
  action?: {
    label: string
    onClick: () => void
  }
  autoHide?: number // ms to auto-hide, 0 = never
}

export function ErrorBanner({
  message,
  type = 'error',
  dismissible = true,
  onDismiss,
  action,
  autoHide = 0,
}: ErrorBannerProps): React.JSX.Element | null {
  const [visible, setVisible] = useState(true)

  const handleDismiss = useCallback(() => {
    setVisible(false)
    onDismiss?.()
  }, [onDismiss])

  useEffect(() => {
    if (autoHide > 0) {
      const timer = setTimeout(handleDismiss, autoHide)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [autoHide, handleDismiss])

  if (!visible) return null

  const colors = {
    error: {
      bg: 'bg-red-900/50',
      border: 'border-red-700',
      text: 'text-red-200',
      icon: 'text-red-400',
    },
    warning: {
      bg: 'bg-yellow-900/50',
      border: 'border-yellow-700',
      text: 'text-yellow-200',
      icon: 'text-yellow-400',
    },
    info: {
      bg: 'bg-blue-900/50',
      border: 'border-blue-700',
      text: 'text-blue-200',
      icon: 'text-blue-400',
    },
  }

  const style = colors[type]

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-lg p-3 flex items-start gap-3`}
      role="alert"
    >
      <div className={`${style.icon} flex-shrink-0 mt-0.5`}>
        {type === 'error' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
        {type === 'warning' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        )}
        {type === 'info' && (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`${style.text} text-sm`}>{message}</p>
        {action && (
          <button
            type="button"
            onClick={action.onClick}
            className={`${style.text} text-sm underline hover:no-underline mt-1`}
          >
            {action.label}
          </button>
        )}
      </div>
      {dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={`${style.icon} hover:opacity-70 flex-shrink-0`}
          aria-label="Dismiss"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </div>
  )
}
