import type { EventState, Shipment, ShipmentStatus, TrackingEvent } from './types'
import type { ShipmentRecord, TrackingEventRecord } from '../types/models'
import { getDeliveryOption } from './pricing'

export type { Shipment, ShipmentStatus, TrackingEvent }

/** The six statuses that form the normal delivery flow. */
export const STATUS_ORDER: ShipmentStatus[] = [
  'created',
  'picked_up',
  'in_transit',
  'at_facility',
  'out_for_delivery',
  'delivered',
]

export const STATUS_META: Record<ShipmentStatus, { label: string }> = {
  created: { label: 'Shipment Created' },
  picked_up: { label: 'Package Picked Up' },
  in_transit: { label: 'In Transit' },
  at_facility: { label: 'Arrived at Facility' },
  out_for_delivery: { label: 'Out for Delivery' },
  delivered: { label: 'Delivered' },
  delayed: { label: 'Delayed' },
  cancelled: { label: 'Cancelled' },
}

export const PACKAGE_TYPE_LABELS: Record<string, string> = {
  box: 'Box',
  document: 'Envelope / Document',
  parcel: 'Parcel',
  pallet: 'Pallet / Freight',
  fragile: 'Fragile Box',
}

const HOURS_AGO = [54, 48, 30, 12, 3, 1]

interface EventSpec {
  status: ShipmentStatus
  note: string
  location: (o: string, d: string) => string
  icon: TrackingEvent['icon']
}

export const EVENT_SPECS: EventSpec[] = [
  {
    status: 'created',
    note: 'Shipping label created. Shipment information received.',
    location: (o) => `${o} — Origin`,
    icon: 'file',
  },
  {
    status: 'picked_up',
    note: 'Picked up by FedEx courier and scanned into the network.',
    location: (o) => `${o} — Origin`,
    icon: 'package',
  },
  {
    status: 'in_transit',
    note: 'Departed origin facility. In transit to destination.',
    location: (o) => `${o} Hub`,
    icon: 'truck',
  },
  {
    status: 'at_facility',
    note: 'Arrived at destination FedEx facility. Sorted and staged.',
    location: (_o, d) => `${d} — Destination Facility`,
    icon: 'warehouse',
  },
  {
    status: 'out_for_delivery',
    note: 'On vehicle for final delivery.',
    location: (_o, d) => `${d} — Local Station`,
    icon: 'navigation',
  },
  {
    status: 'delivered',
    note: 'Delivered. Signature captured at the door.',
    location: (_o, d) => `${d} — Final Mile`,
    icon: 'home',
  },
]

const NOTE_BY_STATUS: Record<ShipmentStatus, string> = {
  created: EVENT_SPECS[0].note,
  picked_up: EVENT_SPECS[1].note,
  in_transit: EVENT_SPECS[2].note,
  at_facility: EVENT_SPECS[3].note,
  out_for_delivery: EVENT_SPECS[4].note,
  delivered: EVENT_SPECS[5].note,
  delayed: 'Shipment is delayed. Updated ETA applies.',
  cancelled: 'Shipment cancelled.',
}

const ICON_BY_STATUS: Record<ShipmentStatus, TrackingEvent['icon']> = {
  created: 'file',
  picked_up: 'package',
  in_transit: 'truck',
  at_facility: 'warehouse',
  out_for_delivery: 'navigation',
  delivered: 'home',
  delayed: 'alert',
  cancelled: 'close',
}

const STATUS_DEPTH: Record<string, number> = {
  created: 0,
  picked_up: 1,
  in_transit: 2,
  at_facility: 3,
  out_for_delivery: 4,
  delivered: 5,
}

const STATUS_PROGRESS: Record<ShipmentStatus, number> = {
  created: 8,
  picked_up: 25,
  in_transit: 50,
  at_facility: 68,
  out_for_delivery: 88,
  delivered: 100,
  delayed: 55,
  cancelled: 0,
}

/**
 * Build the six standard system events for a shipment (used when seeding demo
 * shipments). `anchor` is the creation time.
 */
export function buildStandardEvents(
  originCity: string,
  destCity: string,
  depth: number,
  anchor: Date = new Date(),
): { status: ShipmentStatus; note: string; location: string; timestamp: string }[] {
  const now = anchor.getTime()
  return EVENT_SPECS.map((spec, i) => ({
    status: spec.status,
    note: spec.note,
    location: spec.location(originCity, destCity),
    timestamp: new Date(now - HOURS_AGO[i] * 3600_000).toISOString(),
  })).slice(0, depth + 1)
}

/** Convert stored records into the public tracking view model. */
export function toTimelineEvents(
  record: ShipmentRecord,
  events: TrackingEventRecord[],
): TrackingEvent[] {
  const sorted = [...events].sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  const terminal = record.status === 'delivered' || record.status === 'cancelled'

  const real: TrackingEvent[] = sorted.map((e, i) => {
    const isLast = i === sorted.length - 1
    const state: EventState = isLast && !terminal ? 'current' : 'done'
    return {
      title: STATUS_META[e.status].label,
      description: e.note || NOTE_BY_STATUS[e.status],
      location: e.location,
      time: new Date(e.timestamp),
      state,
      icon: ICON_BY_STATUS[e.status],
    }
  })

  if (real.length === 0) {
    real.push({
      title: STATUS_META.created.label,
      description: NOTE_BY_STATUS.created,
      location: `${record.sender.city} — Origin`,
      time: new Date(record.createdAt),
      state: record.status === 'created' ? 'current' : 'done',
      icon: 'file',
    })
  }

  const pending: TrackingEvent[] = []
  if (record.status !== 'cancelled' && record.status !== 'delivered') {
    let depth: number
    if (record.status === 'delayed') {
      depth = 0
      for (const e of sorted) {
        const d = STATUS_DEPTH[e.status]
        if (d !== undefined) depth = Math.max(depth, d)
      }
    } else {
      depth = STATUS_DEPTH[record.status] ?? 0
    }
    const now = Date.now()
    STATUS_ORDER.slice(depth + 1).forEach((status, i) => {
      pending.push({
        title: STATUS_META[status].label,
        description: NOTE_BY_STATUS[status],
        location: record.recipient.city,
        time: new Date(now + (4 + i * 10) * 3600_000),
        state: 'pending',
        icon: ICON_BY_STATUS[status],
      })
    })
  }

  return [...real, ...pending]
}

export function toShipmentView(record: ShipmentRecord, events: TrackingEventRecord[]): Shipment {
  return {
    trackingNumber: record.trackingNumber,
    status: record.status,
    statusLabel: STATUS_META[record.status].label,
    progress: STATUS_PROGRESS[record.status] ?? 0,
    origin: { city: record.sender.city, country: record.sender.country },
    destination: { city: record.recipient.city, country: record.recipient.country },
    currentLocation: record.currentLocation,
    estimatedDelivery: new Date(record.estimatedDelivery).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }),
    shippingMethod: record.shippingMethod,
    packageType: PACKAGE_TYPE_LABELS[record.pkg.type] ?? 'Package',
    weight: record.pkg.weight ? `${record.pkg.weight} lbs` : undefined,
    lastUpdated: new Date(record.updatedAt),
    events: toTimelineEvents(record, events),
  }
}

export function getDemoSamples(): { number: string; label: string; route: string }[] {
  return [
    { number: '794658912345', label: 'Out for delivery', route: 'Dallas → Austin' },
    { number: '794677104296', label: 'Delivered', route: 'Singapore → San Francisco' },
    { number: '794633827194', label: 'In transit', route: 'Los Angeles → New York' },
    { number: '794651204838', label: 'Arrived at facility', route: 'London → Atlanta' },
    { number: '794621380054', label: 'Shipment created', route: 'Memphis → Chicago' },
  ]
}

export function normalizeTrackingNumber(raw: string): string {
  return raw.replace(/[\s-]/g, '').trim()
}

export function shippingMethodName(optionId: string): string {
  return getDeliveryOption(optionId)?.name ?? 'Standard'
}
