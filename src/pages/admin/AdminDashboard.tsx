import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Boxes,
  Clock3,
  CreditCard,
  Users,
} from 'lucide-react'
import { BarChartMini, DonutMini } from '../../components/charts/MiniCharts'
import { ShipmentStatusBadge, PaymentStatusBadge } from '../../components/StatusBadge'
import { listAllShipments } from '../../services/shipmentsService'
import { listAllPayments } from '../../services/paymentsService'
import { countUsers } from '../../services/usersService'
import { currency, formatDate } from '../../lib/format'

const STATUS_COLORS: Record<string, string> = {
  created: '#9CA3AF',
  picked_up: '#8F5FD0',
  in_transit: '#4D148C',
  at_facility: '#F59E0B',
  out_for_delivery: '#FF6600',
  delivered: '#16A34A',
  delayed: '#DC2626',
  cancelled: '#6B7280',
}

const PAYMENT_COLORS: Record<string, string> = {
  pending: '#F59E0B',
  processing: '#8F5FD0',
  paid: '#16A34A',
  failed: '#DC2626',
  refunded: '#6B7280',
}

export default function AdminDashboard() {
  const shipments = useMemo(() => listAllShipments(), [])
  const payments = useMemo(() => listAllPayments(), [])
  const userCount = useMemo(() => countUsers(), [])

  const byStatus = (status: string) => shipments.filter((s) => s.status === status).length
  const pendingPayments = payments.filter((p) => p.status === 'pending').length
  const completedPayments = payments.filter((p) => p.status === 'paid').length

  const shipmentChartData = [
    { label: 'Created', value: byStatus('created'), color: STATUS_COLORS.created },
    { label: 'In transit', value: byStatus('in_transit') + byStatus('picked_up') + byStatus('at_facility'), color: STATUS_COLORS.in_transit },
    { label: 'Out for delivery', value: byStatus('out_for_delivery'), color: STATUS_COLORS.out_for_delivery },
    { label: 'Delivered', value: byStatus('delivered'), color: STATUS_COLORS.delivered },
    { label: 'Delayed', value: byStatus('delayed'), color: STATUS_COLORS.delayed },
    { label: 'Cancelled', value: byStatus('cancelled'), color: STATUS_COLORS.cancelled },
  ]

  const paymentChartData = ['pending', 'processing', 'paid', 'failed', 'refunded'].map((s) => ({
    label: s.charAt(0).toUpperCase() + s.slice(1),
    value: payments.filter((p) => p.status === s).length,
    color: PAYMENT_COLORS[s],
  }))

  const revenue = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-8">
      <header>
        <p className="kicker">Admin</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Operations dashboard
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Live view of every shipment, payment and account in the network.
        </p>
      </header>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Stat icon={Boxes} tone="purple" label="Total shipments" value={shipments.length} />
        <Stat icon={Users} tone="purple" label="Registered users" value={userCount} />
        <Stat icon={Clock3} tone="orange" label="Pending payments" value={pendingPayments} />
        <Stat icon={CreditCard} tone="green" label="Completed payments" value={completedPayments} />
      </div>

      {/* Shipment status cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <MiniStat label="Pending pickups" value={byStatus('created') + byStatus('picked_up')} dot="#9CA3AF" />
        <MiniStat
          label="In transit"
          value={byStatus('in_transit') + byStatus('at_facility')}
          dot="#4D148C"
        />
        <MiniStat label="Out for delivery" value={byStatus('out_for_delivery')} dot="#FF6600" />
        <MiniStat label="Delivered" value={byStatus('delivered')} dot="#16A34A" />
      </div>

      {/* Charts */}
      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="text-base font-extrabold text-ink">Shipments by status</h2>
          <div className="mt-5">
            <BarChartMini data={shipmentChartData} />
          </div>
        </div>
        <div className="card p-6">
          <h2 className="text-base font-extrabold text-ink">Payments overview</h2>
          <div className="mt-5">
            <DonutMini
              data={paymentChartData}
              centerLabel="collected"
              centerValue={currency(revenue)}
            />
          </div>
        </div>
      </div>

      {/* Recent shipments */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-extrabold text-ink">Latest shipments</h2>
          <Link
            to="/admin/shipments"
            className="text-xs font-extrabold text-fx-purple-700 hover:text-fx-orange-600"
          >
            Manage all →
          </Link>
        </div>
        <ul className="divide-y divide-gray-100">
          {shipments.slice(0, 6).map((s) => (
            <li key={s.id}>
              <Link
                to={`/admin/shipments/${s.id}`}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition hover:bg-gray-50/80"
              >
                <span className="font-mono text-sm font-bold text-ink">{s.trackingNumber}</span>
                <span className="text-sm text-gray-500">
                  {s.sender.fullName} · {s.sender.city} → {s.recipient.city}
                </span>
                <span className="ml-auto flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-ink">{currency(s.price)}</span>
                  <ShipmentStatusBadge status={s.status} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const TONES = {
  purple: 'bg-fx-purple-50 text-fx-purple-600',
  orange: 'bg-fx-orange-50 text-fx-orange-600',
  green: 'bg-green-50 text-green-600',
} as const

function Stat({
  icon: Icon,
  tone,
  label,
  value,
}: {
  icon: typeof Users
  tone: keyof typeof TONES
  label: string
  value: number
}) {
  return (
    <div className="card p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${TONES[tone]}`}>
        <Icon size={19} aria-hidden />
      </span>
      <p className="mt-3 text-3xl font-black tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-gray-500">{label}</p>
    </div>
  )
}

function MiniStat({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: dot }} aria-hidden />
      <p className="text-xl font-black text-ink">{value}</p>
      <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{label}</p>
    </div>
  )
}
