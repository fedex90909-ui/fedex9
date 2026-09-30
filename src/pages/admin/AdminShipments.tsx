import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Filter, Loader2, Search } from 'lucide-react'
import { ShipmentStatusBadge, PaymentStatusBadge } from '../../components/StatusBadge'
import { listAllShipments } from '../../services/shipmentsService'
import { currency, formatDate } from '../../lib/format'
import { STATUS_META } from '../../lib/tracking'
import type { ShipmentRecord } from '../../types/models'

const STATUS_OPTIONS = [
  'created', 'picked_up', 'in_transit', 'at_facility',
  'out_for_delivery', 'delivered', 'delayed', 'cancelled',
] as const

export default function AdminShipments() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')
  const [dateFrom, setDateFrom] = useState('')

  useEffect(() => {
    let active = true
    listAllShipments().then((s) => {
      if (active) { setShipments(s); setLoading(false) }
    })
    return () => { active = false }
  }, [])

  const methods = useMemo(
    () => Array.from(new Set(shipments.map((s) => s.shippingMethod))).sort(),
    [shipments],
  )

  const filtered = shipments.filter((s) => {
    const q = query.trim().toLowerCase()
    if (q) {
      const haystack = [
        s.trackingNumber, s.reference, s.sender.fullName, s.sender.email,
        s.recipient.fullName, s.recipient.email, s.sender.city, s.recipient.city,
        s.sender.country, s.recipient.country,
      ].join(' ').toLowerCase()
      if (!haystack.includes(q)) return false
    }
    if (status && s.status !== status) return false
    if (method && s.shippingMethod !== method) return false
    if (dateFrom && s.createdAt.slice(0, 10) < dateFrom) return false
    return true
  })

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Admin · Shipments</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Shipment management
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          {shipments.length} total · click a shipment to process it.
        </p>
      </header>

      <div className="card grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tracking #, customer, city…"
            aria-label="Search shipments"
            className="input pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status" className="input">
          <option value="">All statuses</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{STATUS_META[s].label}</option>
          ))}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by shipping method" className="input">
          <option value="">All shipping methods</option>
          {methods.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} aria-label="Created from" className="input" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-fx-purple-600" aria-hidden />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3 font-extrabold">Tracking #</th>
                <th className="px-5 py-3 font-extrabold">Customer</th>
                <th className="px-5 py-3 font-extrabold">Route</th>
                <th className="px-5 py-3 font-extrabold">Method</th>
                <th className="px-5 py-3 font-extrabold">Price</th>
                <th className="px-5 py-3 font-extrabold">Status</th>
                <th className="px-5 py-3 font-extrabold">Payment</th>
                <th className="px-5 py-3 font-extrabold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s: ShipmentRecord) => (
                <tr key={s.id} className="group transition hover:bg-fx-purple-50/40">
                  <td className="px-5 py-4">
                    <Link to={`/admin/shipments/${s.id}`} className="font-mono text-[13px] font-bold text-fx-purple-700 group-hover:underline">
                      {s.trackingNumber}
                    </Link>
                    <p className="mt-0.5 font-mono text-[10px] text-gray-400">{s.reference}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-ink">{s.sender.fullName}</p>
                    <p className="text-xs text-gray-400">{s.sender.email}</p>
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink">
                    {s.sender.city} → {s.recipient.city}
                  </td>
                  <td className="px-5 py-4 text-gray-600">{s.shippingMethod}</td>
                  <td className="px-5 py-4 font-bold text-ink">{currency(s.price)}</td>
                  <td className="px-5 py-4"><ShipmentStatusBadge status={s.status} /></td>
                  <td className="px-5 py-4"><PaymentStatusBadge status={s.paymentStatus} /></td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-5 py-12 text-center text-sm text-gray-400">
                    <Filter size={20} className="mx-auto mb-2 text-gray-300" aria-hidden />
                    No shipments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
