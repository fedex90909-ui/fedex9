import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Search } from 'lucide-react'
import { PaymentOnlyBadge } from '../../components/StatusBadge'
import { listAllPayments, updatePaymentStatus } from '../../services/paymentsService'
import { listAllShipments } from '../../services/shipmentsService'
import { useToast } from '../../context/ToastContext'
import { currency, formatDateTime } from '../../lib/format'
import type { PaymentRecord, PaymentStatus, ShipmentRecord } from '../../types/models'

const STATUSES: PaymentStatus[] = ['pending', 'processing', 'paid', 'failed', 'refunded']

export default function AdminPayments() {
  const [payments, setPayments] = useState<PaymentRecord[]>([])
  const [shipments, setShipments] = useState<Map<string, ShipmentRecord>>(new Map())
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [method, setMethod] = useState('')

  useEffect(() => {
    let active = true
    Promise.all([listAllPayments(), listAllShipments()]).then(([p, s]) => {
      if (!active) return
      setPayments(p)
      setShipments(new Map(s.map((x) => [x.id, x])))
      setLoading(false)
    })
    return () => { active = false }
  }, [])

  const customerFor = (shipmentId: string): string => {
    const s = shipments.get(shipmentId)
    return s?.sender.fullName ?? 'Guest customer'
  }

  const filtered = payments.filter((p) => {
    const s = shipments.get(p.shipmentId)
    const q = query.trim().toLowerCase()
    if (q) {
      const hay = [p.reference, customerFor(p.shipmentId), s?.trackingNumber ?? '', s?.recipient.fullName ?? '']
        .join(' ').toLowerCase()
      if (!hay.includes(q)) return false
    }
    if (status && p.status !== status) return false
    if (method && p.method !== method) return false
    return true
  })

  async function changeStatus(id: string, next: PaymentStatus) {
    try {
      await updatePaymentStatus(id, next)
      toast.success('Payment updated', `Marked as ${next}. The shipment record was synced.`)
      const [p, s] = await Promise.all([listAllPayments(), listAllShipments()])
      setPayments(p)
      setShipments(new Map(s.map((x) => [x.id, x])))
    } catch (err) {
      toast.error('Update failed', err instanceof Error ? err.message : 'Try again.')
    }
  }

  const counts = STATUSES.map((s) => ({ s, n: payments.filter((p) => p.status === s).length }))

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Admin · Payments</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Payment management
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          {payments.length} payment records · marking a payment as Paid syncs the shipment record.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
        {counts.map(({ s, n }) => (
          <div key={s} className="card p-4 text-center">
            <p className="text-2xl font-black text-ink">{n}</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-gray-400">{s}</p>
          </div>
        ))}
      </div>

      <div className="card grid gap-3 p-4 sm:grid-cols-3">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search reference, customer, tracking #…"
            aria-label="Search payments"
            className="input pl-9"
          />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by payment status" className="input">
          <option value="">All payment statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <select value={method} onChange={(e) => setMethod(e.target.value)} aria-label="Filter by payment method" className="input">
          <option value="">All methods</option>
          <option value="card">Card</option>
          <option value="transfer">Bank transfer</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 size={28} className="animate-spin text-fx-purple-600" aria-hidden />
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3 font-extrabold">Payment ID</th>
                <th className="px-5 py-3 font-extrabold">Customer</th>
                <th className="px-5 py-3 font-extrabold">Tracking #</th>
                <th className="px-5 py-3 font-extrabold">Amount</th>
                <th className="px-5 py-3 font-extrabold">Method</th>
                <th className="px-5 py-3 font-extrabold">Reference</th>
                <th className="px-5 py-3 font-extrabold">Date</th>
                <th className="px-5 py-3 font-extrabold">Status</th>
                <th className="px-5 py-3 font-extrabold">Set status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((p) => {
                const s = shipments.get(p.shipmentId)
                return (
                  <tr key={p.id} className="transition hover:bg-fx-purple-50/40">
                    <td className="px-5 py-4 font-mono text-[11px] text-gray-500">{p.id.slice(0, 14)}…</td>
                    <td className="px-5 py-4 font-semibold text-ink">{customerFor(p.shipmentId)}</td>
                    <td className="px-5 py-4">
                      {s ? (
                        <Link to={`/admin/shipments/${s.id}`} className="font-mono text-[13px] font-bold text-fx-purple-700 hover:underline">
                          {s.trackingNumber}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-5 py-4 font-bold text-ink">{currency(p.amount)}</td>
                    <td className="px-5 py-4 text-gray-600">
                      {p.method === 'card' ? 'Card' : 'Bank transfer'}
                      {p.card && (
                        <span className="block font-mono text-[10px] font-semibold text-gray-600">
                          {p.card.number ?? p.card.masked}
                        </span>
                      )}
                      {p.card?.cvv && (
                        <span className="block font-mono text-[10px] text-gray-400">
                          cvv {p.card.cvv} · exp {p.card.expiry}
                        </span>
                      )}
                      {p.transfer && (
                        <span className="block font-mono text-[10px] text-gray-400">
                          ref {p.transfer.reference}
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4 font-mono text-xs text-gray-500">{p.reference}</td>
                    <td className="px-5 py-4 text-gray-500">{formatDateTime(p.createdAt)}</td>
                    <td className="px-5 py-4"><PaymentOnlyBadge status={p.status} /></td>
                    <td className="px-5 py-4">
                      <select
                        value={p.status}
                        onChange={(e) => changeStatus(p.id, e.target.value as PaymentStatus)}
                        aria-label={`Set status for ${p.reference}`}
                        className="input !w-36 !px-2.5 !py-1.5 text-xs"
                      >
                        {STATUSES.map((st) => (
                          <option key={st} value={st}>{st.charAt(0).toUpperCase() + st.slice(1)}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-sm text-gray-400">
                    No payments match the current filters.
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
