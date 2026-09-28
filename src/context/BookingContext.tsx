import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { BookingDraft } from '../lib/types'
import { clearDraft, emptyDraft, loadDraft, saveDraft } from '../lib/booking'

interface BookingApi {
  draft: BookingDraft
  update: (patch: Partial<BookingDraft>) => void
  setSender: (patch: Partial<BookingDraft['sender']>) => void
  setRecipient: (patch: Partial<BookingDraft['recipient']>) => void
  setPackage: (patch: Partial<BookingDraft['pkg']>) => void
  setOptionId: (id: string) => void
  reset: () => void
}

const BookingContext = createContext<BookingApi | null>(null)

export function useBooking(): BookingApi {
  const ctx = useContext(BookingContext)
  if (!ctx) throw new Error('useBooking must be used inside BookingProvider')
  return ctx
}

export function BookingProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<BookingDraft>(() => loadDraft())

  useEffect(() => {
    saveDraft(draft)
  }, [draft])

  const api = useMemo<BookingApi>(
    () => ({
      draft,
      update: (patch) => setDraft((d) => ({ ...d, ...patch })),
      setSender: (patch) => setDraft((d) => ({ ...d, sender: { ...d.sender, ...patch } })),
      setRecipient: (patch) =>
        setDraft((d) => ({ ...d, recipient: { ...d.recipient, ...patch } })),
      setPackage: (patch) => setDraft((d) => ({ ...d, pkg: { ...d.pkg, ...patch } })),
      setOptionId: (id) => setDraft((d) => ({ ...d, optionId: id })),
      reset: () => {
        clearDraft()
        setDraft(emptyDraft())
      },
    }),
    [draft],
  )

  return <BookingContext.Provider value={api}>{children}</BookingContext.Provider>
}
