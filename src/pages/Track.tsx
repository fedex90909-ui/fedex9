import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowRight, Loader2, PackageSearch, SearchX } from 'lucide-react'
import TrackForm from '../components/TrackForm'
import TrackingResult from '../components/TrackingResult'
import Reveal from '../components/Reveal'
import { getDemoSamples, normalizeTrackingNumber } from '../lib/tracking'
import { lookupTracking } from '../services/trackingService'
import type { Shipment } from '../lib/types'

type Phase = 'idle' | 'loading' | 'found' | 'notfound'

export default function Track() {
  const { number } = useParams()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [phase, setPhase] = useState<Phase>('idle')
  const [result, setResult] = useState<Shipment | null>(null)
  const [searchedNumber, setSearchedNumber] = useState('')

  useEffect(() => {
    if (!number) {
      setPhase('idle')
      setResult(null)
      return
    }
    const n = normalizeTrackingNumber(number)
    setPhase('loading')
    setSearchedNumber(n)
    let active = true
    const t = window.setTimeout(async () => {
      const s = await lookupTracking(n)
      if (!active) return
      if (s) {
        setResult(s)
        setPhase('found')
      } else {
        setResult(null)
        setPhase('notfound')
      }
    }, 850)
    return () => { active = false; window.clearTimeout(t) }
  }, [number])

  useEffect(() => {
    const q = searchParams.get('n')
    if (q) navigate(`/track/${normalizeTrackingNumber(q)}`, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="container-x max-w-6xl py-10 sm:py-14">
      <Reveal>
        <div className="mx-auto max-w-2xl text-center">
          <p className="kicker">Tracking</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
            Track Your Shipment
          </h1>
          <p className="mt-3 text-gray-600">
            Enter any tracking number to see live status, location and the full timeline.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100} className="mx-auto mt-8 max-w-2xl">
        <TrackForm initialNumber={number ?? ''} size="lg" />
      </Reveal>

      <div className="mt-10">
        {phase === 'idle' && <IdleState />}
        {phase === 'loading' && <LoadingState number={searchedNumber} />}
        {phase === 'notfound' && <NotFoundState number={searchedNumber} />}
        {phase === 'found' && result && (
          <div className="animate-fade-up">
            <TrackingResult shipment={result} />
          </div>
        )}
      </div>
    </div>
  )
}

function DemoChips() {
  return (
    <div className="mt-7">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
        Try a sample tracking number
      </p>
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        {getDemoSamples().map((s) => (
          <Link
            key={s.number}
            to={`/track/${s.number}`}
            className="group inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-ink shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-fx-purple-400 hover:shadow-card"
          >
            <span className="font-mono">{s.number}</span>
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide ${
                s.label === 'Delivered'
                  ? 'bg-green-100 text-green-700'
                  : s.label === 'Out for delivery'
                    ? 'bg-fx-orange-100 text-fx-orange-700'
                    : 'bg-fx-purple-100 text-fx-purple-700'
              }`}
            >
              {s.label}
            </span>
            <ArrowRight size={12} className="text-gray-300 transition group-hover:text-fx-purple-600" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  )
}

function IdleState() {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <div className="card mx-auto max-w-md p-10">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-fx-purple-50 text-fx-purple-600">
          <PackageSearch size={30} aria-hidden />
        </span>
        <h2 className="mt-5 text-lg font-extrabold text-ink">No shipment loaded yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-500">
          Enter a tracking number above — or pick one of the sample shipments below to see
          the dashboard in action.
        </p>
      </div>
      <DemoChips />
    </div>
  )
}

function LoadingState({ number }: { number: string }) {
  return (
    <div className="mx-auto max-w-3xl" aria-live="polite" aria-busy="true">
      <div className="card p-7">
        <div className="flex items-center gap-4">
          <Loader2 size={26} className="animate-spin text-fx-purple-600" aria-hidden />
          <div>
            <p className="text-base font-extrabold text-ink">
              Locating shipment <span className="font-mono">{number}</span>…
            </p>
            <p className="text-sm text-gray-500">Querying network scans across hubs.</p>
          </div>
        </div>
        <div className="mt-7 space-y-3">
          {[100, 84, 92, 70].map((w, i) => (
            <div
              key={i}
              className="h-12 rounded-xl bg-gradient-to-r from-gray-100 via-gray-50 to-gray-100 bg-[length:200%_100%] animate-shimmer"
              style={{ width: `${w}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function NotFoundState({ number }: { number: string }) {
  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl border border-red-200 bg-red-50/70 p-8 text-center">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-red-100 text-red-500">
          <SearchX size={30} aria-hidden />
        </span>
        <h2 className="mt-5 text-lg font-extrabold text-ink">
          We couldn&apos;t find <span className="font-mono">{number}</span>
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-gray-600">
          Double-check the number for typos — tracking numbers are 10–14 digits and don&apos;t
          include letters. Newly created shipments can take a few minutes to appear.
        </p>
      </div>
      <DemoChips />
    </div>
  )
}
