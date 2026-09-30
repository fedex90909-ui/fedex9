import type { PublicUser, SessionRecord, UserRecord, UserRole, UserAddress } from '../types/models'
import { ADMIN_EMAILS } from '../lib/config'
import { supabase } from '../lib/supabaseClient'
import { uid } from './db'

export class AuthError extends Error {}

const ITERATIONS = 120_000

/** PBKDF2-SHA256 via WebCrypto. Passwords are never stored in plaintext. */
async function hashPassword(password: string, saltB64?: string): Promise<string> {
  const salt = saltB64
    ? base64ToBytes(saltB64)
    : crypto.getRandomValues(new Uint8Array(16))
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    'PBKDF2',
    false,
    ['deriveBits'],
  )
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: salt as BufferSource, iterations: ITERATIONS },
    key,
    256,
  )
  return `pbkdf2$${ITERATIONS}$${bytesToBase64(salt)}$${bytesToBase64(new Uint8Array(bits))}`
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [, , saltB64] = stored.split('$')
  const candidate = await hashPassword(password, saltB64)
  const a = new TextEncoder().encode(candidate)
  const b = new TextEncoder().encode(stored)
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a[i]! ^ b[i]!
  return diff === 0
}

function bytesToBase64(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s)
}

function base64ToBytes(b64: string): Uint8Array {
  const s = atob(b64)
  const out = new Uint8Array(s.length)
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i)
  return out
}

interface DbAccount {
  id: string
  name: string
  email: string
  phone: string
  password_hash: string
  role: UserRole
  address: UserAddress
  created_at: string
  updated_at: string
}

function dbToUser(r: DbAccount): UserRecord {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    passwordHash: r.password_hash,
    role: r.role,
    address: r.address,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  }
}

function toPublic(u: UserRecord): PublicUser {
  const { passwordHash: _ph, ...rest } = u
  return rest
}

/* --------------------------- session helpers --------------------------- */

const SESSION_KEY = 'fx.session'

function setSessionPointer(token: string | null): void {
  try {
    if (token) localStorage.setItem(SESSION_KEY, token)
    else localStorage.removeItem(SESSION_KEY)
  } catch { /* ignore */ }
}

function readSessionPointer(): string | null {
  try { return localStorage.getItem(SESSION_KEY) } catch { return null }
}

function writeSessionCache(user: PublicUser): void {
  try { localStorage.setItem('fx.sessionUser', JSON.stringify(user)) } catch { /* ignore */ }
}

function readSessionCache(): PublicUser | null {
  try {
    const raw = localStorage.getItem('fx.sessionUser')
    return raw ? JSON.parse(raw) as PublicUser : null
  } catch { return null }
}

function clearSessionCache(): void {
  try {
    localStorage.removeItem(SESSION_KEY)
    localStorage.removeItem('fx.sessionUser')
  } catch { /* ignore */ }
}

export function currentUser(): PublicUser | null {
  const token = readSessionPointer()
  if (!token) return null
  const user = readSessionCache()
  return user
}

export function requireUser(): PublicUser {
  const u = currentUser()
  if (!u) throw new AuthError('Authentication required')
  return u
}

export function requireAdmin(): PublicUser {
  const u = requireUser()
  if (u.role !== 'admin') throw new AuthError('Admin access required')
  return u
}

function createSession(userId: string, remember: boolean, user: PublicUser): void {
  const _session: SessionRecord = {
    token: uid('tok') + uid('x'),
    userId,
    expiresAt: new Date(Date.now() + (remember ? 30 * 24 * 3600_000 : 12 * 3600_000)).toISOString(),
    createdAt: new Date().toISOString(),
  }
  setSessionPointer(_session.token)
  writeSessionCache(user)
}

/* ------------------------------ public API ----------------------------- */

export async function signUp(input: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const { data: existing } = await supabase
    .from('accounts')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (existing) throw new AuthError('An account with this email already exists')

  const passwordHash = await hashPassword(input.password)
  const now = new Date().toISOString()
  const id = uid('usr')
  const role: UserRole = ADMIN_EMAILS.includes(email) ? 'admin' : 'user'

  const { error } = await supabase.from('accounts').insert({
    id,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    password_hash: passwordHash,
    role,
    address: { street: '', city: '', state: '', country: '', zip: '' },
    created_at: now,
    updated_at: now,
  })
  if (error) throw new AuthError('Could not create account')

  const pub: PublicUser = {
    id, name: input.name.trim(), email, phone: input.phone.trim(),
    role, address: { street: '', city: '', state: '', country: '', zip: '' },
    createdAt: now,
  }
  createSession(id, true, pub)
  return pub
}

export async function signIn(input: {
  email: string
  password: string
  remember: boolean
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  await new Promise((r) => setTimeout(r, 350))
  if (error || !data) throw new AuthError('Invalid email or password')
  const user = dbToUser(data as DbAccount)
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError('Invalid email or password')
  }
  const pub = toPublic(user)
  createSession(user.id, input.remember, pub)
  return pub
}

export function signOut(): void {
  clearSessionCache()
}

export async function updateProfile(
  userId: string,
  patch: { name: string; email: string; phone: string; address: UserAddress },
): Promise<PublicUser> {
  const email = patch.email.trim().toLowerCase()
  const { data: clash } = await supabase
    .from('accounts')
    .select('id')
    .eq('email', email)
    .neq('id', userId)
    .maybeSingle()
  if (clash) throw new AuthError('Another account already uses this email')

  const now = new Date().toISOString()
  const { error } = await supabase
    .from('accounts')
    .update({
      name: patch.name.trim(),
      email,
      phone: patch.phone.trim(),
      address: patch.address,
      updated_at: now,
    })
    .eq('id', userId)
  if (error) throw new AuthError('Could not update profile')

  const current = readSessionCache()
  const updated: PublicUser = current
    ? { ...current, name: patch.name.trim(), email, phone: patch.phone.trim(), address: patch.address }
    : { id: userId, name: patch.name.trim(), email, phone: patch.phone.trim(), role: 'user', address: patch.address, createdAt: now }
  writeSessionCache(updated)
  return updated
}

export async function requestPasswordReset(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 500))
  if (!email.trim()) throw new AuthError('Enter your email address')
}
