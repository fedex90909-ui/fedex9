import { Link } from 'react-router-dom'
import { ArrowRight, MapPin } from 'lucide-react'
import ServiceCard from '../components/ServiceCard'
import Reveal from '../components/Reveal'
import { SERVICES } from '../lib/content'

export default function Services() {
  return (
    <>
      <section className="dot-bg border-b border-gray-100">
        <div className="container-x py-14 sm:py-16">
          <Reveal className="max-w-2xl">
            <p className="kicker">Our services</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-ink sm:text-5xl">
              Every speed. Every size. One network.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Eight service lines engineered around one promise: your shipment arrives
              when we said it would — with a money-back guarantee behind it.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section">
        <div className="container-x grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 80}>
              <ServiceCard service={s} />
            </Reveal>
          ))}
        </div>
      </section>

      <section className="container-x pb-20">
        <Reveal>
          <div className="relative overflow-hidden rounded-3xl bg-fx-purple-800 px-6 py-12 sm:px-12">
            <div className="dot-bg-light absolute inset-0" aria-hidden />
            <div className="relative flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-white sm:text-3xl">
                  Prefer to drop off instead?
                </h2>
                <p className="mt-2 max-w-xl text-purple-200/80">
                  Bring packaged shipments to any of 60,000+ retail and staffed locations.
                  Most have same-day collection cutoffs as late as 7:00 PM.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link to="/ship" className="btn-primary btn-lg">
                  Book a pickup <ArrowRight size={17} aria-hidden />
                </Link>
                <Link to="/contact" className="btn-white btn-lg">
                  <MapPin size={16} aria-hidden /> Find a location
                </Link>
              </div>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  )
}
