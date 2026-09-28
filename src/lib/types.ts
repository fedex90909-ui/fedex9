export interface Address {
  fullName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  country: string
  zip: string
}

export interface PackageInfo {
  type: string
  weight: string
  length: string
  width: string
  height: string
  description: string
}

export interface DeliveryOption {
  id: string
  name: string
  eta: string
  price: number
  description: string
  icon: 'zap' | 'moon' | 'clock' | 'calendar'
  badge?: string
  guaranteedBy: string
}

export type ShipmentStatus =
  | 'created'
  | 'picked_up'
  | 'in_transit'
  | 'at_facility'
  | 'out_for_delivery'
  | 'delivered'
  | 'delayed'
  | 'cancelled'

export type EventState = 'done' | 'current' | 'pending'

export interface TrackingEvent {
  title: string
  description: string
  location: string
  time: Date
  state: EventState
  icon: 'file' | 'package' | 'truck' | 'warehouse' | 'navigation' | 'home' | 'alert' | 'close'
}

export interface Shipment {
  trackingNumber: string
  status: ShipmentStatus
  statusLabel: string
  progress: number
  origin: { city: string; country: string }
  destination: { city: string; country: string }
  currentLocation: string
  estimatedDelivery: string
  shippingMethod: string
  packageType: string
  weight?: string
  lastUpdated: Date
  events: TrackingEvent[]
}

export type PaymentMethod = 'card' | 'transfer'

export interface Booking {
  id: string
  reference: string
  trackingNumber: string
  createdAt: string
  sender: Address
  recipient: Address
  pkg: PackageInfo
  optionId: string
  amount: number
  paymentMethod: PaymentMethod
  estimateDate: string
}

export interface BookingDraft {
  sender: Address
  recipient: Address
  pkg: PackageInfo
  optionId: string | null
}
