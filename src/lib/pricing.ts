import type { DeliveryOption, PackageInfo } from './types'

/**
 * Service levels and their flat rates. This module is the single source of
 * truth for delivery options — swap `priceFor` with a live pricing API later
 * without touching any UI.
 */
export const DELIVERY_OPTIONS: DeliveryOption[] = [
  {
    id: 'same-day',
    name: 'Same Day',
    eta: 'Today, by 9:00 PM',
    price: 40,
    description: 'Dedicated door-to-door courier for urgent shipments across major metros.',
    icon: 'zap',
    badge: 'Fastest',
    guaranteedBy: 'Today by 9:00 PM',
  },
  {
    id: 'overnight',
    name: 'Overnight',
    eta: 'Tomorrow, by 8:00 AM',
    price: 30,
    description: 'Priority next-morning delivery on our first-flight-out air network.',
    icon: 'moon',
    guaranteedBy: 'Tomorrow by 8:00 AM',
  },
  {
    id: '2-day',
    name: '2 Days',
    eta: 'In 2 business days, by 8:00 AM',
    price: 30,
    description: 'Time-definite morning delivery, two business days after pickup.',
    icon: 'clock',
    guaranteedBy: '2nd business day by 8:00 AM',
  },
  {
    id: '3-day',
    name: '3 Days',
    eta: 'In 3 business days',
    price: 20,
    description: 'Reliable economy delivery with full end-to-end tracking included.',
    icon: 'calendar',
    badge: 'Best value',
    guaranteedBy: '3rd business day by end of day',
  },
]

export function getDeliveryOptions(): DeliveryOption[] {
  return DELIVERY_OPTIONS
}

export function getDeliveryOption(id: string): DeliveryOption | undefined {
  return DELIVERY_OPTIONS.find((o) => o.id === id)
}

export function priceFor(option: DeliveryOption, _pkg?: PackageInfo): number {
  // Flat rate per service level. Replace with a distance/weight-aware API call
  // when a real pricing backend is connected.
  return option.price
}

export function estimateDeliveryFor(optionId: string): Date {
  const now = new Date()
  switch (optionId) {
    case 'same-day': {
      const d = new Date(now)
      d.setHours(21, 0, 0, 0)
      if (d < now) d.setDate(d.getDate() + 1)
      return d
    }
    case 'overnight': {
      const d = new Date(now)
      d.setDate(d.getDate() + 1)
      d.setHours(8, 0, 0, 0)
      return d
    }
    case '2-day': {
      const d = new Date(now)
      d.setDate(d.getDate() + 2)
      d.setHours(8, 0, 0, 0)
      return d
    }
    default: {
      const d = new Date(now)
      d.setDate(d.getDate() + 3)
      d.setHours(17, 0, 0, 0)
      return d
    }
  }
}
