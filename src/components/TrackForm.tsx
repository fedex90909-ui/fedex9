import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { PackageSearch } from 'lucide-react'
import { normalizeTrackingNumber } from '../lib/tracking'

interface TrackFormProps {
  initialNumber?: string
  size?: 'md' | 'lg'
}

/** Reusable tracking input. Always routes to /track/:number. */
export default function TrackForm({ initialNumber = '', size = 'md' }: TrackFormProps) {
  const [value, setValue] = useState(initialNumber)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const big = size === 'lg'

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const n = normalizeTrackingNumber(value)
    if (!n) {
      setError('Enter a tracking number to continue')
      return
    }
    if (!/^\d{10,14}$/.test(n)) {
      setError('Tracking numbers are 10–14 digits, e.g. 794658912345')
      return
    }
    setError('')
    navigate(`/track/${n}`)
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <div className="relative flex-1">
          <PackageSearch
            size={big ? 20 : 18}
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <label htmlFor={big ? 'hero-track' : 'track-input'} className="sr-only">
            Tracking number
          </label>
          <input
            id={big ? 'hero-track' : 'track-input'}
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              if (error) setError('')
            }}
            inputMode="numeric"
            autoComplete="off"
            placeholder="Enter tracking number"
            className={`w-full rounded-full border bg-white text-ink placeholder:text-gray-400 transition focus:border-fx-purple-500 focus:outline-none focus:ring-4 focus:ring-fx-purple-500/10 ${
              big ? 'py-4 pl-12 pr-4 text-base' : 'py-3 pl-11 pr-4 text-sm'
            } ${error ? 'border-red-400' : 'border-gray-300'}`}
          />
        </div>
        <button
          type="submit"
          className={big ? 'btn-primary btn-lg shrink-0' : 'btn-primary shrink-0'}
        >
          Track Shipment
        </button>
      </div>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </form>
  )
}
