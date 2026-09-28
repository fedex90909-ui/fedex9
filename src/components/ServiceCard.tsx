import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Clock,
  Container,
  Globe,
  Moon,
  Package,
  Plane,
  ShoppingCart,
  Zap,
} from 'lucide-react'
import { SERVICES } from '../lib/content'

const ICONS = {
  zap: Zap,
  moon: Moon,
  plane: Plane,
  globe: Globe,
  container: Container,
  briefcase: Briefcase,
  cart: ShoppingCart,
  package: Package,
} as const

interface ServiceCardProps {
  service: (typeof SERVICES)[number]
}

export default function ServiceCard({ service }: ServiceCardProps) {
  const Icon = ICONS[service.icon]
  const href = service.optionId ? `/ship?service=${service.optionId}` : '/ship'
  return (
    <article
      id={service.id}
      className="group flex scroll-mt-24 flex-col rounded-2xl border border-gray-200/70 bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-fx-purple-300/70 hover:shadow-lift"
    >
      <span
        className="grid h-12 w-12 place-items-center rounded-xl bg-fx-purple-50 text-fx-purple-600 transition-colors duration-300 group-hover:bg-fx-purple-600 group-hover:text-white"
        aria-hidden
      >
        <Icon size={22} />
      </span>
      <h3 className="mt-4 text-lg font-extrabold tracking-tight text-ink">
        {service.name}
      </h3>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">
        {service.description}
      </p>
      <div className="mt-4 space-y-1.5 border-t border-gray-100 pt-4 text-xs font-semibold text-gray-500">
        <p className="flex items-center gap-2">
          <Clock size={13} className="text-fx-orange-500" aria-hidden />
          {service.deliveryInfo}
        </p>
        <p className="flex items-center gap-2">
          <Globe size={13} className="text-fx-orange-500" aria-hidden />
          {service.coverage}
        </p>
      </div>
      <Link
        to={href}
        className="mt-5 inline-flex items-center gap-1.5 text-sm font-extrabold text-fx-purple-700 transition-colors hover:text-fx-orange-600"
      >
        Ship with this
        <ArrowRight
          size={15}
          aria-hidden
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </Link>
    </article>
  )
}
