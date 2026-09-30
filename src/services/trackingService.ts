import type { Shipment } from '../lib/types'
import { normalizeTrackingNumber, toShipmentView } from '../lib/tracking'
import { getEventsForShipment, getShipmentByTrackingNumber } from './shipmentsService'

export async function lookupTracking(raw: string): Promise<Shipment | null> {
  const n = normalizeTrackingNumber(raw)
  if (!n) return null
  const record = await getShipmentByTrackingNumber(n)
  if (!record) return null
  const events = await getEventsForShipment(record.id)
  return toShipmentView(record, events)
}
