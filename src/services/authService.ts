import type { PublicUser, SessionRecord, UserRecord, UserRole, UserAddress } from '../types/models'
import { ADMIN_EMAILS } from '../lib/config'
import { KEYS, readCollection, uid, writeCollection } from './db'
import { supabase } from '../lib/supabase'

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
  // Constant-time-ish comparison
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

/* --------------------- Supabase row ↔ UserRecord mapping --------------------- */

interface AccountRow {
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

function rowToUser(row: AccountRow): UserRecord {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    passwordHash: row.password_hash,
    role: row.role,
    address: row.address ?? { street: '', city: '', state: '', country: '', zip: '' },
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toPublic(u: UserRecord): PublicUser {
  const { passwordHash: _ph, ...rest } = u
  return rest
}

/* --------------------------- session helpers --------------------------- */

const SESSION_KEY = 'fx.session' // current token pointer
const REMEMBER_MS = 30 * 24 * 3600_000
const SHORT_MS = 12 * 3600_000

/** In-memory cache of the current user, populated by currentUser() during boot.
 *  Service callers use requireUser()/requireAdmin() which read this cache
 *  synchronously — avoiding an async cascade through every service and page. */
let cachedUser: PublicUser | null = null

function setSessionPointer(token: string | null): void {
  try {
    if (token) localStorage.setItem(SESSION_KEY, token)
    else localStorage.removeItem(SESSION_KEY)
  } catch {
    /* ignore */
  }
}

function readSessionPointer(): string | null {
  try {
    return localStorage.getItem(SESSION_KEY)
  } catch {
    return null
  }
}

/** Resolves the current user from Supabase via the localStorage session token.
 *  Populates the in-memory cache so synchronous callers (requireUser etc.) work. */
export async function currentUser(): Promise<PublicUser | null> {
  const token = readSessionPointer()
  if (!token) {
    cachedUser = null
    return null
  }
  const sessions = readCollection<SessionRecord>(KEYS.sessions)
  const session = sessions.find((s) => s.token === token)
  if (!session) {
    cachedUser = null
    return null
  }
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    writeCollection(KEYS.sessions, sessions.filter((s) => s.token !== token))
    setSessionPointer(null)
    cachedUser = null
    return null
  }
  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, email, phone, password_hash, role, address, created_at, updated_at')
    .eq('id', session.userId)
    .maybeSingle()
  if (error || !data) {
    cachedUser = null
    return null
  }
  cachedUser = toPublic(rowToUser(data as AccountRow))
  return cachedUser
}

/** Synchronous guard: returns the cached current user. Must be called after
 *  AuthProvider boot has completed (currentUser() resolved). */
export function requireUser(): PublicUser {
  const u = cachedUser
  if (!u) throw new AuthError('Authentication required')
  return u
}

export function requireAdmin(): PublicUser {
  const u = requireUser()
  if (u.role !== 'admin') throw new AuthError('Admin access required')
  return u
}

function createSession(userId: string, remember: boolean): SessionRecord {
  const session: SessionRecord = {
    token: uid('tok') + uid('x'),
    userId,
    expiresAt: new Date(Date.now() + (remember ? REMEMBER_MS : SHORT_MS)).toISOString(),
    createdAt: new Date().toISOString(),
  }
  const sessions = readCollection<SessionRecord>(KEYS.sessions)
  sessions.push(session)
  writeCollection(KEYS.sessions, sessions)
  setSessionPointer(session.token)
  return session
}

async function grantAdminIfNeeded(user: UserRecord): Promise<UserRecord> {
  if (user.role === 'admin') return user
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    const updated = { ...user, role: 'admin' as UserRole, updatedAt: new Date().toISOString() }
    const { error } = await supabase
      .from('accounts')
      .update({ role: 'admin', updated_at: updated.updatedAt })
      .eq('id', user.id)
    if (error) {
      console.warn('Failed to persist admin role upgrade:', error.message)
    }
    return updated
  }
  return user
}

/* ------------------------------ public API ----------------------------- */

export async function signUp(input: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const { data: existing, error: checkError } = await supabase
    .from('accounts')
    .select('id')
    .eq('email', email)
    .maybeSingle()
  if (checkError) throw new AuthError('Could not verify account. Please try again.')
  if (existing) throw new AuthError('An account with this email already exists')

  const passwordHash = await hashPassword(input.password)
  const now = new Date().toISOString()
  const id = uid('usr')
  const role: UserRole = ADMIN_EMAILS.includes(email) ? 'admin' : 'user'

  const { error: insertError } = await supabase.from('accounts').insert({
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
  if (insertError) {
    if (insertError.code === '23505') {
      throw new AuthError('An account with this email already exists')
    }
    throw new AuthError('Could not create your account. Please try again.')
  }

  const user: UserRecord = {
    id,
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash,
    role,
    address: { street: '', city: '', state: '', country: '', zip: '' },
    createdAt: now,
    updatedAt: now,
  }
  createSession(user.id, true)
  cachedUser = toPublic(user)
  return cachedUser
}

export async function signIn(input: {
  email: string
  password: string
  remember: boolean
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, email, phone, password_hash, role, address, created_at, updated_at')
    .eq('email', email)
    .maybeSingle()

  await new Promise((r) => setTimeout(r, 350))

  if (error || !data) {
    throw new AuthError('Invalid email or password')
  }

  const user = rowToUser(data as AccountRow)
  if (!(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError('Invalid email or password')
  }
  const elevated = await grantAdminIfNeeded(user)
  createSession(elevated.id, input.remember)
  cachedUser = toPublic(elevated)
  return cachedUser
}

export function signOut(): void {
  const token = readSessionPointer()
  if (token) {
    const sessions = readCollection<SessionRecord>(KEYS.sessions)
    writeCollection(
      KEYS.sessions,
      sessions.filter((s) => s.token !== token),
    )
  }
  setSessionPointer(null)
  cachedUser = null
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
  if (error) throw new AuthError('Could not save profile. Please try again.')

  const { data: updated, error: fetchError } = await supabase
    .from('accounts')
    .select('id, name, email, phone, password_hash, role, address, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle()
  if (fetchError || !updated) throw new AuthError('Account not found')
  cachedUser = toPublic(rowToUser(updated as AccountRow))
  return cachedUser
}

export async function requestPasswordReset(email: string): Promise<void> {
  await new Promise((r) => setTimeout(r, 500))
  if (!email.trim()) throw new AuthError('Enter your email address')
}

export async function changePassword(
  userId: string,
  currentPw: string,
  newPw: string,
): Promise<void> {
  const { data, error } = await supabase
    .from('accounts')
    .select('password_hash')
    .eq('id', userId)
    .maybeSingle()
  if (error || !data) throw new AuthError('Account not found')

  const stored = (data as { password_hash: string }).password_hash
  if (!(await verifyPassword(currentPw, stored))) {
    throw new AuthError('Current password is incorrect')
  }
  const passwordHash = await hashPassword(newPw)
  const { error: updateError } = await supabase
    .from('accounts')
    .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (updateError) throw new AuthError('Could not change password. Please try again.')
}
