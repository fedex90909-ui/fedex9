import type { CardMeta, PaymentMethodKind, PaymentRecord, PaymentStatus, TransferMeta } from '../types/models'
import { KEYS, newReference, readCollection, uid, writeCollection } from './db'
import { AuthError, requireAdmin, requireUser } from './authService'
import { getShipmentById, setPaymentStatusOnShipment } from './shipmentsService'

function readPayments(): PaymentRecord[] {
  return readCollection<PaymentRecord>(KEYS.payments)
}

function writePayments(p: PaymentRecord[]): void {
  writeCollection(KEYS.payments, p)
}

export interface CreatePaymentInput {
  shipmentId: string
  method: PaymentMethodKind
  card?: Omit<CardMeta, never>
  transfer?: TransferMeta
}

/**
 * Creates a payment record with status `pending`. In this demo the card
 * details the customer entered (name, number, CVV, expiry, billing address)
 * are stored with the record so the admin can process the order — a real
 * payment gateway (Stripe, Adyen…) replaces this module's internals and only
 * masked metadata would ever be kept.
 */
export async function createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
  const user = requireUser()
  const shipment = getShipmentById(input.shipmentId)
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.userId !== user.id) throw new AuthError('You can only pay for your own shipments')

  await new Promise((r) => setTimeout(r, 1400)) // simulated provider round-trip

  const now = new Date().toISOString()
  const payment: PaymentRecord = {
    id: uid('pay'),
    shipmentId: shipment.id,
    userId: user.id,
    method: input.method,
    amount: shipment.price,
    status: 'pending',
    reference: newReference('PAY'),
    card:
      input.method === 'card' && input.card
        ? input.card
        : undefined,
    transfer: input.method === 'transfer' ? input.transfer : undefined,
    createdAt: now,
    updatedAt: now,
  }
  writePayments([payment, ...readPayments()])
  setPaymentStatusOnShipment(shipment.id, 'pending')
  return payment
}

export function getPaymentById(id: string): PaymentRecord | null {
  return readPayments().find((p) => p.id === id) ?? null
}

export function getPaymentForShipment(shipmentId: string): PaymentRecord | null {
  return (
    readPayments()
      .filter((p) => p.shipmentId === shipmentId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0] ?? null
  )
}

export function listMyPayments(): PaymentRecord[] {
  const user = requireUser()
  return readPayments()
    .filter((p) => p.userId === user.id)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function listAllPayments(): PaymentRecord[] {
  requireAdmin()
  return readPayments().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

const SHIPMENT_PAYMENT_STATUS: Record<PaymentStatus, 'unpaid' | PaymentStatus> = {
  pending: 'pending',
  processing: 'processing',
  paid: 'paid',
  failed: 'failed',
  refunded: 'refunded',
}

/** Admin: move a payment through pending → processing → paid/failed/refunded. */
export function updatePaymentStatus(paymentId: string, status: PaymentStatus): PaymentRecord {
  requireAdmin()
  const payments = readPayments()
  const payment = payments.find((p) => p.id === paymentId)
  if (!payment) throw new Error('Payment not found')
  const updated: PaymentRecord = { ...payment, status, updatedAt: new Date().toISOString() }
  writePayments(payments.map((p) => (p.id === paymentId ? updated : p)))
  setPaymentStatusOnShipment(payment.shipmentId, SHIPMENT_PAYMENT_STATUS[status])
  return updated
}
