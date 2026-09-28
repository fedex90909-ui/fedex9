import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BadgeCheck,
  Radar,
  ShieldCheck,
  Users,
} from 'lucide-react'
import Reveal from '../components/Reveal'
import Stat from '../components/Stat'
import WarehouseIllustration from '../components/illustrations/WarehouseIllustration'
import GlobeIllustration from '../components/illustrations/GlobeIllustration'
import PlaneIllustration from '../components/illustrations/PlaneIllustration'

const VALUES = [
  {
    icon: ShieldCheck,
    title: 'Relentless reliability',
    text: 'A 99.2% on-time record, audited daily, with a money-back guarantee behind every time-definite service.',
  },
  {
    icon: Users,
    title: 'People-first logistics',
    text: '600,000 team members worldwide — couriers, pilots, engineers — trained to treat every package like their own.',
  },
  {
    icon: Radar,
    title: 'Innovation in motion',
    text: 'AI-routed linehauls, electric delivery fleets in 40+ metros and scan-level visibility for every parcel.',
  },
] as const

const RELIABILITY = [
  {
    title: '99.2% on-time',
    text: 'Measured across 15 million daily shipments, in every season and every lane.',
  },
  {
    title: '24/7 network ops',
    text: 'Three global control towers watch every flight, truck and package around the clock.',
  },
  {
    title: 'Money-back guarantee',
    text: 'Miss a committed delivery window and the shipping charge refunds automatically.',
  },
]

export default function About() {
  return (
    <>
      {/* Hero */}
      <section className="dot-bg border-b border-gray-100">
        <div className="container-x grid items-center gap-10 py-14 sm:py-16 lg:grid-cols-2">
          <Reveal>
            <p className="kicker">About us</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.08] tracking-tight text-ink sm:text-5xl">
              The world&apos;s deadline, kept —{' '}
              <span className="text-fx-purple-700">every single day.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              For over five decades we&apos;ve built the network the world runs on: an
              integrated air-and-road system moving medicine, machine parts, e-commerce
              and everything in between.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/ship" className="btn-primary">
                Ship with us <ArrowRight size={16} aria-hidden />
              </Link>
              <Link to="/contact" className="btn-outline">
                Talk to our team
              </Link>
            </div>
          </Reveal>
          <Reveal delay={150}>
            <PlaneIllustration />
          </Reveal>
        </div>
      </section>

      {/* Who we are */}
      <section className="section bg-white">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="kicker">Who we are</p>
            <h2 className="h-section">A logistics company, built like a technology company</h2>
            <p className="mt-5 leading-relaxed text-gray-600">
              What started as one founder&apos;s term paper — an overnight air network
              connected by a single hub — became the blueprint for modern express
              shipping. Today our sort facilities read like airports, our couriers carry
              handheld computers that ping the network every scan, and our promise is
              unchanged: absolutely, positively on time.
            </p>
            <p className="mt-4 leading-relaxed text-gray-600">
              We move 15 million packages a day across 220+ countries, so whether it&apos;s
              a birthday gift across town or a turbine blade across an ocean, it rides
              the same obsessively monitored network.
            </p>
          </Reveal>
          <Reveal delay={120}>
            <div className="rounded-3xl bg-gradient-to-b from-fx-purple-50/70 to-white p-6 ring-1 ring-fx-purple-100">
              <WarehouseIllustration />
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission band */}
      <section className="bg-fx-purple-900">
        <div className="container-x section relative">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-fx-orange-400">
              Our mission
            </p>
            <blockquote className="mt-5 text-2xl font-extrabold leading-snug tracking-tight text-white sm:text-3xl">
              “To connect people and possibilities — delivering what matters, wherever
              it matters, exactly when it matters.”
            </blockquote>
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-3">
            {VALUES.map((v, i) => (
              <Reveal key={v.title} delay={i * 100}>
                <div className="h-full rounded-2xl bg-white/5 p-6 ring-1 ring-inset ring-white/10 backdrop-blur transition hover:bg-white/10">
                  <v.icon size={24} className="text-fx-orange-400" aria-hidden />
                  <h3 className="mt-4 text-base font-extrabold text-white">{v.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-purple-200/75">{v.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-8 py-14 lg:grid-cols-4">
          {[
            { value: 52, suffix: '+', label: 'Years of express delivery' },
            { value: 220, suffix: '+', label: 'Countries & territories' },
            { value: 15, suffix: 'M', label: 'Packages moved daily' },
            { value: 600, suffix: 'K', label: 'Team members worldwide' },
          ].map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <Stat value={s.value} suffix={s.suffix} label={s.label} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* Network */}
      <section id="network" className="section scroll-mt-20">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <GlobeIllustration />
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="kicker">Our network</p>
              <h2 className="h-section">650 aircraft. 200,000 vehicles. One hub-and-spoke system.</h2>
              <p className="mt-5 leading-relaxed text-gray-600">
                Every night, hundreds of flights converge on our Memphis superhub, where
                packages are sorted at a rate of tens of thousands per hour, then fan back
                out to the corners of the map. It&apos;s the same principle since day one —
                centralize the sort, fly direct, deliver before sunrise.
              </p>
            </Reveal>
            <div className="mt-7 grid gap-3 sm:grid-cols-2">
              {[
                'Memphis global superhub',
                '4,300 ground facilities',
                '40+ electric delivery metros',
                '60,000+ retail pickup points',
              ].map((item, i) => (
                <Reveal key={item} delay={i * 80}>
                  <p className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-bold text-ink ring-1 ring-gray-200/80 shadow-card">
                    <BadgeCheck size={16} className="text-fx-orange-500" aria-hidden />
                    {item}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology */}
      <section id="technology" className="scroll-mt-20 bg-white">
        <div className="container-x section grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <p className="kicker">Technology</p>
            <h2 className="h-section">Visibility down to the scan</h2>
            <p className="mt-5 leading-relaxed text-gray-600">
              Our tracking platform ingests over a billion scan events a day. Machine
              learning predicts delays before they happen, reroutes linehauls around
              weather, and gives you — the shipper — the exact same live view our
              dispatchers see.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                'Real-time GPS + scan triangulation on every package',
                'Predictive ETAs that self-correct through the journey',
                'Proactive alerts by email and SMS when anything changes',
              ].map((item) => (
                <li key={item} className="flex items-start gap-2.5 text-sm font-semibold text-gray-700">
                  <BadgeCheck size={17} className="mt-0.5 shrink-0 text-fx-orange-500" aria-hidden />
                  {item}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={120}>
            {/* Mini tracking UI mock */}
            <div className="card overflow-hidden p-0">
              <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50/70 px-5 py-3.5">
                <p className="font-mono text-xs font-bold text-gray-500">7946 5891 2345</p>
                <span className="rounded-full bg-fx-orange-100 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-fx-orange-700">
                  Out for delivery
                </span>
              </div>
              <div className="p-5">
                <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                  <div className="progress-fill h-full w-[88%] rounded-full bg-gradient-to-r from-fx-purple-600 to-fx-orange-500" />
                </div>
                <div className="mt-5 space-y-4">
                  {[
                    { t: 'Out for delivery', s: 'Austin — Local Station · 8:12 AM', live: true },
                    { t: 'Arrived at Facility', s: 'Austin — Destination · 4:48 AM', live: false },
                    { t: 'In Transit', s: 'Memphis Hub · 6:30 PM', live: false },
                  ].map((row) => (
                    <div key={row.t} className="flex items-center gap-3">
                      <span
                        className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                          row.live ? 'bg-fx-orange-500 ring-4 ring-fx-orange-100' : 'bg-fx-purple-600'
                        }`}
                      />
                      <div className="min-w-0">
                        <p className="truncate text-sm font-extrabold text-ink">{row.t}</p>
                        <p className="text-xs text-gray-400">{row.s}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Reliability */}
      <section className="section">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="kicker">Reliability</p>
            <h2 className="h-section">Deadlines are our product</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {RELIABILITY.map((r, i) => (
              <Reveal key={r.title} delay={i * 100}>
                <div className="h-full rounded-2xl border border-gray-200/70 bg-white p-7 text-center shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <p className="text-2xl font-black tracking-tight text-fx-purple-700">{r.title}</p>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">{r.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-fx-orange-500 px-6 py-14 text-center shadow-lift sm:px-12">
            <div
              aria-hidden
              className="absolute -left-14 -top-14 h-44 w-44 rounded-full bg-white/20 blur-2xl"
            />
            <h2 className="relative text-3xl font-black tracking-tight text-white sm:text-4xl">
              Put our network behind your next deadline
            </h2>
            <div className="relative mt-8 flex flex-wrap justify-center gap-3">
              <Link to="/ship" className="btn-white btn-lg">
                Ship Now <ArrowRight size={18} aria-hidden />
              </Link>
              <Link
                to="/track"
                className="btn-lg inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/70 px-7 py-3 text-base font-bold text-white transition hover:bg-white/10"
              >
                Track a package
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
