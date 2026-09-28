import type {
  PaymentRecord,
  SessionRecord,
  ShipmentRecord,
  TrackingEventRecord,
  UserRecord,
} from '../types/models'
import { getDeliveryOption, priceFor } from '../lib/pricing'
import { buildStandardEvents, shippingMethodName } from '../lib/tracking'

/**
 * Local persistence layer. Every service reads/writes through this module, so
 * swapping localStorage for a real REST/GraphQL backend later means changing
 * only these primitives (or pointing the services at the Netlify functions).
 */
export const KEYS = {
  users: 'fx.users',
  sessions: 'fx.sessions',
  shipments: 'fx.shipments',
  events: 'fx.trackingEvents',
  payments: 'fx.payments',
  seeded: 'fx.seeded.v2',
} as const

export function readCollection<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T[]) : []
  } catch {
    return []
  }
}

export function writeCollection<T>(key: string, items: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(items))
  } catch {
    /* storage full/unavailable */
  }
}

export function uid(prefix: string): string {
  let rand = ''
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const buf = new Uint8Array(8)
    crypto.getRandomValues(buf)
    rand = Array.from(buf, (b) => b.toString(16).padStart(2, '0')).join('')
  } else {
    rand = Math.random().toString(16).slice(2, 18).padEnd(16, '0')
  }
  return `${prefix}_${Date.now().toString(36)}${rand}`
}

export function randomDigits(count: number): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    const buf = new Uint32Array(1)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(buf)
      out += String(buf[0] % 10)
    } else {
      out += String(Math.floor(Math.random() * 10))
    }
  }
  return out
}

const REF_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'

export function randomChars(count: number): string {
  let out = ''
  for (let i = 0; i < count; i++) {
    const buf = new Uint32Array(1)
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
      crypto.getRandomValues(buf)
      out += REF_ALPHABET[buf[0] % REF_ALPHABET.length]
    } else {
      out += REF_ALPHABET[Math.floor(Math.random() * REF_ALPHABET.length)]
    }
  }
  return out
}

export function newTrackingNumber(): string {
  return `7946${randomDigits(8)}`
}

export function newReference(prefix = 'FX'): string {
  return `${prefix}-${randomChars(4)}-${randomChars(4)}`
}

/* ------------------------------------------------------------------ */
/* Seed + migration                                                    */
/* ------------------------------------------------------------------ */

interface DemoDef {
  trackingNumber: string
  originCity: string
  originCountry: string
  destCity: string
  destCountry: string
  senderName: string
  recipientName: string
  optionId: string
  pkgType: string
  weight: string
  depth: number
  daysAgo: number
}

const DEMO_DEFS: DemoDef[] = [
  {
    trackingNumber: '794621380054',
    originCity: 'Memphis, TN', originCountry: 'United States',
    destCity: 'Chicago, IL', destCountry: 'United States',
    senderName: 'Marcus Reed', recipientName: 'Nina Alvarez',
    optionId: 'overnight', pkgType: 'box', weight: '12.5', depth: 0, daysAgo: 2,
  },
  {
    trackingNumber: '794633827194',
    originCity: 'Los Angeles, CA', originCountry: 'United States',
    destCity: 'New York, NY', destCountry: 'United States',
    senderName: 'Priya Shah', recipientName: 'Tom Becker',
    optionId: '2-day', pkgType: 'parcel', weight: '8.2', depth: 2, daysAgo: 2,
  },
  {
    trackingNumber: '794651204838',
    originCity: 'London', originCountry: 'United Kingdom',
    destCity: 'Atlanta, GA', destCountry: 'United States',
    senderName: 'Oliver Grant', recipientName: 'Dana Fox',
    optionId: '3-day', pkgType: 'box', weight: '22.0', depth: 3, daysAgo: 3,
  },
  {
    trackingNumber: '794658912345',
    originCity: 'Dallas, TX', originCountry: 'United States',
    destCity: 'Austin, TX', destCountry: 'United States',
    senderName: 'Lena Ortiz', recipientName: 'Chris Wang',
    optionId: 'same-day', pkgType: 'document', weight: '1.1', depth: 4, daysAgo: 2,
  },
  {
    trackingNumber: '794677104296',
    originCity: 'Singapore', originCountry: 'Singapore',
    destCity: 'San Francisco, CA', destCountry: 'United States',
    senderName: 'Wei Lin', recipientName: 'Sarah Kim',
    optionId: '3-day', pkgType: 'parcel', weight: '15.8', depth: 5, daysAgo: 4,
  },
]

const STATUS_FOR_DEPTH = ['created', 'picked_up', 'in_transit', 'at_facility', 'out_for_delivery', 'delivered'] as const

function estimateIso(optionId: string): string {
  const now = new Date()
  const days = optionId === 'same-day' ? 0 : optionId === 'overnight' ? 1 : optionId === '2-day' ? 2 : 3
  now.setDate(now.getDate() + days)
  now.setHours(days === 0 ? 21 : days === 3 ? 17 : 8, 0, 0, 0)
  return now.toISOString()
}

/** One-time migration from the Phase-1 `fx.bookings` store. */
function migrateLegacyBookings(): void {
  try {
    const legacyRaw = localStorage.getItem('fx.bookings')
    if (!legacyRaw) return
    const legacy = JSON.parse(legacyRaw) as Array<Record<string, unknown>>
    const shipments = readCollection<ShipmentRecord>(KEYS.shipments)
    const payments = readCollection<PaymentRecord>(KEYS.payments)
    const events = readCollection<TrackingEventRecord>(KEYS.events)
    for (const b of legacy) {
      const id = uid('shp')
      const createdAt = String(b.createdAt ?? new Date().toISOString())
      const sender = b.sender as ShipmentRecord['sender']
      const recipient = b.recipient as ShipmentRecord['recipient']
      const pkg = b.pkg as ShipmentRecord['pkg']
      const optionId = String(b.optionId ?? '3-day')
      shipments.unshift({
        id,
        userId: null,
        reference: String(b.reference ?? newReference()),
        trackingNumber: String(b.trackingNumber),
        sender,
        recipient,
        pkg,
        optionId,
        shippingMethod: shippingMethodName(optionId),
        price: Number(b.amount ?? 20),
        status: 'created',
        currentLocation: `${sender.city} — Origin`,
        estimatedDelivery: String(b.estimateDate ?? estimateIso(optionId)),
        paymentStatus: 'paid',
        createdAt,
        updatedAt: createdAt,
      })
      events.push({
        id: uid('evt'),
        shipmentId: id,
        status: 'created',
        location: `${sender.city} — Origin`,
        note: 'Shipping label created. Shipment information received.',
        timestamp: createdAt,
        source: 'system',
      })
      payments.unshift({
        id: uid('pay'),
        shipmentId: id,
        userId: null,
        method: (b.paymentMethod as 'card' | 'transfer') ?? 'card',
        amount: Number(b.amount ?? 20),
        status: 'paid',
        reference: newReference('PAY'),
        createdAt,
        updatedAt: createdAt,
      })
    }
    writeCollection(KEYS.shipments, shipments)
    writeCollection(KEYS.payments, payments)
    writeCollection(KEYS.events, events)
    localStorage.removeItem('fx.bookings')
  } catch {
    /* corrupt legacy data — drop it */
    localStorage.removeItem('fx.bookings')
  }
}

/** Seed the five demo shipments once, so tracking works out of the box. */
export function ensureSeedData(): void {
  migrateLegacyBookings()
  if (localStorage.getItem(KEYS.seeded)) return
  const shipments = readCollection<ShipmentRecord>(KEYS.shipments)
  const events = readCollection<TrackingEventRecord>(KEYS.events)
  const payments = readCollection<PaymentRecord>(KEYS.payments)

  for (const def of DEMO_DEFS) {
    const createdAt = new Date()
    createdAt.setDate(createdAt.getDate() - def.daysAgo)
    const shipped = new Date(createdAt)
    const iso = createdAt.toISOString()
    const option = getDeliveryOption(def.optionId)
    const id = uid('shp')
    const sender: ShipmentRecord['sender'] = {
      fullName: def.senderName,
      email: `shipper${def.daysAgo}@example.com`,
      phone: '+1 555 010 2000',
      address: '400 Distribution Way',
      city: def.originCity,
      state: '—',
      country: def.originCountry,
      zip: '00000',
    }
    const recipient: ShipmentRecord['recipient'] = {
      fullName: def.recipientName,
      email: `recipient${def.daysAgo}@example.com`,
      phone: '+1 555 010 2001',
      address: '77 Commerce Street',
      city: def.destCity,
      state: '—',
      country: def.destCountry,
      zip: '00001',
    }
    const status = STATUS_FOR_DEPTH[def.depth]
    const stdEvents = buildStandardEvents(def.originCity, def.destCity, def.depth, shipped)
    const lastLoc = stdEvents[stdEvents.length - 1]?.location ?? `${def.originCity} — Origin`
    shipments.push({
      id,
      userId: null,
      reference: newReference(),
      trackingNumber: def.trackingNumber,
      sender,
      recipient,
      pkg: {
        type: def.pkgType,
        weight: def.weight,
        length: '14',
        width: '10',
        height: '6',
        description: 'General cargo',
      },
      optionId: def.optionId,
      shippingMethod: shippingMethodName(def.optionId),
      price: option ? priceFor(option) : 20,
      status,
      currentLocation: lastLoc,
      estimatedDelivery: estimateIso(def.optionId),
      paymentStatus: 'paid',
      isDemo: true,
      createdAt: iso,
      updatedAt: new Date().toISOString(),
    })
    for (const e of stdEvents) {
      events.push({
        id: uid('evt'),
        shipmentId: id,
        status: e.status,
        location: e.location,
        note: e.note,
        timestamp: e.timestamp,
        source: 'system',
      })
    }
    payments.push({
      id: uid('pay'),
      shipmentId: id,
      userId: null,
      method: 'card',
      amount: option ? priceFor(option) : 20,
      status: 'paid',
      reference: newReference('PAY'),
      card: { cardholder: def.senderName, masked: '•••• •••• •••• 4242', last4: '4242', expiry: '12/28' },
      createdAt: iso,
      updatedAt: iso,
    })
  }

  writeCollection(KEYS.shipments, shipments)
  writeCollection(KEYS.events, events)
  writeCollection(KEYS.payments, payments)
  localStorage.setItem(KEYS.seeded, '1')
}

/** Wipe every demo collection (admin settings → reset). */
export function resetAllData(): void {
  for (const key of Object.values(KEYS)) localStorage.removeItem(key)
  localStorage.removeItem('fx.draft')
  localStorage.removeItem('fx.bookings')
}

/** Sessions are stored alongside data; only current user's session is removed on sign-out. */
export function sessionHelpers() {
  return {
    readSessions: () => readCollection<SessionRecord>(KEYS.sessions),
    writeSessions: (s: SessionRecord[]) => writeCollection(KEYS.sessions, s),
  }
}

export function usersCollection() {
  return {
    read: () => readCollection<UserRecord>(KEYS.users),
    write: (u: UserRecord[]) => writeCollection(KEYS.users, u),
  }
}
