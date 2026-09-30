import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Loader2 } from 'lucide-react'
import { ShipmentStatusBadge, PaymentStatusBadge } from '../../components/StatusBadge'
import { listMyShipments } from '../../services/shipmentsService'
import { currency, formatDate } from '../../lib/format'
import type { ShipmentRecord } from '../../types/models'

export default function MyShipments() {
  const [shipments, setShipments] = useState<ShipmentRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    listMyShipments().then((s) => {
      if (active) { setShipments(s); setLoading(false) }
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

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="kicker">My Shipments</p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
            All your shipments
          </h1>
          <p className="mt-1.5 text-sm text-gray-600">
            Click any shipment to open its full tracking timeline.
          </p>
        </div>
        <Link to="/ship" className="btn-primary">
          New shipment <ArrowRight size={15} aria-hidden />
        </Link>
      </header>

      {shipments.length === 0 ? (
        <div className="card px-6 py-14 text-center">
          <p className="text-lg font-extrabold text-ink">Nothing shipped yet</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
            When you book a shipment it will appear here with live status, payment state and
            its tracking number.
          </p>
          <Link to="/ship" className="btn-primary mt-6">
            Ship your first package <ArrowRight size={15} aria-hidden />
          </Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-400">
                <th className="px-5 py-3 font-extrabold">Tracking #</th>
                <th className="px-5 py-3 font-extrabold">Route</th>
                <th className="px-5 py-3 font-extrabold">Method</th>
                <th className="px-5 py-3 font-extrabold">Price</th>
                <th className="px-5 py-3 font-extrabold">Status</th>
                <th className="px-5 py-3 font-extrabold">Payment</th>
                <th className="px-5 py-3 font-extrabold">Est. delivery</th>
                <th className="px-5 py-3 font-extrabold">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {shipments.map((s) => (
                <tr key={s.id} className="group transition hover:bg-fx-purple-50/40">
                  <td className="px-5 py-4">
                    <Link to={`/track/${s.trackingNumber}`} className="font-mono text-[13px] font-bold text-fx-purple-700 group-hover:underline">
                      {s.trackingNumber}
                    </Link>
                  </td>
                  <td className="px-5 py-4 font-semibold text-ink">{s.sender.city} → {s.recipient.city}</td>
                  <td className="px-5 py-4 text-gray-600">{s.shippingMethod}</td>
                  <td className="px-5 py-4 font-bold text-ink">{currency(s.price)}</td>
                  <td className="px-5 py-4"><ShipmentStatusBadge status={s.status} /></td>
                  <td className="px-5 py-4"><PaymentStatusBadge status={s.paymentStatus} /></td>
                  <td className="px-5 py-4 text-gray-600">{formatDate(s.estimatedDelivery)}</td>
                  <td className="px-5 py-4 text-gray-500">{formatDate(s.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
