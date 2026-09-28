import type { Address, PackageInfo } from './types'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

export function isEmail(v: string): boolean {
  return EMAIL_RE.test(v.trim())
}

export function isPhone(v: string): boolean {
  return v.replace(/\D/g, '').length >= 7
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>

export function validateAddress(a: Address): FieldErrors<Address> {
  const e: FieldErrors<Address> = {}
  if (!a.fullName.trim()) e.fullName = 'Full name is required'
  if (!a.email.trim()) e.email = 'Email is required'
  else if (!isEmail(a.email)) e.email = 'Enter a valid email address'
  if (!a.phone.trim()) e.phone = 'Phone is required'
  else if (!isPhone(a.phone)) e.phone = 'Enter a valid phone number'
  if (!a.address.trim()) e.address = 'Street address is required'
  if (!a.city.trim()) e.city = 'City is required'
  if (!a.state.trim()) e.state = 'State / province is required'
  if (!a.country.trim()) e.country = 'Country is required'
  if (!a.zip.trim()) e.zip = 'ZIP / postal code is required'
  return e
}

export function validatePackage(p: PackageInfo): FieldErrors<PackageInfo> {
  const e: FieldErrors<PackageInfo> = {}
  if (!p.type) e.type = 'Choose a package type'
  const w = Number(p.weight)
  if (!p.weight.trim()) e.weight = 'Weight is required'
  else if (Number.isNaN(w) || w <= 0) e.weight = 'Weight must be a positive number'
  else if (w > 150) e.weight = 'Contact us for shipments over 150 lbs'
  for (const [key, label] of [
    ['length', 'Length'],
    ['width', 'Width'],
    ['height', 'Height'],
  ] as const) {
    const v = Number(p[key])
    if (!p[key].trim()) e[key] = `${label} is required`
    else if (Number.isNaN(v) || v <= 0) e[key] = `${label} must be a positive number`
  }
  return e
}

export interface CardInput {
  name: string
  number: string
  expiry: string
  cvv: string
  address: string
}

export function validateCard(c: CardInput): FieldErrors<CardInput> {
  const e: FieldErrors<CardInput> = {}
  if (!c.name.trim()) e.name = 'Cardholder name is required'
  const digits = c.number.replace(/\s/g, '')
  if (!digits) e.number = 'Card number is required'
  else if (!/^\d{16}$/.test(digits)) e.number = 'Enter the 16-digit card number'
  if (!c.expiry) e.expiry = 'Expiry date is required'
  else {
    const m = c.expiry.match(/^(\d{2})\s*\/\s*(\d{2})$/)
    if (!m) e.expiry = 'Use MM/YY format'
    else {
      const mm = Number(m[1])
      const yy = Number(m[2])
      if (mm < 1 || mm > 12) e.expiry = 'Invalid month'
      else {
        const now = new Date()
        const exp = new Date(2000 + yy, mm, 0, 23, 59, 59)
        if (exp < now) e.expiry = 'Card has expired'
      }
    }
  }
  if (!c.cvv) e.cvv = 'CVV is required'
  else if (!/^\d{3,4}$/.test(c.cvv)) e.cvv = 'CVV must be 3–4 digits'
  if (!c.address.trim()) e.address = 'Billing address is required'
  return e
}

export function hasErrors(e: Record<string, string | undefined>): boolean {
  return Object.values(e).some(Boolean)
}

/* ---------- Phase 2: account + payment validation ---------- */

export interface SignUpInput {
  name: string
  email: string
  phone: string
  password: string
  confirm: string
}

/** Password policy: 8+ chars with upper, lower and digit. */
export function passwordIssues(pw: string): string[] {
  const issues: string[] = []
  if (pw.length < 8) issues.push('at least 8 characters')
  if (!/[A-Z]/.test(pw)) issues.push('an uppercase letter')
  if (!/[a-z]/.test(pw)) issues.push('a lowercase letter')
  if (!/\d/.test(pw)) issues.push('a number')
  return issues
}

export function validateSignUp(v: SignUpInput): FieldErrors<SignUpInput> {
  const e: FieldErrors<SignUpInput> = {}
  if (!v.name.trim()) e.name = 'Full name is required'
  if (!v.email.trim()) e.email = 'Email is required'
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address'
  if (!v.phone.trim()) e.phone = 'Phone number is required'
  else if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number'
  if (!v.password) e.password = 'Password is required'
  else {
    const issues = passwordIssues(v.password)
    if (issues.length) e.password = `Password needs ${issues.join(', ')}`
  }
  if (!v.confirm) e.confirm = 'Confirm your password'
  else if (v.confirm !== v.password) e.confirm = 'Passwords do not match'
  return e
}

export interface SignInInput {
  email: string
  password: string
}

export function validateSignIn(v: SignInInput): FieldErrors<SignInInput> {
  const e: FieldErrors<SignInInput> = {}
  if (!v.email.trim()) e.email = 'Email is required'
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address'
  if (!v.password) e.password = 'Password is required'
  return e
}

export interface ProfileInput {
  name: string
  email: string
  phone: string
  street: string
  city: string
  state: string
  country: string
  zip: string
}

export function validateProfile(v: ProfileInput): FieldErrors<ProfileInput> {
  const e: FieldErrors<ProfileInput> = {}
  if (!v.name.trim()) e.name = 'Name is required'
  if (!v.email.trim()) e.email = 'Email is required'
  else if (!isEmail(v.email)) e.email = 'Enter a valid email address'
  if (!v.phone.trim()) e.phone = 'Phone is required'
  else if (!isPhone(v.phone)) e.phone = 'Enter a valid phone number'
  if (!v.street.trim()) e.street = 'Street address is required'
  if (!v.city.trim()) e.city = 'City is required'
  if (!v.country.trim()) e.country = 'Country is required'
  return e
}

export interface TransferInput {
  reference: string
  senderName: string
}

export function validateTransfer(v: TransferInput): FieldErrors<TransferInput> {
  const e: FieldErrors<TransferInput> = {}
  if (!v.reference.trim()) e.reference = 'Transfer reference is required'
  if (!v.senderName.trim()) e.senderName = 'Sender name is required'
  return e
}
