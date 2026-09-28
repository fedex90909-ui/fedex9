import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, Search } from 'lucide-react'
import { useToast } from '../../context/ToastContext'
import { lookupTracking } from '../../services/trackingService'
import { getShipmentByTrackingNumber } from '../../services/shipmentsService'
import TrackingResult from '../../components/TrackingResult'
import { normalizeTrackingNumber } from '../../lib/tracking'

export default function AdminTracking() {
  const [value, setValue] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const toast = useToast()
  const [result, setResult] = useState<ReturnType<typeof lookupTracking>>(null)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = normalizeTrackingNumber(value)
    if (!n) {
      setError('Enter a tracking number')
      setResult(null)
      return
    }
    const found = lookupTracking(n)
    if (!found) {
      setError(`No shipment found for ${n}`)
      setResult(null)
      return
    }
    setError('')
    setResult(found)
  }

  const recordId = useMemo(
    () => (result ? getShipmentByTrackingNumber(result.trackingNumber)?.id : undefined),
    [result],
  )

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Admin · Tracking</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Tracking console
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Look up any shipment exactly as a customer would see it, then jump into processing.
        </p>
      </header>

      <form onSubmit={submit} noValidate className="card flex flex-col gap-2.5 p-4 sm:flex-row">
        <div className="relative flex-1">
          <Search size={16} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError('')
            }}
            placeholder="Enter tracking number"
            aria-label="Tracking number"
            className="input py-3 pl-11"
            inputMode="numeric"
          />
        </div>
        <button type="submit" className="btn-primary">
          Look up
        </button>
      </form>

      {error && (
        <div role="alert" className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-4">
          {recordId && (
            <button
              onClick={() => navigate(`/admin/shipments/${recordId}`)}
              className="btn-purple"
            >
              Open in shipment manager <ArrowRight size={15} aria-hidden />
            </button>
          )}
          <TrackingResult shipment={result} />
        </div>
      )}
    </div>
  )
}
