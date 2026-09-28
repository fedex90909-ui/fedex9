import { Link } from 'react-router-dom'
import {
  ArrowRight,
  CalendarClock,
  Globe,
  Quote,
  Radar,
  ShieldCheck,
  Star,
  Tag,
  Truck,
} from 'lucide-react'
import TrackForm from '../components/TrackForm'
import Reveal from '../components/Reveal'
import Stat from '../components/Stat'
import FaqAccordion from '../components/FaqAccordion'
import ServiceCard from '../components/ServiceCard'
import HeroScene from '../components/illustrations/HeroScene'
import GlobeIllustration from '../components/illustrations/GlobeIllustration'
import { FAQS, HOME_STATS, HOW_STEPS, SERVICES, TESTIMONIALS, WHY_FEATURES } from '../lib/content'

const WHY_ICONS = { shield: ShieldCheck, radar: Radar, globe: Globe, tag: Tag } as const

const HOME_SERVICE_IDS = ['same-day', 'overnight', 'international', 'freight', 'business', 'ecommerce']

export default function Home() {
  return (
    <>
      {/* ============ HERO ============ */}
      <section className="dot-bg relative overflow-hidden">
        <div className="container-x grid items-center gap-12 py-14 sm:py-16 lg:grid-cols-2 lg:gap-10 lg:py-20">
          <div>
            <Reveal>
              <span className="chip">
                <Truck size={13} aria-hidden /> Trusted by 3M+ shippers worldwide
              </span>
            </Reveal>
            <Reveal delay={80}>
              <h1 className="mt-5 text-4xl font-black leading-[1.06] tracking-tight text-ink sm:text-5xl lg:text-[3.4rem]">
                Delivering What Matters,{' '}
                <span className="text-fx-purple-700">
                  Wherever{' '}
                  <span className="relative inline-block">
                    You Are
                    <span
                      aria-hidden
                      className="absolute -bottom-1 left-0 h-1.5 w-full rounded-full bg-fx-orange-500"
                    />
                  </span>
                  .
                </span>
              </h1>
            </Reveal>
            <Reveal delay={160}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-600">
                Fast domestic and international shipping with same-day couriers,
                overnight air freight and door-to-door tracking — priced simply, booked
                in two minutes.
              </p>
            </Reveal>
            <Reveal delay={220}>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Link to="/ship" className="btn-primary btn-lg">
                  Ship Now <ArrowRight size={18} aria-hidden />
                </Link>
                <Link to="/services" className="btn-outline btn-lg">
                  Explore services
                </Link>
              </div>
            </Reveal>

            {/* Tracking card */}
            <Reveal delay={300}>
              <div className="card mt-10 max-w-xl p-6 sm:p-7">
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-lg font-extrabold tracking-tight text-ink">
                    Track Your Shipment
                  </h2>
                  <span className="hidden items-center gap-1.5 text-xs font-bold text-green-600 sm:flex">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
                    </span>
                    Live network
                  </span>
                </div>
                <div className="mt-4">
                  <TrackForm size="lg" />
                </div>
                <Link
                  to="/ship"
                  className="mt-4 inline-flex items-center gap-1.5 text-sm font-extrabold text-fx-purple-700 transition-colors hover:text-fx-orange-600"
                >
                  <CalendarClock size={15} aria-hidden />
                  Schedule a Shipment
                  <ArrowRight size={14} aria-hidden />
                </Link>
              </div>
            </Reveal>
          </div>

          <Reveal delay={200} className="relative">
            <div className="animate-fade-in">
              <HeroScene />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ STATS BAND ============ */}
      <section className="border-y border-gray-100 bg-white">
        <div className="container-x grid grid-cols-2 gap-8 py-12 sm:py-14 lg:grid-cols-4">
          {HOME_STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 90}>
              <Stat value={s.value} suffix={s.suffix} label={s.label} decimals={s.decimals} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ============ SERVICES ============ */}
      <section className="section">
        <div className="container-x">
          <Reveal className="max-w-2xl">
            <p className="kicker">Shipping services</p>
            <h2 className="h-section">The right speed for every shipment</h2>
            <p className="mt-4 text-lg text-gray-600">
              From a same-day envelope across town to a pallet crossing an ocean — one
              network, one tracking number, flat transparent pricing.
            </p>
          </Reveal>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SERVICES.filter((s) => HOME_SERVICE_IDS.includes(s.id)).map((s, i) => (
              <Reveal key={s.id} delay={(i % 3) * 90}>
                <ServiceCard service={s} />
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8">
            <Link
              to="/services"
              className="inline-flex items-center gap-1.5 text-sm font-extrabold text-fx-purple-700 transition-colors hover:text-fx-orange-600"
            >
              See all eight services <ArrowRight size={15} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ WHY FEDEX ============ */}
      <section className="bg-white">
        <div className="container-x section">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
            <Reveal>
              <p className="kicker">Why FedEx</p>
              <h2 className="h-section">Built for people who can&apos;t afford “maybe”</h2>
              <p className="mt-4 text-lg text-gray-600">
                When a deadline actually matters, you need a carrier engineered around
                certainty — not one that hopes for the best.
              </p>
              <Link to="/about" className="btn-purple mt-7">
                Our story <ArrowRight size={16} aria-hidden />
              </Link>
            </Reveal>
            <div className="grid gap-5 sm:grid-cols-2">
              {WHY_FEATURES.map((f, i) => {
                const Icon = WHY_ICONS[f.icon]
                return (
                  <Reveal key={f.title} delay={i * 90}>
                    <div className="group h-full rounded-2xl border border-gray-200/70 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-fx-orange-50 text-fx-orange-600 transition-colors duration-300 group-hover:bg-fx-orange-500 group-hover:text-white">
                        <Icon size={21} aria-hidden />
                      </span>
                      <h3 className="mt-4 text-base font-extrabold text-ink">{f.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.text}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============ GLOBAL COVERAGE ============ */}
      <section className="relative overflow-hidden bg-fx-purple-900">
        <div className="dot-bg-light absolute inset-0" aria-hidden />
        <div className="container-x section relative grid items-center gap-12 lg:grid-cols-2">
          <Reveal className="order-2 lg:order-1">
            <GlobeIllustration light />
          </Reveal>
          <div className="order-1 lg:order-2">
            <Reveal>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-fx-orange-400">
                Global coverage
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                One network that spans the planet
              </h2>
              <p className="mt-4 max-w-lg text-lg leading-relaxed text-purple-200/80">
                650 aircraft, 200,000 vehicles and 4,300 facilities moving 15 million
                packages a day — coordinated from our global air hub in Memphis.
              </p>
            </Reveal>
            <div className="mt-8 grid grid-cols-3 gap-6">
              {[
                { v: '220+', l: 'Countries & territories' },
                { v: '60K+', l: 'Retail pickup points' },
                { v: '24/7', l: 'Network operations' },
              ].map((item, i) => (
                <Reveal key={item.l} delay={i * 90}>
                  <p className="text-2xl font-black text-white sm:text-3xl">{item.v}</p>
                  <p className="mt-1 text-xs font-semibold text-purple-200/70">{item.l}</p>
                </Reveal>
              ))}
            </div>
            <Reveal delay={200}>
              <Link to="/ship" className="btn-white mt-9">
                Start shipping globally <ArrowRight size={16} aria-hidden />
              </Link>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ HOW SHIPPING WORKS ============ */}
      <section className="section">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <p className="kicker">How shipping works</p>
            <h2 className="h-section">From doorstep to doorstep in four steps</h2>
          </Reveal>
          <ol className="relative mt-14 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <span
              aria-hidden
              className="absolute left-0 right-0 top-7 hidden border-t-2 border-dashed border-fx-purple-200 lg:block"
            />
            {HOW_STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 110}>
                <li className="relative">
                  <span className="relative z-10 grid h-14 w-14 place-items-center rounded-2xl bg-fx-purple-600 text-xl font-black text-white shadow-btn-purple">
                    {i + 1}
                  </span>
                  <h3 className="mt-5 text-base font-extrabold text-ink">{step.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-gray-600">{step.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
          <Reveal className="mt-12 text-center">
            <Link to="/ship" className="btn-primary btn-lg">
              Book your first shipment <ArrowRight size={18} aria-hidden />
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ============ TESTIMONIALS ============ */}
      <section className="bg-white">
        <div className="container-x section">
          <Reveal className="max-w-2xl">
            <p className="kicker">Customer stories</p>
            <h2 className="h-section">Businesses that ship with confidence</h2>
          </Reveal>
          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 100}>
                <figure className="flex h-full flex-col rounded-2xl border border-gray-200/70 bg-gradient-to-b from-white to-cloud/60 p-7 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                  <Quote size={22} className="text-fx-orange-500" aria-hidden />
                  <div className="mt-3 flex gap-0.5" aria-label="5 out of 5 stars">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} size={14} className="fill-fx-orange-500 text-fx-orange-500" aria-hidden />
                    ))}
                  </div>
                  <blockquote className="mt-3 flex-1 text-sm leading-relaxed text-gray-700">
                    “{t.quote}”
                  </blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                    <span
                      className={`grid h-11 w-11 place-items-center rounded-full text-sm font-black text-white ${
                        t.tone === 'purple' ? 'bg-fx-purple-600' : 'bg-fx-orange-500'
                      }`}
                      aria-hidden
                    >
                      {t.initials}
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold text-ink">{t.name}</span>
                      <span className="block text-xs font-semibold text-gray-500">{t.role}</span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ FAQ ============ */}
      <section className="section">
        <div className="container-x grid gap-10 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
          <Reveal>
            <p className="kicker">FAQ</p>
            <h2 className="h-section">Answers, before you ask</h2>
            <p className="mt-4 text-lg text-gray-600">
              Everything about tracking numbers, pricing and delivery guarantees. Still
              stuck? Our team answers around the clock.
            </p>
            <Link to="/contact" className="btn-outline mt-7">
              Contact support
            </Link>
          </Reveal>
          <Reveal delay={120}>
            <FaqAccordion items={FAQS} />
          </Reveal>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="container-x pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-fx-purple-800 px-6 py-14 text-center shadow-lift sm:px-12 sm:py-16">
            <div className="dot-bg-light absolute inset-0" aria-hidden />
            <div
              aria-hidden
              className="absolute -left-16 -top-16 h-48 w-48 rounded-full bg-fx-orange-500/20 blur-2xl"
            />
            <div
              aria-hidden
              className="absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-fx-purple-500/40 blur-3xl"
            />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl text-3xl font-black tracking-tight text-white sm:text-4xl">
                Ready to ship something?
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-purple-200/80">
                Book in two minutes, pay how you like, and watch it move — scan by scan.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Link to="/ship" className="btn-primary btn-lg">
                  Ship Now <ArrowRight size={18} aria-hidden />
                </Link>
                <Link
                  to="/track"
                  className="btn-white btn-lg"
                >
                  Track a package
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
