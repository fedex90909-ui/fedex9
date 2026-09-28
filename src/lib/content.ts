export const COUNTRIES = [
  'United States',
  'Canada',
  'United Kingdom',
  'Germany',
  'France',
  'Netherlands',
  'Spain',
  'Italy',
  'United Arab Emirates',
  'India',
  'China',
  'Singapore',
  'Japan',
  'Australia',
  'Brazil',
  'Mexico',
  'South Africa',
  'Nigeria',
]

export const PACKAGE_TYPES = [
  { value: 'box', label: 'Box', hint: 'Cardboard box, 1–150 lbs' },
  { value: 'document', label: 'Envelope / Document', hint: 'Flat documents up to 2 lbs' },
  { value: 'parcel', label: 'Parcel', hint: 'Irregular or poly-wrapped items' },
  { value: 'pallet', label: 'Pallet / Freight', hint: 'Palletized freight over 150 lbs' },
  { value: 'fragile', label: 'Fragile', hint: 'Extra-protected handling' },
]

export const CONTACT_SUBJECTS = [
  'General question',
  'Shipping support',
  'Tracking help',
  'Business inquiry',
  'Freight & logistics',
  'Feedback',
]

export const HOME_STATS: {
  value: number
  suffix?: string
  label: string
  decimals?: number
}[] = [
  { value: 220, suffix: '+', label: 'Countries & territories' },
  { value: 15, suffix: 'M', label: 'Packages delivered daily' },
  { value: 99.2, suffix: '%', label: 'On-time delivery rate', decimals: 1 },
  { value: 650, suffix: '+', label: 'Dedicated aircraft' },
]

export const WHY_FEATURES = [
  {
    icon: 'shield',
    title: 'Reliability you can plan around',
    text: 'A 99.2% on-time record backed by money-back guarantees on every time-definite service.',
  },
  {
    icon: 'radar',
    title: 'Real-time visibility',
    text: 'Scan-by-scan tracking from pickup to signature, with proactive delay alerts.',
  },
  {
    icon: 'globe',
    title: 'A truly global network',
    text: '220+ countries and territories served by air, road and ocean freight lines.',
  },
  {
    icon: 'tag',
    title: 'Honest, flat pricing',
    text: 'Know the full price before you book. No fuel surprises, no hidden handling fees.',
  },
] as const

export const HOW_STEPS = [
  {
    title: 'Tell us about your package',
    text: 'Enter the sender, recipient and package details — it takes about two minutes.',
  },
  {
    title: 'Choose your speed',
    text: 'Compare same-day, overnight and economy options with clear, flat pricing.',
  },
  {
    title: 'We pick up or you drop off',
    text: 'Book a courier pickup, or drop at any of 60,000+ retail locations.',
  },
  {
    title: 'Track it to the door',
    text: 'Follow every scan in real time until it is signed for at the destination.',
  },
]

export const TESTIMONIALS = [
  {
    quote:
      'We moved our entire e-commerce fulfillment to FedEx. Next-morning delivery is now our default promise, and customers notice.',
    name: 'Amara Okafor',
    role: 'COO, Loom & Lathe',
    initials: 'AO',
    tone: 'purple' as const,
  },
  {
    quote:
      'The tracking is genuinely real-time. Our support team sees the same timeline customers do, so "where is my order" calls dropped by half.',
    name: 'Daniel Reyes',
    role: 'Founder, Kitware Supply',
    initials: 'DR',
    tone: 'orange' as const,
  },
  {
    quote:
      'Same-day courier between our clinics has been flawless for two years. Custodial chain-of-signature is exactly what medical logistics needs.',
    name: 'Dr. Helen Zhou',
    role: 'Director, Northgate Health',
    initials: 'HZ',
    tone: 'purple' as const,
  },
]

export const FAQS = [
  {
    q: 'Where do I find my tracking number?',
    a: 'Your tracking number appears on the confirmation screen right after payment, and in the confirmation email. It is a 12-digit number that starts with 7946. You can also find it on your shipping receipt.',
  },
  {
    q: 'How is the shipping price calculated?',
    a: 'Each service level — Same Day, Overnight, 2 Days and 3 Days — carries a simple flat rate shown before you pay. What you see on the delivery options screen is exactly what you pay at checkout.',
  },
  {
    q: 'Do you ship internationally?',
    a: 'Yes. We deliver to more than 220 countries and territories. International shipments include customs paperwork support and door-to-door tracking across every leg of the journey.',
  },
  {
    q: 'What items cannot be shipped?',
    a: 'Hazardous materials, aerosols, perishables without refrigeration, illegal goods and lithium batteries without proper certification cannot enter the network. Restricted items are refused at pickup and refunded in full.',
  },
  {
    q: 'Can I change the delivery address after booking?',
    a: 'Yes, while a shipment is still in transit you can reroute it from the tracking page or by calling support. Same-day shipments can be rerouted until they are out for delivery.',
  },
  {
    q: 'What happens if my delivery is late?',
    a: 'Every time-definite service carries a money-back guarantee. If we miss the committed window, the shipping charge is refunded automatically — no claim form needed.',
  },
]

export const SERVICES = [
  {
    id: 'same-day',
    icon: 'zap',
    name: 'Same-Day Delivery',
    description:
      'A dedicated courier picks up and drives your shipment straight to its destination — no stops, no sorting hubs.',
    deliveryInfo: 'Delivered today, by 9:00 PM',
    coverage: 'Major metros',
    optionId: 'same-day',
  },
  {
    id: 'overnight',
    icon: 'moon',
    name: 'Overnight Delivery',
    description:
      'Your package flies the first flight out and arrives before the workday starts, guaranteed by 8:00 AM.',
    deliveryInfo: 'Next morning, by 8:00 AM',
    coverage: 'Nationwide',
    optionId: 'overnight',
  },
  {
    id: 'express',
    icon: 'plane',
    name: 'Express Shipping',
    description:
      'Priority air freight with the fastest published transit times on domestic lanes, backed by a money-back guarantee.',
    deliveryInfo: '1–2 business days',
    coverage: 'Nationwide',
    optionId: 'overnight',
  },
  {
    id: 'international',
    icon: 'globe',
    name: 'International Shipping',
    description:
      'Door-to-door delivery to 220+ countries with customs clearance handled for you, both directions.',
    deliveryInfo: '2–5 business days',
    coverage: '220+ countries',
    optionId: '3-day',
  },
  {
    id: 'freight',
    icon: 'container',
    name: 'Freight Shipping',
    description:
      'Palletized LTL and full-truckload freight with liftgate service, inside pickup and delivery options.',
    deliveryInfo: '3–7 business days',
    coverage: 'Continental & overseas',
    optionId: '3-day',
  },
  {
    id: 'business',
    icon: 'briefcase',
    name: 'Business Logistics',
    description:
      'Scheduled pickups, consolidated invoicing and multi-user accounts built for growing operations.',
    deliveryInfo: 'Custom schedules',
    coverage: 'Global',
    optionId: '2-day',
  },
  {
    id: 'ecommerce',
    icon: 'cart',
    name: 'E-commerce Delivery',
    description:
      'API-first fulfillment with branded tracking pages, delivery photo proof and easy returns.',
    deliveryInfo: '2–3 business days',
    coverage: 'Global',
    optionId: '2-day',
  },
  {
    id: 'pickup',
    icon: 'package',
    name: 'Package Pickup',
    description:
      'Book a courier to collect from your home or office — or drop off free at 60,000+ locations.',
    deliveryInfo: 'On-demand or scheduled',
    coverage: 'Nationwide',
    optionId: null,
  },
] as const
