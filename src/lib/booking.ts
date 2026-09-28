import type { Address, BookingDraft, PackageInfo } from './types'

/**
 * Booking-draft persistence for the multi-step Ship wizard. Shipment creation
 * itself now lives in services/shipmentsService.ts.
 */

const DRAFT_KEY = 'fx.draft'

export function emptyAddress(): Address {
  return {
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: '',
    zip: '',
  }
}

export function emptyPackage(): PackageInfo {
  return {
    type: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    description: '',
  }
}

export function emptyDraft(): BookingDraft {
  return {
    sender: emptyAddress(),
    recipient: emptyAddress(),
    pkg: emptyPackage(),
    optionId: null,
  }
}

export function loadDraft(): BookingDraft {
  try {
    const raw = localStorage.getItem(DRAFT_KEY)
    if (!raw) return emptyDraft()
    return { ...emptyDraft(), ...(JSON.parse(raw) as BookingDraft) }
  } catch {
    return emptyDraft()
  }
}

export function saveDraft(draft: BookingDraft): void {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
  } catch {
    /* storage unavailable */
  }
}

export function clearDraft(): void {
  try {
    localStorage.removeItem(DRAFT_KEY)
  } catch {
    /* storage unavailable */
  }
}
