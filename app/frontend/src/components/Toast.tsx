import { useEffect } from 'react'
import './Toast.css'

export interface ToastItem {
  id: number
  message: string
  type: 'error' | 'success' | 'info'
}

interface ToastProps {
  toasts: ToastItem[]
  onRemove: (id: number) => void
}

function ToastMessage({ toast, onRemove }: { toast: ToastItem; onRemove: (id: number) => void }) {
  useEffect(() => {
    const timer = setTimeout(() => onRemove(toast.id), 4500)
    return () => clearTimeout(timer)
  }, [toast.id, onRemove])

  return (
    <div className={`toast-message toast-message--${toast.type}`} role="alert">
      <span className="toast-icon" aria-hidden="true">
        {toast.type === 'error' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
        ) : toast.type === 'success' ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
        )}
      </span>
      <span className="toast-text">{toast.message}</span>
      <button className="toast-close" onClick={() => onRemove(toast.id)} aria-label="Dismiss">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
    </div>
  )
}

export default function Toast({ toasts, onRemove }: ToastProps) {
  if (toasts.length === 0) return null
  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastMessage key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}
