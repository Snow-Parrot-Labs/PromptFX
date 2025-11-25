import { useState, useEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'

export interface ToastMessage {
  id: string
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
}

interface ToastItemProps {
  toast: ToastMessage
  onRemove: (id: string) => void
}

function ToastItem({ toast, onRemove }: ToastItemProps): React.JSX.Element {
  useEffect(() => {
    const duration = toast.duration ?? 4000
    if (duration > 0) {
      const timer = setTimeout(() => {
        onRemove(toast.id)
      }, duration)
      return () => {
        clearTimeout(timer)
      }
    }
    return undefined
  }, [toast.id, toast.duration, onRemove])

  const colors = {
    success: 'bg-green-800 border-green-600 text-green-100',
    error: 'bg-red-800 border-red-600 text-red-100',
    warning: 'bg-yellow-800 border-yellow-600 text-yellow-100',
    info: 'bg-blue-800 border-blue-600 text-blue-100',
  }

  const icons = {
    success: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M6 18L18 6M6 6l12 12"
        />
      </svg>
    ),
    warning: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
    ),
    info: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  }

  return (
    <div
      className={`${colors[toast.type]} border rounded-lg p-3 shadow-lg flex items-center gap-3 animate-slide-in`}
      role="alert"
    >
      <span className="flex-shrink-0">{icons[toast.type]}</span>
      <span className="text-sm flex-1">{toast.message}</span>
      <button
        type="button"
        onClick={() => {
          onRemove(toast.id)
        }}
        className="opacity-70 hover:opacity-100 flex-shrink-0"
        aria-label="Dismiss"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
    </div>
  )
}

// Toast container and manager
let toastListeners: Array<(toasts: ToastMessage[]) => void> = []
let toasts: ToastMessage[] = []

function notifyListeners(): void {
  toastListeners.forEach((listener) => {
    listener([...toasts])
  })
}

export const toast = {
  show: (message: string, type: ToastMessage['type'] = 'info', duration?: number): string => {
    const id = `toast-${Date.now().toString()}-${Math.random().toString(36).substring(2, 11)}`
    const newToast: ToastMessage = { id, message, type }
    if (duration !== undefined) {
      newToast.duration = duration
    }
    toasts = [...toasts, newToast]
    notifyListeners()
    return id
  },
  success: (message: string, duration?: number): string => toast.show(message, 'success', duration),
  error: (message: string, duration?: number): string => toast.show(message, 'error', duration),
  warning: (message: string, duration?: number): string => toast.show(message, 'warning', duration),
  info: (message: string, duration?: number): string => toast.show(message, 'info', duration),
  remove: (id: string): void => {
    toasts = toasts.filter((t) => t.id !== id)
    notifyListeners()
  },
  clear: (): void => {
    toasts = []
    notifyListeners()
  },
}

export function ToastContainer(): React.JSX.Element | null {
  const [currentToasts, setCurrentToasts] = useState<ToastMessage[]>([])

  useEffect(() => {
    toastListeners.push(setCurrentToasts)
    return () => {
      toastListeners = toastListeners.filter((l) => l !== setCurrentToasts)
    }
  }, [])

  const handleRemove = useCallback((id: string) => {
    toast.remove(id)
  }, [])

  if (currentToasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
      {currentToasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={handleRemove} />
      ))}
    </div>,
    document.body
  )
}
