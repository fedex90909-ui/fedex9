import type { ShipmentRecord, TrackingEventRecord } from '../types/models'
import type { BookingDraft } from '../lib/types'
import { estimateDeliveryFor, getDeliveryOption, priceFor } from '../lib/pricing'
import { EVENT_SPECS, shippingMethodName } from '../lib/tracking'
import { supabase } from '../lib/supabaseClient'
import { uid, newReference, newTrackingNumber } from './db'
import { AuthError, requireAdmin, requireUser } from './authService'

interface DbShipment {
  id: string
  user_id: string | null
  reference: string
  tracking_number: string
  sender: Record<string, unknown>
  recipient: Record<string, unknown>
  pkg: Record<string, unknown>
  option_id: string
  shipping_method: string
  price: number
  status: string
  current_location: string
  estimated_delivery: string
  payment_status: string
  is_demo: boolean
  created_at: string
  updated_at: string
}

interface DbTrackingEvent {
  id: string
  shipment_id: string
  status: string
  location: string
  note: string
  timestamp: string
  source: string
}

function dbToShipment(r: DbShipment): ShipmentRecord {
  return {
    id: r.id,
    userId: r.user_id,
    reference: r.reference,
    trackingNumber: r.tracking_number,
    sender: r.sender as unknown as ShipmentRecord['sender'],
    recipient: r.recipient as unknown as ShipmentRecord['recipient'],
    pkg: r.pkg as unknown as ShipmentRecord['pkg'],
    optionId: r.option_id,
    shippingMethod: r.shipping_method,
    price: Number(r.price),
    status: r.status as ShipmentRecord['status'],
    currentLocation: r.current_location,
    estimatedDelivery: r.estimated_delivery,
    paymentStatus: r.payment_status as ShipmentRecord['paymentStatus'],
    isDemo: r.is_demo,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function dbToEvent(r: DbTrackingEvent): TrackingEventRecord {
  return {
    id: r.id,
    shipmentId: r.shipment_id,
    status: r.status as TrackingEventRecord['status'],
    location: r.location,
    note: r.note,
    timestamp: r.timestamp,
    source: r.source as TrackingEventRecord['source'],
  }
}

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

  const { error } = await supabase.from('shipments').insert({
    id: record.id,
    user_id: record.userId,
    reference: record.reference,
    tracking_number: record.trackingNumber,
    sender: record.sender,
    recipient: record.recipient,
    pkg: record.pkg,
    option_id: record.optionId,
    shipping_method: record.shippingMethod,
    price: record.price,
    status: record.status,
    current_location: record.currentLocation,
    estimated_delivery: record.estimatedDelivery,
    payment_status: record.paymentStatus,
    is_demo: false,
    created_at: record.createdAt,
    updated_at: record.updatedAt,
  })
  if (error) throw new Error('Could not create shipment')

  await supabase.from('tracking_events').insert({
    id: uid('evt'),
    shipment_id: id,
    status: 'created',
    location: `${draft.sender.city} — Origin`,
    note: EVENT_SPECS[0].note,
    timestamp: now.toISOString(),
    source: 'system',
  })

  return record
}

export async function getShipmentById(id: string): Promise<ShipmentRecord | null> {
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return dbToShipment(data as DbShipment)
}

export async function getShipmentByTrackingNumber(trackingNumber: string): Promise<ShipmentRecord | null> {
  const n = trackingNumber.replace(/[\s-]/g, '').trim()
  if (!n) return null
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('tracking_number', n)
    .maybeSingle()
  if (error || !data) return null
  return dbToShipment(data as DbShipment)
}

export async function listMyShipments(): Promise<ShipmentRecord[]> {
  const user = requireUser()
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data as DbShipment[]).map(dbToShipment)
}

export async function listAllShipments(): Promise<ShipmentRecord[]> {
  requireAdmin()
  const { data, error } = await supabase
    .from('shipments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data as DbShipment[]).map(dbToShipment)
}

export async function getEventsForShipment(shipmentId: string): Promise<TrackingEventRecord[]> {
  const { data, error } = await supabase
    .from('tracking_events')
    .select('*')
    .eq('shipment_id', shipmentId)
    .order('timestamp', { ascending: true })
  if (error || !data) return []
  return (data as DbTrackingEvent[]).map(dbToEvent)
}

export async function assertOwnership(shipmentId: string): Promise<ShipmentRecord> {
  const user = requireUser()
  const shipment = await getShipmentById(shipmentId)
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

export async function updateShipmentStatus(shipmentId: string, update: StatusUpdate): Promise<ShipmentRecord> {
  requireAdmin()
  const shipment = await getShipmentById(shipmentId)
  if (!shipment) throw new Error('Shipment not found')
  const now = new Date().toISOString()
  const timestamp = update.timestamp ?? now
  const location = update.location?.trim() || shipment.currentLocation

  await supabase.from('tracking_events').insert({
    id: uid('evt'),
    shipment_id: shipmentId,
    status: update.status,
    location,
    note: update.note?.trim() || '',
    timestamp,
    source: 'admin',
  })

  const { error } = await supabase
    .from('shipments')
    .update({ status: update.status, current_location: location, updated_at: now })
    .eq('id', shipmentId)
  if (error) throw new Error('Could not update shipment')

  return { ...shipment, status: update.status, currentLocation: location, updatedAt: now }
}

export async function cancelShipment(shipmentId: string, note?: string): Promise<ShipmentRecord> {
  return updateShipmentStatus(shipmentId, {
    status: 'cancelled',
    note: note || 'Shipment cancelled by FedEx administration.',
  })
}

export async function markDelivered(shipmentId: string, location?: string): Promise<ShipmentRecord> {
  return updateShipmentStatus(shipmentId, {
    status: 'delivered',
    location,
    note: 'Delivered. Signature captured at the door.',
  })
}

export async function setPaymentStatusOnShipment(shipmentId: string, status: ShipmentRecord['paymentStatus']): Promise<void> {
  const now = new Date().toISOString()
  await supabase
    .from('shipments')
    .update({ payment_status: status, updated_at: now })
    .eq('id', shipmentId)
}
