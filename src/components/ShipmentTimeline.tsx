import { AlertTriangle, Ban, FileText, Home, Navigation, Package, Truck, Warehouse } from 'lucide-react'
import type { TrackingEvent } from '../lib/types'
import { formatDateTime } from '../lib/format'

const ICONS = {
  file: FileText,
  package: Package,
  truck: Truck,
  warehouse: Warehouse,
  navigation: Navigation,
  home: Home,
  alert: AlertTriangle,
  close: Ban,
} as const

export default function ShipmentTimeline({ events }: { events: TrackingEvent[] }) {
  // Most recent first, but keep chronological build order internally.
  const ordered = [...events]

  return (
    <ol className="relative space-y-0" aria-label="Shipment timeline">
      {ordered.map((event, i) => {
        const Icon = ICONS[event.icon]
        const isLast = i === ordered.length - 1
        const nextPending = !isLast && ordered[i + 1]?.state === 'pending'
        return (
          <li key={`${event.title}-${i}`} className="relative flex gap-4 pb-8 last:pb-0">
            {/* Connector */}
            {!isLast && (
              <span
                aria-hidden
                className={`absolute left-[19px] top-10 h-[calc(100%-40px)] w-0.5 rounded ${
                  event.state === 'pending' || nextPending
                    ? 'bg-gray-200'
                    : 'bg-gradient-to-b from-fx-purple-600 to-fx-purple-300'
                }`}
              />
            )}

            {/* Icon node */}
            <span className="relative shrink-0">
              {event.state === 'done' && (
                <span className="grid h-10 w-10 place-items-center rounded-full bg-fx-purple-600 text-white shadow-btn-purple">
                  <Icon size={17} aria-hidden />
                </span>
              )}
              {event.state === 'current' && (
                <>
                  <span
                    aria-hidden
                    className={`absolute inset-0 rounded-full ${
                      event.icon === 'alert' ? 'bg-red-500/40' : 'bg-fx-orange-500/40'
                    }`}
                    style={{ animation: 'pulse-ring 1.8s ease-out infinite' }}
                  />
                  <span
                    className={`relative grid h-10 w-10 place-items-center rounded-full text-white ring-4 ${
                      event.icon === 'alert'
                        ? 'bg-red-500 shadow-red-500/30 ring-red-100'
                        : event.icon === 'close'
                          ? 'bg-gray-500 shadow-gray-500/30 ring-gray-100'
                          : 'bg-fx-orange-500 shadow-btn-orange ring-fx-orange-100'
                    }`}
                  >
                    <Icon size={17} aria-hidden />
                  </span>
                </>
              )}
              {event.state === 'pending' && (
                <span className="grid h-10 w-10 place-items-center rounded-full border-2 border-dashed border-gray-300 bg-gray-50 text-gray-300">
                  <Icon size={17} aria-hidden />
                </span>
              )}
            </span>

            {/* Copy */}
            <div className={`min-w-0 pt-1 ${event.state === 'pending' ? 'opacity-50' : ''}`}>
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <p
                  className={`text-sm font-extrabold ${
                    event.state === 'pending' ? 'text-gray-500' : 'text-ink'
                  }`}
                >
                  {event.title}
                  {event.state === 'pending' && (
                    <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      Pending
                    </span>
                  )}
                  {event.state === 'current' && (
                    <span className="ml-2 rounded-full bg-fx-orange-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-fx-orange-700">
                      Current status
                    </span>
                  )}
                </p>
                <p className="text-xs font-semibold text-gray-400">
                  {event.state === 'pending'
                    ? `Expected ${formatDateTime(event.time)}`
                    : formatDateTime(event.time)}
                </p>
              </div>
              <p className="mt-1 text-sm text-gray-600">{event.description}</p>
              <p className="mt-0.5 text-xs font-semibold text-fx-purple-700">
                {event.location}
              </p>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
