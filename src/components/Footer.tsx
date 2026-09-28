import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Linkedin, Instagram, Twitter, Youtube } from 'lucide-react'
import Logo from './Logo'
import Modal from './Modal'
import { useToast } from '../context/ToastContext'

const SERVICE_LINKS = [
  { to: '/services#same-day', label: 'Same-Day Delivery' },
  { to: '/services#overnight', label: 'Overnight Delivery' },
  { to: '/services#international', label: 'International Shipping' },
  { to: '/services#freight', label: 'Freight Shipping' },
  { to: '/services#ecommerce', label: 'E-commerce Delivery' },
]

const COMPANY_LINKS = [
  { to: '/about', label: 'About FedEx' },
  { to: '/about#technology', label: 'Technology' },
  { to: '/about#network', label: 'Our Network' },
  { to: '/contact', label: 'Contact Us' },
]

const SUPPORT_LINKS = [
  { to: '/track', label: 'Track a Shipment' },
  { to: '/ship', label: 'Schedule a Shipment' },
  { to: '/contact', label: 'Help Center' },
  { to: '/services#pickup', label: 'Find Pickup Options' },
]

function LegalModal({
  kind,
  onClose,
}: {
  kind: 'terms' | 'privacy'
  onClose: () => void
}) {
  const isTerms = kind === 'terms'
  return (
    <Modal open onClose={onClose} title={isTerms ? 'Terms of Use' : 'Privacy Notice'}>
      <p className="text-sm leading-relaxed text-gray-600">
        {isTerms
          ? 'By using this site you agree to these terms. All names, numbers and prices shown are illustrative, and no payments are captured through this site.'
          : 'This site runs entirely in your browser. Shipment details entered in the booking flow are stored only in your own browser (localStorage) to make tracking work — nothing is transmitted to a server, and card details are never sent anywhere.'}
      </p>
      <button onClick={onClose} className="btn-purple mt-5 w-full">
        Understood
      </button>
    </Modal>
  )
}

export default function Footer() {
  const toast = useToast()
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null)

  const social = (name: string) =>
    toast.info(`${name} is not linked yet`, 'Connect real profiles to activate these.')

  return (
    <footer className="bg-fx-purple-900 text-white">
      <div className="container-x grid gap-12 py-14 sm:py-16 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-purple-200/80">
            Fast, reliable domestic and international shipping — same-day couriers,
            overnight air freight, and door-to-door tracking across 220+ countries.
          </p>
          <div className="mt-6 flex gap-2">
            {[
              { name: 'X / Twitter', Icon: Twitter },
              { name: 'LinkedIn', Icon: Linkedin },
              { name: 'Instagram', Icon: Instagram },
              { name: 'YouTube', Icon: Youtube },
            ].map(({ name, Icon }) => (
              <button
                key={name}
                onClick={() => social(name)}
                aria-label={name}
                className="rounded-full bg-white/10 p-2.5 text-purple-100 transition hover:bg-white/20 hover:text-white"
              >
                <Icon size={16} aria-hidden />
              </button>
            ))}
          </div>
        </div>

        <nav aria-label="Services">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white">
            Services
          </h3>
          <ul className="mt-4 space-y-2.5">
            {SERVICE_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-purple-200/80 transition hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Company">
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white">
            Company
          </h3>
          <ul className="mt-4 space-y-2.5">
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-purple-200/80 transition hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-sm font-extrabold uppercase tracking-[0.14em] text-white">
            Support
          </h3>
          <ul className="mt-4 space-y-2.5">
            {SUPPORT_LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  className="text-sm text-purple-200/80 transition hover:text-white"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <a
            href="mailto:FedEx90909@gmail.com"
            className="mt-5 block text-sm font-bold text-white transition hover:text-fx-orange-400"
          >
            FedEx90909@gmail.com
          </a>
          <p className="text-xs text-purple-200/70">24/7 customer support</p>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col items-start justify-between gap-3 py-6 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs text-purple-200/70">
              © 2026 FedEx. All rights reserved.
            </p>
            <div className="mt-2 flex gap-4">
              <button
                onClick={() => setLegal('terms')}
                className="text-xs font-semibold text-purple-200/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                Terms of Use
              </button>
              <button
                onClick={() => setLegal('privacy')}
                className="text-xs font-semibold text-purple-200/80 underline-offset-4 transition hover:text-white hover:underline"
              >
                Privacy Notice
              </button>
            </div>
          </div>
          <p className="text-xs text-purple-200/50">United States · English</p>
        </div>
      </div>

      {legal && <LegalModal kind={legal} onClose={() => setLegal(null)} />}
    </footer>
  )
}
