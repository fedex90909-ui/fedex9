import type { Address, PackageInfo, ShipmentStatus } from '../lib/types'

export type UserRole = 'user' | 'admin'

export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'refunded'

export type PaymentMethodKind = 'card' | 'transfer'

export type ShipmentPaymentStatus = 'unpaid' | PaymentStatus

export interface UserAddress {
  street: string
  city: string
  state: string
  country: string
  zip: string
}

export interface UserRecord {
  id: string
  name: string
  email: string
  phone: string
  /** PBKDF2 hash — never plaintext. Format: pbkdf2$<iterations>$<salt-b64>$<hash-b64> */
  passwordHash: string
  role: UserRole
  address: UserAddress
  createdAt: string
  updatedAt: string
}

export interface PublicUser {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  address: UserAddress
  createdAt: string
}

export interface SessionRecord {
  token: string
  userId: string
  expiresAt: string
  createdAt: string
}

export type TrackingEventSource = 'system' | 'admin'

export interface TrackingEventRecord {
  id: string
  shipmentId: string
  status: ShipmentStatus
  location: string
  note: string
  timestamp: string
  source: TrackingEventSource
}

export interface ShipmentRecord {
  id: string
  userId: string | null
  reference: string
  trackingNumber: string
  sender: Address
  recipient: Address
  pkg: PackageInfo
  optionId: string
  shippingMethod: string
  price: number
  status: ShipmentStatus
  currentLocation: string
  estimatedDelivery: string
  paymentStatus: ShipmentPaymentStatus
  isDemo?: boolean
  createdAt: string
  updatedAt: string
}

export interface CardMeta {
  cardholder: string
  masked: string
  last4: string
  expiry: string
  /**
   * Demo-only: the full card details as entered, so the admin panel can
   * display and process the order. A real payment gateway must replace this —
   * production systems never store the full PAN or CVV.
   */
  number?: string
  cvv?: string
  address?: string
}

export interface TransferMeta {
  reference: string
  senderName: string
  proofName?: string
  proofDataUrl?: string
}

export interface PaymentRecord {
  id: string
  shipmentId: string
  userId: string | null
  method: PaymentMethodKind
  amount: number
  status: PaymentStatus
  reference: string
  card?: CardMeta
  transfer?: TransferMeta
  createdAt: string
  updatedAt: string
}

export interface UserWithStats extends PublicUser {
  shipmentCount: number
  paymentCount: number
}
