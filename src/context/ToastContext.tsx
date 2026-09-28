import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react'

type ToastKind = 'success' | 'error' | 'info'

interface Toast {
  id: number
  kind: ToastKind
  title: string
  message?: string
}

interface ToastApi {
  success: (title: string, message?: string) => void
  error: (title: string, message?: string) => void
  info: (title: string, message?: string) => void
}

const ToastContext = createContext<ToastApi | null>(null)

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx
}

let nextId = 1

const KIND_STYLES: Record<ToastKind, { icon: typeof Info; ring: string; iconColor: string }> = {
  success: { icon: CheckCircle2, ring: 'ring-green-200/70', iconColor: 'text-green-600' },
  error: { icon: AlertTriangle, ring: 'ring-red-200/70', iconColor: 'text-red-600' },
  info: { icon: Info, ring: 'ring-fx-purple-200/70', iconColor: 'text-fx-purple-600' },
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const dismiss = useCallback((id: number) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (kind: ToastKind, title: string, message?: string) => {
      const id = nextId++
      setToasts((t) => [...t.slice(-3), { id, kind, title, message }])
      window.setTimeout(() => dismiss(id), 4800)
    },
    [dismiss],
  )

  const api = useMemo<ToastApi>(
    () => ({
      success: (title: string, message?: string) => push('success', title, message),
      error: (title: string, message?: string) => push('error', title, message),
      info: (title: string, message?: string) => push('info', title, message),
    }),
    [push],
  )

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,380px)] flex-col gap-2"
      >
        {toasts.map((t) => {
          const meta = KIND_STYLES[t.kind]
          const Icon = meta.icon
          return (
            <div
              key={t.id}
              role="status"
              className={`toast-item pointer-events-auto flex items-start gap-3 rounded-2xl bg-white p-4 shadow-lift ring-1 ${meta.ring}`}
            >
              <Icon size={20} className={`mt-0.5 shrink-0 ${meta.iconColor}`} aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-bold text-ink">{t.title}</p>
                {t.message && <p className="mt-0.5 text-xs text-gray-500">{t.message}</p>}
              </div>
              <button
                onClick={() => dismiss(t.id)}
                className="rounded-md p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

/** Copy helper shared by copy buttons across the app. */
export function useCopy(): (text: string, label?: string) => void {
  const toast = useToast()
  return useCallback(
    (text: string, label = 'Copied to clipboard') => {
      const done = () => toast.success(label, text)
      if (navigator.clipboard?.writeText) {
        navigator.clipboard.writeText(text).then(done, done)
      } else {
        const ta = document.createElement('textarea')
        ta.value = text
        document.body.appendChild(ta)
        ta.select()
        document.execCommand('copy')
        document.body.removeChild(ta)
        done()
      }
    },
    [toast],
  )
}

export function useBodyLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [locked])
}
