import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Clock3, Loader2, PackageCheck, Wallet, ArrowUpRight } from 'lucide-react'
import { ShipmentStatusBadge, PaymentStatusBadge } from '../../components/StatusBadge'
import { useAuth } from '../../hooks/useAuth'
import { listMyPayments } from '../../services/paymentsService'
import { listMyShipments } from '../../services/shipmentsService'
import { currency, formatDate } from '../../lib/format'
import type { PaymentRecord, ShipmentRecord } from '../../types/models'

export default function AccountDashboard() {
  const { user } = useAuth()
  const [shipments, setShipments] = useState<ShipmentRecord[]>([])
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    Promise.all([listMyShipments(), listMyPayments()]).then(([s, p]) => {
      if (active) { setShipments(s); setPayments(p); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={28} className="animate-spin text-fx-purple-600" aria-hidden />
      </div>
    )
  }

  const active = shipments.filter((s) => !['delivered', 'cancelled'].includes(s.status))
  const delivered = shipments.filter((s) => s.status === 'delivered')
  const pendingPayments = payments.filter((p) => p.status === 'pending' || p.status === 'processing')
  const totalSpent = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + p.amount, 0)

  return (
    <div className="space-y-8">
      <header>
        <p className="kicker">Account</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Welcome back, {user?.name.split(' ')[0]}
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Here's what's moving with your account today.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard icon={Clock3} label="Active shipments" value={active.length} tone="purple" />
        <StatCard icon={PackageCheck} label="Delivered" value={delivered.length} tone="green" />
        <StatCard icon={Wallet} label="Pending payments" value={pendingPayments.length} tone="orange" />
        <StatCard icon={ArrowUpRight} label="Total shipped value" value={currency(totalSpent)} tone="purple" />
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-extrabold text-ink">Recent shipments</h2>
          <Link to="/account/shipments" className="text-xs font-extrabold text-fx-purple-700 hover:text-fx-orange-600">
            View all →
          </Link>
        </div>
        {shipments.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="divide-y divide-gray-100">
            {shipments.slice(0, 5).map((s) => (
              <li key={s.id}>
                <Link to={`/track/${s.trackingNumber}`} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4 transition hover:bg-gray-50/80">
                  <span className="font-mono text-sm font-bold text-ink">{s.trackingNumber}</span>
                  <span className="text-sm text-gray-500">{s.sender.city} → {s.recipient.city}</span>
                  <span className="ml-auto flex flex-wrap items-center gap-2">
                    <ShipmentStatusBadge status={s.status} />
                    <PaymentStatusBadge status={s.paymentStatus} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card overflow-hidden">
        <div className="border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-extrabold text-ink">Recent orders</h2>
        </div>
        {payments.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-gray-400">No payments yet.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {payments.slice(0, 5).map((p) => (
              <li key={p.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-6 py-4">
                <span className="font-mono text-xs font-bold text-gray-500">{p.reference}</span>
                <span className="text-sm font-bold text-ink">{currency(p.amount)}</span>
                <span className="text-xs font-semibold capitalize text-gray-500">
                  {p.method === 'card' ? 'Card payment' : 'Bank transfer'}
                </span>
                <span className="ml-auto flex items-center gap-3">
                  <PaymentStatusBadge status={p.status} />
                  <span className="text-xs text-gray-400">{formatDate(p.createdAt)}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-extrabold text-ink">Account information</h2>
            <dl className="mt-3 grid gap-x-8 gap-y-1.5 text-sm sm:grid-cols-2">
              <InfoRow label="Name" value={user?.name ?? '—'} />
              <InfoRow label="Email" value={user?.email ?? '—'} />
              <InfoRow label="Phone" value={user?.phone ?? '—'} />
              <InfoRow label="Member since" value={user ? formatDate(user.createdAt) : '—'} />
            </dl>
          </div>
          <Link to="/account/profile" className="btn-outline hidden shrink-0 sm:inline-flex">
            Edit profile <ArrowRight size={14} aria-hidden />
          </Link>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, tone }: { icon: typeof Clock3; label: string; value: number | string; tone: 'purple' | 'orange' | 'green' }) {
  const tones = {
    purple: 'bg-fx-purple-50 text-fx-purple-600',
    orange: 'bg-fx-orange-50 text-fx-orange-600',
    green: 'bg-green-50 text-green-600',
  }
  return (
    <div className="card p-5">
      <span className={`grid h-10 w-10 place-items-center rounded-xl ${tones[tone]}`}>
        <Icon size={19} aria-hidden />
      </span>
      <p className="mt-3 text-2xl font-black tracking-tight text-ink">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-gray-500">{label}</p>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2">
      <dt className="font-semibold text-gray-400">{label}:</dt>
      <dd className="truncate font-bold text-ink">{value}</dd>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="px-6 py-10 text-center">
      <p className="text-sm text-gray-500">No shipments yet — your first booking will appear here.</p>
      <Link to="/ship" className="btn-primary mt-4">
        Ship a package <ArrowRight size={15} aria-hidden />
      </Link>
    </div>
  )
}
