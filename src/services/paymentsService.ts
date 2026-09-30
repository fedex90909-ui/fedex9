import type { CardMeta, PaymentMethodKind, PaymentRecord, PaymentStatus, TransferMeta } from '../types/models'
import { supabase } from '../lib/supabaseClient'
import { uid, newReference } from './db'
import { AuthError, requireAdmin, requireUser } from './authService'
import { getShipmentById, setPaymentStatusOnShipment } from './shipmentsService'

interface DbPayment {
  id: string
  shipment_id: string
  user_id: string | null
  method: string
  amount: number
  status: string
  reference: string
  card: Record<string, unknown> | null
  transfer: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

function dbToPayment(r: DbPayment): PaymentRecord {
  return {
    id: r.id,
    shipmentId: r.shipment_id,
    userId: r.user_id,
    method: r.method as PaymentMethodKind,
    amount: Number(r.amount),
    status: r.status as PaymentStatus,
    reference: r.reference,
    card: r.card ? (r.card as unknown as CardMeta) : undefined,
    transfer: r.transfer ? (r.transfer as unknown as TransferMeta) : undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

export interface CreatePaymentInput {
  shipmentId: string
  method: PaymentMethodKind
  card?: Omit<CardMeta, never>
  transfer?: TransferMeta
}

export async function createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
  const user = requireUser()
  const shipment = await getShipmentById(input.shipmentId)
  if (!shipment) throw new Error('Shipment not found')
  if (shipment.userId !== user.id) throw new AuthError('You can only pay for your own shipments')

  await new Promise((r) => setTimeout(r, 1400))

  const now = new Date().toISOString()
  const payment: PaymentRecord = {
    id: uid('pay'),
    shipmentId: shipment.id,
    userId: user.id,
    method: input.method,
    amount: shipment.price,
    status: 'pending',
    reference: newReference('PAY'),
    card: input.method === 'card' && input.card ? input.card : undefined,
    transfer: input.method === 'transfer' ? input.transfer : undefined,
    createdAt: now,
    updatedAt: now,
  }

  const { error } = await supabase.from('payments').insert({
    id: payment.id,
    shipment_id: payment.shipmentId,
    user_id: payment.userId,
    method: payment.method,
    amount: payment.amount,
    status: payment.status,
    reference: payment.reference,
    card: payment.card ?? null,
    transfer: payment.transfer ?? null,
    created_at: payment.createdAt,
    updated_at: payment.updatedAt,
  })
  if (error) throw new Error('Could not create payment record')

  await setPaymentStatusOnShipment(shipment.id, 'pending')
  return payment
}

export async function getPaymentById(id: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return dbToPayment(data as DbPayment)
}

export async function getPaymentForShipment(shipmentId: string): Promise<PaymentRecord | null> {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('shipment_id', shipmentId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  if (error || !data) return null
  return dbToPayment(data as DbPayment)
}

export async function listMyPayments(): Promise<PaymentRecord[]> {
  const user = requireUser()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) return []
  return (data as DbPayment[]).map(dbToPayment)
}

export async function listAllPayments(): Promise<PaymentRecord[]> {
  requireAdmin()
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) return []
  return (data as DbPayment[]).map(dbToPayment)
}

const SHIPMENT_PAYMENT_STATUS: Record<PaymentStatus, 'unpaid' | PaymentStatus> = {
  pending: 'pending',
  processing: 'processing',
  paid: 'paid',
  failed: 'failed',
  refunded: 'refunded',
}

export async function updatePaymentStatus(paymentId: string, status: PaymentStatus): Promise<PaymentRecord> {
  requireAdmin()
  const payment = await getPaymentById(paymentId)
  if (!payment) throw new Error('Payment not found')
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('payments')
    .update({ status, updated_at: now })
    .eq('id', paymentId)
  if (error) throw new Error('Could not update payment')
  await setPaymentStatusOnShipment(payment.shipmentId, SHIPMENT_PAYMENT_STATUS[status])
  return { ...payment, status, updatedAt: now }
}
