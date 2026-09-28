import type { Shipment } from '../lib/types'
import { normalizeTrackingNumber, toShipmentView } from '../lib/tracking'
import { getEventsForShipment, getShipmentByTrackingNumber } from './shipmentsService'

/**
 * Public tracking lookup against the shipment store. Swap the internals for a
 * REST/GPS tracking API later — callers only depend on `Shipment | null`.
 */
export function lookupTracking(raw: string): Shipment | null {
  const n = normalizeTrackingNumber(raw)
  if (!n) return null
  const record = getShipmentByTrackingNumber(n)
  if (!record) return null
  return toShipmentView(record, getEventsForShipment(record.id))
}
