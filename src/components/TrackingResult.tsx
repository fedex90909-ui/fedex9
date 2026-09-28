import {
  AlertTriangle,
  Ban,
  Copy,
  FileText,
  Home,
  Mail,
  Navigation,
  Package,
  Truck,
  Warehouse,
} from 'lucide-react'
import type { Shipment, ShipmentStatus } from '../lib/types'
import { formatDateTime } from '../lib/format'
import { useCopy } from '../context/ToastContext'
import RouteMap from './RouteMap'
import ShipmentTimeline from './ShipmentTimeline'

const STATUS_THEME: Record<
  ShipmentStatus,
  { Icon: typeof Truck; banner: string; chip: string }
> = {
  created: {
    Icon: FileText,
    banner: 'from-gray-50 to-white border-gray-200',
    chip: 'bg-gray-100 text-gray-700',
  },
  picked_up: {
    Icon: Package,
    banner: 'from-fx-purple-50 to-white border-fx-purple-200/60',
    chip: 'bg-fx-purple-100 text-fx-purple-800',
  },
  in_transit: {
    Icon: Truck,
    banner: 'from-fx-purple-50 to-white border-fx-purple-200/60',
    chip: 'bg-fx-purple-100 text-fx-purple-800',
  },
  at_facility: {
    Icon: Warehouse,
    banner: 'from-fx-orange-50 to-white border-fx-orange-200/60',
    chip: 'bg-fx-orange-100 text-fx-orange-800',
  },
  out_for_delivery: {
    Icon: Navigation,
    banner: 'from-fx-orange-50 to-white border-fx-orange-300/60',
    chip: 'bg-fx-orange-500 text-white',
  },
  delivered: {
    Icon: Home,
    banner: 'from-green-50 to-white border-green-200',
    chip: 'bg-green-600 text-white',
  },
  delayed: {
    Icon: AlertTriangle,
    banner: 'from-red-50 to-white border-red-200',
    chip: 'bg-red-500 text-white',
  },
  cancelled: {
    Icon: Ban,
    banner: 'from-gray-100 to-white border-gray-300',
    chip: 'bg-gray-500 text-white',
  },
}

function OverviewCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-gray-50/80 px-4 py-3.5 ring-1 ring-inset ring-gray-100">
      <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
        {label}
      </p>
      <p className="mt-1 truncate text-sm font-bold text-ink" title={value}>
        {value}
      </p>
    </div>
  )
}

export default function TrackingResult({ shipment }: { shipment: Shipment }) {
  const copy = useCopy()
  const theme = STATUS_THEME[shipment.status]
  const StatusIcon = theme.Icon

  return (
    <section aria-label={`Tracking details for ${shipment.trackingNumber}`} className="space-y-6">
      {/* Status banner */}
      <div className={`rounded-2xl border bg-gradient-to-r p-6 shadow-card sm:p-7 ${theme.banner}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <span
              className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${theme.chip}`}
              aria-hidden
            >
              <StatusIcon size={26} />
            </span>
            <div>
              <p
                className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-[0.14em] ${theme.chip}`}
              >
                {shipment.statusLabel}
              </p>
              <p className="mt-1.5 text-2xl font-black tracking-tight text-ink">
                {shipment.origin.city} → {shipment.destination.city}
              </p>
              <p className="mt-0.5 text-xs font-semibold text-gray-400">
                Last updated {formatDateTime(shipment.lastUpdated)}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400">
              Tracking number
            </p>
            <button
              onClick={() => copy(shipment.trackingNumber, 'Tracking number copied')}
              className="group mt-1 inline-flex items-center gap-2 rounded-lg bg-white/80 px-3 py-1.5 font-mono text-sm font-bold text-ink ring-1 ring-gray-200 transition hover:ring-fx-purple-400"
              title="Copy tracking number"
            >
              {shipment.trackingNumber}
              <Copy
                size={14}
                className="text-gray-400 transition group-hover:text-fx-purple-600"
                aria-hidden
              />
            </button>
          </div>
        </div>

        <div className="mt-5">
          <div className="h-2 overflow-hidden rounded-full bg-gray-200/80" role="presentation">
            <div
              className={`progress-fill h-full rounded-full ${
                shipment.status === 'delivered'
                  ? 'bg-green-500'
                  : 'bg-gradient-to-r from-fx-purple-600 to-fx-orange-500'
              }`}
              style={{ width: `${shipment.progress}%` }}
            />
          </div>
          <div className="mt-1.5 flex justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
            <span>Picked up</span>
            <span>In transit</span>
            <span>Out for delivery</span>
            <span>Delivered</span>
          </div>
        </div>
      </div>

      {/* Overview grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <OverviewCell label="Origin" value={shipment.origin.city} />
        <OverviewCell label="Destination" value={shipment.destination.city} />
        <OverviewCell label="Current location" value={shipment.currentLocation} />
        <OverviewCell label="Estimated delivery" value={shipment.estimatedDelivery} />
        <OverviewCell label="Shipping method" value={shipment.shippingMethod} />
        <OverviewCell label="Package type" value={shipment.packageType} />
        <OverviewCell label="Weight" value={shipment.weight ?? '—'} />
        <OverviewCell label="Status" value={shipment.statusLabel} />
      </div>

      {/* Route visual */}
      <RouteMap
        origin={shipment.origin}
        destination={shipment.destination}
        progress={shipment.progress}
      />

      {/* Timeline + aside */}
      <div className="grid gap-6 lg:grid-cols-5">
        <div className="card p-6 sm:p-7 lg:col-span-3">
          <h3 className="text-lg font-extrabold tracking-tight text-ink">
            Shipment timeline
          </h3>
          <p className="mb-6 mt-1 text-sm text-gray-500">
            Every scan from label creation to signature.
          </p>
          <ShipmentTimeline events={shipment.events} />
        </div>

        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-2xl bg-fx-purple-800 p-6 text-white shadow-lift sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-fx-orange-400">
              Estimated delivery
            </p>
            <p className="mt-2 text-2xl font-black tracking-tight">
              {shipment.estimatedDelivery}
            </p>
            <p className="mt-1 text-sm text-purple-200/80">
              Via {shipment.shippingMethod}
              {shipment.weight ? ` · ${shipment.weight}` : ''}
            </p>
            <div className="mt-5 rounded-xl bg-white/10 p-4 text-sm leading-relaxed text-purple-100 ring-1 ring-inset ring-white/15">
              Delivery updates are refreshed at every network scan. Signature may be
              required at the door.
            </div>
          </div>

          <div className="card p-6 sm:p-7">
            <h4 className="text-sm font-extrabold text-ink">Need help with this shipment?</h4>
            <p className="mt-1.5 text-sm text-gray-500">
              Support agents can reroute, hold or reschedule while it&apos;s in transit —
              email <span className="font-bold text-ink">FedEx90909@gmail.com</span>.
            </p>
            <a href="mailto:FedEx90909@gmail.com" className="btn-outline mt-4 w-full">
              <Mail size={15} aria-hidden /> Email support
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
