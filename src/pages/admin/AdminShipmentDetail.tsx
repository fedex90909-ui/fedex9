import { useCallback, useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Ban,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MapPin,
  Package as PackageIcon,
  Phone,
  Truck,
} from 'lucide-react'
import { ShipmentStatusBadge, PaymentOnlyBadge } from '../../components/StatusBadge'
import ShipmentTimeline from '../../components/ShipmentTimeline'
import Modal from '../../components/Modal'
import { useToast } from '../../context/ToastContext'
import {
  cancelShipment,
  getEventsForShipment,
  getShipmentById,
  markDelivered,
  updateShipmentStatus,
} from '../../services/shipmentsService'
import { getPaymentForShipment, updatePaymentStatus } from '../../services/paymentsService'
import { getUserById } from '../../services/usersService'
import { toShipmentView } from '../../lib/tracking'
import { currency, formatDate, formatDateTime } from '../../lib/format'
import { STATUS_META } from '../../lib/tracking'
import type { PaymentRecord, PaymentStatus, PublicUser, ShipmentRecord, TrackingEventRecord } from '../../types/models'
import type { ShipmentStatus } from '../../lib/types'

const ALL_STATUSES: ShipmentStatus[] = [
  'created', 'picked_up', 'in_transit', 'at_facility',
  'out_for_delivery', 'delivered', 'delayed', 'cancelled',
]

const PAYMENT_STATUSES: PaymentStatus[] = ['pending', 'processing', 'paid', 'failed', 'refunded']

function nowLocalInput(): string {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 16)
}

export default function AdminShipmentDetail() {
  const { id } = useParams()
  const toast = useToast()
  const navigate = useNavigate()
  const [confirmCancel, setConfirmCancel] = useState(false)
  const [busy, setBusy] = useState(false)

  const [shipment, setShipment] = useState<ShipmentRecord | null>(null)
  const [events, setEvents] = useState<TrackingEventRecord[]>([])
  const [payment, setPayment] = useState<PaymentRecord | null>(null)
  const [customer, setCustomer] = useState<PublicUser | null>(null)
  const [loading, setLoading] = useState(true)

  const [form, setForm] = useState({
    status: 'in_transit' as ShipmentStatus,
    location: '',
    note: '',
    timestamp: nowLocalInput(),
  })

  const load = useCallback(async () => {
    if (!id) return
    const [s, e, p] = await Promise.all([
      getShipmentById(id),
      getEventsForShipment(id),
      getPaymentForShipment(id),
    ])
    setShipment(s)
    setEvents(e)
    setPayment(p)
    if (s?.userId) {
      const c = await getUserById(s.userId)
      setCustomer(c)
    }
    setLoading(false)
  }, [id])

  useEffect(() => { load() }, [load])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-fx-purple-600" aria-hidden />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="py-16 text-center">
        <p className="text-lg font-extrabold text-ink">Shipment not found</p>
        <Link to="/admin/shipments" className="btn-primary mt-4">Back to shipments</Link>
      </div>
    )
  }

  const view = toShipmentView(shipment, events)

  async function applyStatus() {
    if (!shipment) return
    setBusy(true)
    try {
      await updateShipmentStatus(shipment.id, {
        status: form.status,
        location: form.location,
        note: form.note,
        timestamp: new Date(form.timestamp).toISOString(),
      })
      toast.success('Status updated', `${shipment.trackingNumber} → ${STATUS_META[form.status].label}. Tracking timeline refreshed.`)
      setForm((f) => ({ ...f, location: '', note: '', timestamp: nowLocalInput() }))
      await load()
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : 'Try again.')
    } finally {
      setBusy(false)
    }
  }

  async function onMarkDelivered() {
    if (!shipment) return
    setBusy(true)
    try {
      await markDelivered(shipment.id)
      toast.success('Marked as delivered', shipment.trackingNumber)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function onCancel() {
    if (!shipment) return
    setBusy(true)
    try {
      await cancelShipment(shipment.id)
      toast.success('Shipment cancelled', shipment.trackingNumber)
      setConfirmCancel(false)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function onConfirmPayment() {
    if (!payment) return
    setBusy(true)
    try {
      await updatePaymentStatus(payment.id, 'paid')
      toast.success('Payment confirmed', `${currency(payment.amount)} marked as paid.`)
      await load()
    } finally {
      setBusy(false)
    }
  }

  async function onPaymentStatusChange(status: PaymentStatus) {
    if (!payment) return
    try {
      await updatePaymentStatus(payment.id, status)
      toast.success('Payment updated', `Marked as ${status}.`)
      await load()
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : 'Try again.')
    }
  }

  return (
    <div className="space-y-6">
      <Link to="/admin/shipments" className="inline-flex items-center gap-1.5 text-sm font-bold text-gray-500 transition hover:text-fx-purple-700">
        <ArrowLeft size={15} aria-hidden /> All shipments
      </Link>

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="kicker">Process shipment</p>
          <h1 className="mt-2 font-mono text-2xl font-black tracking-tight text-ink sm:text-3xl">
            {shipment.trackingNumber}
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Ref {shipment.reference} · created {formatDateTime(shipment.createdAt)}
          </p>
        </div>
        <ShipmentStatusBadge status={shipment.status} />
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="space-y-6">
          <div className="card flex flex-wrap items-center gap-x-8 gap-y-3 p-5">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Origin</p>
              <p className="mt-0.5 font-extrabold text-ink">{shipment.sender.city}, {shipment.sender.country}</p>
            </div>
            <Truck className="text-fx-orange-500" size={20} aria-hidden />
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Destination</p>
              <p className="mt-0.5 font-extrabold text-ink">{shipment.recipient.city}, {shipment.recipient.country}</p>
            </div>
            <div className="ml-auto text-right">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Current location</p>
              <p className="mt-0.5 font-extrabold text-ink">{shipment.currentLocation}</p>
            </div>
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <AddressCard
              title="Sender"
              person={shipment.sender.fullName}
              email={shipment.sender.email}
              phone={shipment.sender.phone}
              lines={[
                shipment.sender.address,
                `${shipment.sender.city}, ${shipment.sender.state} ${shipment.sender.zip}`,
                shipment.sender.country,
              ]}
              accountName={customer?.name}
            />
            <AddressCard
              title="Recipient"
              person={shipment.recipient.fullName}
              email={shipment.recipient.email}
              phone={shipment.recipient.phone}
              lines={[
                shipment.recipient.address,
                `${shipment.recipient.city}, ${shipment.recipient.state} ${shipment.recipient.zip}`,
                shipment.recipient.country,
              ]}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-gray-400">
                <PackageIcon size={15} aria-hidden /> Package
              </h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Type" value={shipment.pkg.type || '—'} />
                <Row label="Weight" value={shipment.pkg.weight ? `${shipment.pkg.weight} lbs` : '—'} />
                <Row label="Dimensions" value={shipment.pkg.length ? `${shipment.pkg.length} × ${shipment.pkg.width} × ${shipment.pkg.height} in` : '—'} />
                <Row label="Description" value={shipment.pkg.description || '—'} />
              </dl>
            </div>
            <div className="card p-6">
              <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-gray-400">
                <Clock3 size={15} aria-hidden /> Delivery
              </h2>
              <dl className="mt-3 space-y-1.5 text-sm">
                <Row label="Method" value={shipment.shippingMethod} />
                <Row label="Price" value={currency(shipment.price)} />
                <Row label="Est. delivery" value={formatDate(shipment.estimatedDelivery)} />
                <Row label="Last update" value={formatDateTime(shipment.updatedAt)} />
              </dl>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-extrabold text-ink">Tracking timeline</h2>
            <p className="mb-5 mt-1 text-sm text-gray-500">
              {events.length} event{events.length === 1 ? '' : 's'} · shown to the customer on the public tracking page.
            </p>
            <ShipmentTimeline events={view.events} />
          </div>
        </div>

        <div className="space-y-5">
          <div className="card p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Payment</h2>
              {payment ? <PaymentOnlyBadge status={payment.status} /> : (
                <span className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-extrabold uppercase text-gray-500">No record</span>
              )}
            </div>
            {payment ? (
              <>
                <dl className="mt-3 space-y-1.5 text-sm">
                  <Row label="Reference" value={payment.reference} mono />
                  <Row label="Method" value={payment.method === 'card' ? 'Card payment' : 'Bank transfer'} />
                  <Row label="Amount" value={currency(payment.amount)} />
                  <Row label="Date" value={formatDateTime(payment.createdAt)} />
                  {payment.transfer && (
                    <>
                      <Row label="Transfer ref" value={payment.transfer.reference} />
                      <Row label="Sender name" value={payment.transfer.senderName} />
                      {payment.transfer.proofName && <Row label="Proof uploaded" value={payment.transfer.proofName} />}
                    </>
                  )}
                </dl>

                {payment.card && (
                  <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] font-extrabold uppercase tracking-wider text-amber-700">Card details</p>
                    </div>
                    <dl className="mt-2.5 space-y-1.5 text-sm">
                      <Row label="Cardholder" value={payment.card.cardholder} />
                      <Row label="Card number" value={payment.card.number ?? payment.card.masked} mono />
                      <Row label="CVV" value={payment.card.cvv ?? '—'} mono />
                      <Row label="Expiry" value={payment.card.expiry} mono />
                      <Row label="Billing address" value={payment.card.address ?? '—'} />
                    </dl>
                  </div>
                )}
                <label className="label mt-4">Set payment status</label>
                <select
                  value={payment.status}
                  onChange={(e) => onPaymentStatusChange(e.target.value as PaymentStatus)}
                  className="input"
                  aria-label="Set payment status"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                {payment.status !== 'paid' && (
                  <button onClick={onConfirmPayment} disabled={busy} className="btn-purple mt-3 w-full">
                    <CheckCircle2 size={16} aria-hidden /> Confirm payment as paid
                  </button>
                )}
              </>
            ) : (
              <p className="mt-3 text-sm text-gray-500">This shipment has no payment record yet.</p>
            )}
          </div>

          <div className="card p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Update shipment status</h2>
            <div className="mt-4 space-y-3.5">
              <div>
                <label htmlFor="status-select" className="label">New status<span className="ml-0.5 text-fx-orange-600">*</span></label>
                <select
                  id="status-select"
                  value={form.status}
                  onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as ShipmentStatus }))}
                  className="input"
                >
                  {ALL_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_META[s].label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="loc" className="label">Location</label>
                <input id="loc" className="input" placeholder="e.g. Lagos Distribution Facility"
                  value={form.location} onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="note" className="label">Status note</label>
                <textarea id="note" rows={2} className="input resize-none" placeholder="Optional note shown to the customer"
                  value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
              </div>
              <div>
                <label htmlFor="ts" className="label">Timestamp</label>
                <input id="ts" type="datetime-local" className="input"
                  value={form.timestamp} onChange={(e) => setForm((f) => ({ ...f, timestamp: e.target.value }))} />
              </div>
              <button onClick={applyStatus} disabled={busy} className="btn-primary w-full">Apply update</button>
            </div>
          </div>

          <div className="card space-y-2.5 p-6">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">Quick actions</h2>
            <button onClick={onMarkDelivered} disabled={busy || shipment.status === 'delivered'} className="btn-purple w-full">
              <MapPin size={16} aria-hidden /> Mark as delivered
            </button>
            <button onClick={() => setConfirmCancel(true)} disabled={busy || shipment.status === 'cancelled'}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100 disabled:opacity-50">
              <Ban size={16} aria-hidden /> Cancel shipment
            </button>
            <p className="pt-1 text-center text-xs text-gray-400">
              Every action is appended to the customer's tracking timeline immediately.
            </p>
          </div>
        </div>
      </div>

      <Modal open={confirmCancel} onClose={() => setConfirmCancel(false)} title="Cancel this shipment?">
        <p className="text-sm leading-relaxed text-gray-600">
          <span className="font-mono font-bold">{shipment.trackingNumber}</span> will be marked
          as cancelled and the customer will see it on their tracking page. This cannot be undone.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => setConfirmCancel(false)} className="btn-outline flex-1">Keep shipment</button>
          <button onClick={onCancel} disabled={busy}
            className="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700 disabled:opacity-60">
            Cancel shipment
          </button>
        </div>
      </Modal>
    </div>
  )
}

function AddressCard({
  title, person, email, phone, lines, accountName,
}: {
  title: string; person: string; email: string; phone: string; lines: string[]; accountName?: string
}) {
  return (
    <div className="card p-6">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-extrabold uppercase tracking-wider text-gray-400">
          <MapPin size={15} aria-hidden /> {title}
        </h2>
        {accountName && (
          <span className="rounded-full bg-fx-purple-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-fx-purple-700">
            Account: {accountName}
          </span>
        )}
      </div>
      <p className="mt-3 font-extrabold text-ink">{person}</p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
        <Mail size={13} className="text-gray-400" aria-hidden /> {email}
      </p>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-600">
        <Phone size={13} className="text-gray-400" aria-hidden /> {phone}
      </p>
      <p className="mt-2 text-sm leading-relaxed text-gray-500">
        {lines.filter(Boolean).map((l) => (
          <span key={l} className="block">{l}</span>
        ))}
      </p>
    </div>
  )
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="shrink-0 font-semibold text-gray-400">{label}</dt>
      <dd className={`truncate text-right font-bold text-ink ${mono ? 'font-mono text-xs' : ''}`}>{value}</dd>
    </div>
  )
}
