import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  Copy,
  Home,
  Loader2,
  MapPin,
  Package as PackageIcon,
  Truck,
} from 'lucide-react'
import Reveal from '../components/Reveal'
import { PaymentStatusBadge } from '../components/StatusBadge'
import { useCopy } from '../context/ToastContext'
import { getShipmentById, getEventsForShipment } from '../services/shipmentsService'
import { getPaymentForShipment } from '../services/paymentsService'
import { estimateDeliveryFor } from '../lib/pricing'
import { currency, formatDate, formatTime } from '../lib/format'
import type { PaymentRecord, ShipmentRecord, TrackingEventRecord } from '../types/models'

export default function Confirmation() {
  const { id } = useParams()
  const copy = useCopy()

  const [shipment, setShipment] = useState<ShipmentRecord | null>(null)
  const [payment, setPayment] = useState<PaymentRecord | null>(null)
  const [events, setEvents] = useState<TrackingEventRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) { setLoading(false); return }
    let active = true
    Promise.all([getShipmentById(id), getPaymentForShipment(id), getEventsForShipment(id)]).then(
      ([s, p, e]) => {
        if (!active) return
        setShipment(s)
        setPayment(p)
        setEvents(e)
        setLoading(false)
      },
    )
    return () => { active = false }
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-fx-purple-600" aria-hidden />
      </div>
    )
  }

  if (!shipment) {
    return (
      <div className="container-x max-w-lg py-24 text-center">
        <h1 className="text-2xl font-black text-ink">Confirmation not found</h1>
        <p className="mt-3 text-gray-600">
          This confirmation link is no longer valid on this device.
        </p>
        <Link to="/ship" className="btn-primary mt-7">
          Ship a package <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    )
  }

  const estimate = estimateDeliveryFor(shipment.optionId)

  const rows: { icon: React.ReactNode; label: string; value: string }[] = [
    { icon: <Truck size={16} aria-hidden />, label: 'Delivery method', value: shipment.shippingMethod },
    {
      icon: <MapPin size={16} aria-hidden />,
      label: 'Destination',
      value: `${shipment.recipient.address}, ${shipment.recipient.city}${shipment.recipient.state ? `, ${shipment.recipient.state}` : ''}, ${shipment.recipient.country}`,
    },
    {
      icon: <PackageIcon size={16} aria-hidden />,
      label: 'Package',
      value: `${shipment.pkg.type.charAt(0).toUpperCase() + shipment.pkg.type.slice(1)}${shipment.pkg.weight ? ` · ${shipment.pkg.weight} lbs` : ''}${shipment.pkg.length ? ` · ${shipment.pkg.length}×${shipment.pkg.width}×${shipment.pkg.height} in` : ''}`,
    },
    { icon: <CalendarClock size={16} aria-hidden />, label: 'Estimated delivery', value: `${formatDate(estimate)}, ${formatTime(estimate)}` },
  ]

  const paymentPending = !payment || payment.status === 'pending' || payment.status === 'processing'

  return (
    <div className="container-x max-w-2xl py-12 sm:py-16">
      <Reveal>
        <div className="text-center">
          <span className="relative mx-auto grid h-20 w-20 place-items-center rounded-full bg-green-100">
            <span aria-hidden className="absolute inset-0 rounded-full bg-green-400/40" style={{ animation: 'pulse-ring 1.6s ease-out 2' }} />
            <svg viewBox="0 0 52 52" className="relative h-12 w-12" aria-hidden>
              <circle cx="26" cy="26" r="24" fill="none" stroke="#16A34A" strokeWidth="2.5" />
              <path d="M 15 27 L 23 34 L 37 19" fill="none" stroke="#16A34A" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="check-draw" />
            </svg>
          </span>
          <h1 className="mt-6 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Shipment confirmed!
          </h1>
          <p className="mx-auto mt-3 max-w-md text-gray-600">
            Your shipment is booked{payment?.status === 'paid' ? ' and paid' : ''}. A
            confirmation email is on its way to{' '}
            <span className="font-bold text-ink">{shipment.sender.email}</span>.
          </p>
          {paymentPending && (
            <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-2 rounded-xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
              </span>
              {payment?.method === 'transfer'
                ? 'Bank transfer pending review — an administrator will confirm it shortly.'
                : 'Payment pending — your payment record is being processed.'}
            </div>
          )}
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="card mt-9 overflow-hidden">
          <div className="grid gap-px bg-gray-100 sm:grid-cols-2">
            <div className="bg-white p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Shipment reference</p>
              <button onClick={() => copy(shipment.reference, 'Reference copied')} className="group mt-1.5 flex items-center gap-2 font-mono text-lg font-black text-fx-purple-700">
                {shipment.reference}
                <Copy size={15} className="text-gray-300 transition group-hover:text-fx-purple-600" aria-hidden />
              </button>
            </div>
            <div className="bg-white p-6">
              <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Tracking number</p>
              <button onClick={() => copy(shipment.trackingNumber, 'Tracking number copied')} className="group mt-1.5 flex items-center gap-2 font-mono text-lg font-black text-ink">
                {shipment.trackingNumber}
                <Copy size={15} className="text-gray-300 transition group-hover:text-fx-purple-600" aria-hidden />
              </button>
            </div>
          </div>

          <div className="border-t border-gray-100 p-6 sm:p-7">
            <dl className="space-y-4">
              {rows.map((r) => (
                <div key={r.label} className="flex items-start gap-3">
                  <span className="mt-0.5 text-fx-purple-500">{r.icon}</span>
                  <div>
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">{r.label}</dt>
                    <dd className="mt-0.5 text-sm font-bold text-ink">{r.value}</dd>
                  </div>
                </div>
              ))}
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-fx-orange-500"><Truck size={16} aria-hidden /></span>
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Pickup scheduled</dt>
                  <dd className="mt-0.5 text-sm font-bold text-ink">
                    {formatDate(new Date(shipment.createdAt))} — a courier will collect from {shipment.sender.city}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 rounded-2xl bg-fx-purple-800 p-5 text-white">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-200/80">
                    Amount · {payment ? (payment.method === 'card' ? 'Card' : 'Bank transfer') : '—'}
                  </p>
                  <p className="mt-1 text-2xl font-black">{currency(shipment.price)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <PaymentStatusBadge status={shipment.paymentStatus} />
                  {payment && <span className="font-mono text-xs text-purple-200/80">{payment.reference}</span>}
                </div>
              </div>
              {events.length > 0 && (
                <p className="mt-3 border-t border-white/10 pt-3 text-xs text-purple-200/70">
                  {events.length} tracking event{events.length === 1 ? '' : 's'} recorded — follow it live on the tracking page.
                </p>
              )}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link to={`/track/${shipment.trackingNumber}`} className="btn-primary btn-lg">
            Track this shipment <ArrowRight size={18} aria-hidden />
          </Link>
          <Link to="/account/shipments" className="btn-outline btn-lg">My Shipments</Link>
          <Link to="/" className="btn-outline btn-lg"><Home size={17} aria-hidden /> Return home</Link>
        </div>
      </Reveal>
    </div>
  )
}
