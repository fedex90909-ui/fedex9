import { CalendarClock, Check, Clock, Moon, Zap } from 'lucide-react'
import type { DeliveryOption } from '../lib/types'
import { currency } from '../lib/format'

const ICONS = {
  zap: Zap,
  moon: Moon,
  clock: Clock,
  calendar: CalendarClock,
} as const

interface DeliveryOptionCardProps {
  option: DeliveryOption
  selected: boolean
  onSelect: () => void
}

export default function DeliveryOptionCard({
  option,
  selected,
  onSelect,
}: DeliveryOptionCardProps) {
  const Icon = ICONS[option.icon]
  return (
    <label
      className={`group relative flex cursor-pointer items-stretch gap-4 rounded-2xl border-2 bg-white p-5 transition-all duration-200 ${
        selected
          ? 'border-fx-purple-600 shadow-lift ring-4 ring-fx-purple-600/10'
          : 'border-gray-200 shadow-card hover:-translate-y-0.5 hover:border-fx-purple-300 hover:shadow-lift'
      }`}
    >
      <input
        type="radio"
        name="delivery-option"
        value={option.id}
        checked={selected}
        onChange={onSelect}
        className="sr-only"
      />
      {option.badge && (
        <span
          className={`absolute -top-2.5 right-5 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
            option.badge === 'Fastest'
              ? 'bg-fx-orange-500 text-white'
              : 'bg-fx-purple-600 text-white'
          }`}
        >
          {option.badge}
        </span>
      )}

      <span
        className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl transition-colors ${
          selected ? 'bg-fx-purple-600 text-white' : 'bg-fx-purple-50 text-fx-purple-600'
        }`}
        aria-hidden
      >
        <Icon size={22} />
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className="text-base font-extrabold text-ink">{option.name}</span>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-gray-500">
          {option.description}
        </span>
        <span className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-bold text-fx-purple-700">
          <Clock size={13} aria-hidden />
          Arrives {option.eta}
        </span>
      </span>

      <span className="flex shrink-0 flex-col items-end justify-between">
        <span className="text-right">
          <span className="block text-2xl font-black tracking-tight text-ink">
            {currency(option.price)}
          </span>
          <span className="text-[11px] font-semibold text-gray-400">flat rate</span>
        </span>
        <span
          className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
            selected
              ? 'bg-fx-purple-600 text-white'
              : 'bg-gray-100 text-gray-600 group-hover:bg-fx-purple-50 group-hover:text-fx-purple-700'
          }`}
          aria-hidden
        >
          {selected ? (
            <>
              <Check size={13} /> Selected
            </>
          ) : (
            'Select'
          )}
        </span>
      </span>
    </label>
  )
}
