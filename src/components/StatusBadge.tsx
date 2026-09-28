import type { PaymentStatus, ShipmentPaymentStatus } from '../types/models'
import { STATUS_META } from '../lib/tracking'
import type { ShipmentStatus } from '../lib/types'

const SHIPMENT_STYLES: Record<ShipmentStatus, string> = {
  created: 'bg-gray-100 text-gray-700 ring-gray-200',
  picked_up: 'bg-fx-purple-50 text-fx-purple-700 ring-fx-purple-200/70',
  in_transit: 'bg-fx-purple-100 text-fx-purple-800 ring-fx-purple-300/60',
  at_facility: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  out_for_delivery: 'bg-fx-orange-50 text-fx-orange-700 ring-fx-orange-300/60',
  delivered: 'bg-green-50 text-green-700 ring-green-200/70',
  delayed: 'bg-red-50 text-red-700 ring-red-200/70',
  cancelled: 'bg-gray-100 text-gray-500 ring-gray-200',
}

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200/70',
  processing: 'bg-fx-purple-50 text-fx-purple-700 ring-fx-purple-200/70',
  paid: 'bg-green-50 text-green-700 ring-green-200/70',
  failed: 'bg-red-50 text-red-700 ring-red-200/70',
  refunded: 'bg-gray-100 text-gray-600 ring-gray-200',
}

const PAYMENT_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  processing: 'Processing',
  paid: 'Paid',
  failed: 'Failed',
  refunded: 'Refunded',
}

const SHIPMENT_PAYMENT_LABELS: Record<ShipmentPaymentStatus, string> = {
  unpaid: 'Unpaid',
  ...PAYMENT_LABELS,
}

export function ShipmentStatusBadge({ status }: { status: ShipmentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${SHIPMENT_STYLES[status]}`}
    >
      {STATUS_META[status].label}
    </span>
  )
}

export function PaymentStatusBadge({ status }: { status: ShipmentPaymentStatus }) {
  const style = status === 'unpaid' ? SHIPMENT_STYLES.created : PAYMENT_STYLES[status]
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${style}`}
    >
      {SHIPMENT_PAYMENT_LABELS[status]}
    </span>
  )
}

export function PaymentOnlyBadge({ status }: { status: PaymentStatus }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${PAYMENT_STYLES[status]}`}
    >
      {PAYMENT_LABELS[status]}
    </span>
  )
}
