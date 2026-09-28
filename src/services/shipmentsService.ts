import type { ShipmentRecord, TrackingEventRecord } from '../types/models'
import type { BookingDraft } from '../lib/types'
import { estimateDeliveryFor, getDeliveryOption, priceFor } from '../lib/pricing'
import { EVENT_SPECS, shippingMethodName } from '../lib/tracking'
import { KEYS, newReference, newTrackingNumber, readCollection, uid, writeCollection } from './db'
import { AuthError, requireAdmin, requireUser } from './authService'

function readShipments(): ShipmentRecord[] {
  return readCollection<ShipmentRecord>(KEYS.shipments)
}

function writeShipments(s: ShipmentRecord[]): void {
  writeCollection(KEYS.shipments, s)
}

function readEvents(): TrackingEventRecord[] {
  return readCollection<TrackingEventRecord>(KEYS.events)
}

function appendEvent(event: TrackingEventRecord): void {
  writeCollection(KEYS.events, [...readEvents(), event])
}

/** Creates the shipment against the signed-in user's account. */
export async function createShipment(draft: BookingDraft): Promise<ShipmentRecord> {
  const user = requireUser()
  const option = getDeliveryOption(draft.optionId ?? '')
  if (!option) throw new Error('No delivery option selected')

  const now = new Date()
  const id = uid('shp')
  const record: ShipmentRecord = {
    id,
    userId: user.id,
    reference: newReference(),
    trackingNumber: newTrackingNumber(),
    sender: draft.sender,
    recipient: draft.recipient,
    pkg: draft.pkg,
    optionId: option.id,
    shippingMethod: shippingMethodName(option.id),
    price: priceFor(option, draft.pkg),
    status: 'created',
    currentLocation: `${draft.sender.city} — Origin`,
    estimatedDelivery: estimateDeliveryFor(option.id).toISOString(),
    paymentStatus: 'unpaid',
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  }
  writeShipments([record, ...readShipments()])
  appendEvent({
    id: uid('evt'),
    shipmentId: id,
    status: 'created',
    location: `${draft.sender.city} — Origin`,
    note: EVENT_SPECS[0].note,
    timestamp: now.toISOString(),
    source: 'system',
  })
  return record
}

export function getShipmentById(id: string): ShipmentRecord | null {
  return readShipments().find((s) => s.id === id) ?? null
}

export function getShipmentByTrackingNumber(trackingNumber: string): ShipmentRecord | null {
  const n = trackingNumber.replace(/[\s-]/g, '').trim()
  if (!n) return null
  return readShipments().find((s) => s.trackingNumber === n) ?? null
}

/** Customers only ever see their own shipments (enforced here, not just in UI). */
export function listMyShipments(): ShipmentRecord[] {
  const user = requireUser()
  return readShipments()
    .filter((s) => s.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

/** Admin-only: every shipment in the system. */
export function listAllShipments(): ShipmentRecord[] {
  requireAdmin()
  return readShipments().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getEventsForShipment(shipmentId: string): TrackingEventRecord[] {
  return readEvents()
    .filter((e) => e.shipmentId === shipmentId)
    .sort((a, b) => a.timestamp.localeCompare(b.timestamp))
}

export function assertOwnership(shipmentId: string): ShipmentRecord {
  const user = requireUser()
  const shipment = getShipmentById(shipmentId)
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.userId !== user.id && user.role !== 'admin') {
    throw new AuthError('You can only access your own shipments')
  }
  return shipment
}

/* ------------------------------ admin ops ------------------------------ */

export interface StatusUpdate {
  status: ShipmentRecord['status']
  location?: string
  note?: string
  timestamp?: string
}

export function updateShipmentStatus(shipmentId: string, update: StatusUpdate): ShipmentRecord {
  requireAdmin()
  const shipments = readShipments()
  const shipment = shipments.find((s) => s.id === shipmentId)
  if (!shipment) throw new Error('Shipment not found')
  const now = new Date().toISOString()
  const timestamp = update.timestamp ?? now
  appendEvent({
    id: uid('evt'),
    shipmentId,
    status: update.status,
    location: update.location?.trim() || shipment.currentLocation,
    note: update.note?.trim() || '',
    timestamp,
    source: 'admin',
  })
  const updated: ShipmentRecord = {
    ...shipment,
    status: update.status,
    currentLocation: update.location?.trim() || shipment.currentLocation,
    updatedAt: now,
  }
  writeShipments(shipments.map((s) => (s.id === shipmentId ? updated : s)))
  return updated
}

export function cancelShipment(shipmentId: string, note?: string): ShipmentRecord {
  return updateShipmentStatus(shipmentId, {
    status: 'cancelled',
    note: note || 'Shipment cancelled by FedEx administration.',
  })
}

export function markDelivered(shipmentId: string, location?: string): ShipmentRecord {
  return updateShipmentStatus(shipmentId, {
    status: 'delivered',
    location,
    note: 'Delivered. Signature captured at the door.',
  })
}

export function setPaymentStatusOnShipment(shipmentId: string, status: ShipmentRecord['paymentStatus']): void {
  const shipments = readShipments()
  const shipment = shipments.find((s) => s.id === shipmentId)
  if (!shipment) return
  writeShipments(
    shipments.map((s) =>
      s.id === shipmentId ? { ...s, paymentStatus: status, updatedAt: new Date().toISOString() } : s,
    ),
  )
}
