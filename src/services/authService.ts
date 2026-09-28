import type { PublicUser, SessionRecord, UserRecord, UserRole, UserAddress } from '../types/models'
import { ADMIN_EMAILS } from '../lib/config'
import { KEYS, readCollection, uid, usersCollection, writeCollection } from './db'

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

function toPublic(u: UserRecord): PublicUser {
  const { passwordHash: _ph, ...rest } = u
  return rest
}

/* --------------------------- session helpers --------------------------- */

const SESSION_KEY = 'fx.session' // current token pointer
const REMEMBER_MS = 30 * 24 * 3600_000
const SHORT_MS = 12 * 3600_000

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

export function currentUser(): PublicUser | null {
  const token = readSessionPointer()
  if (!token) return null
  const sessions = readCollection<SessionRecord>(KEYS.sessions)
  const session = sessions.find((s) => s.token === token)
  if (!session) return null
  if (new Date(session.expiresAt).getTime() < Date.now()) {
    // Expired — clean up.
    writeCollection(KEYS.sessions, sessions.filter((s) => s.token !== token))
    setSessionPointer(null)
    return null
  }
  const user = usersCollection()
    .read()
    .find((u) => u.id === session.userId)
  return user ? toPublic(user) : null
}

/** Server-seam guard: every privileged service call funnels through here. */
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

function grantAdminIfNeeded(user: UserRecord): UserRecord {
  if (user.role === 'admin') return user
  if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
    const users = usersCollection()
    const updated = { ...user, role: 'admin' as UserRole, updatedAt: new Date().toISOString() }
    users.write(users.read().map((u) => (u.id === user.id ? updated : u)))
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
  const users = usersCollection()
  if (users.read().some((u) => u.email.toLowerCase() === email)) {
    throw new AuthError('An account with this email already exists')
  }
  const passwordHash = await hashPassword(input.password)
  const now = new Date().toISOString()
  const user: UserRecord = {
    id: uid('usr'),
    name: input.name.trim(),
    email,
    phone: input.phone.trim(),
    passwordHash,
    role: ADMIN_EMAILS.includes(email) ? 'admin' : 'user',
    address: { street: '', city: '', state: '', country: '', zip: '' },
    createdAt: now,
    updatedAt: now,
  }
  users.write([...users.read(), user])
  createSession(user.id, true)
  return toPublic(user)
}

export async function signIn(input: {
  email: string
  password: string
  remember: boolean
}): Promise<PublicUser> {
  const email = input.email.trim().toLowerCase()
  const user = usersCollection()
    .read()
    .find((u) => u.email.toLowerCase() === email)
  // Small constant delay to blunt timing probes and feel like a network call.
  await new Promise((r) => setTimeout(r, 350))
  if (!user || !(await verifyPassword(input.password, user.passwordHash))) {
    throw new AuthError('Invalid email or password')
  }
  const elevated = grantAdminIfNeeded(user)
  createSession(elevated.id, input.remember)
  return toPublic(elevated)
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
}

export async function updateProfile(
  userId: string,
  patch: { name: string; email: string; phone: string; address: UserAddress },
): Promise<PublicUser> {
  const users = usersCollection()
  const email = patch.email.trim().toLowerCase()
  const clash = users
    .read()
    .find((u) => u.email.toLowerCase() === email && u.id !== userId)
  if (clash) throw new AuthError('Another account already uses this email')
  const updated = users.read().map((u) =>
    u.id === userId
      ? {
          ...u,
          name: patch.name.trim(),
          email,
          phone: patch.phone.trim(),
          address: patch.address,
          updatedAt: new Date().toISOString(),
          // role and passwordHash are intentionally not editable here
        }
      : u,
  )
  users.write(updated)
  const me = updated.find((u) => u.id === userId)
  if (!me) throw new AuthError('Account not found')
  return toPublic(me)
}

export async function requestPasswordReset(email: string): Promise<void> {
  // Demo stub: a real deployment sends a signed reset link via the backend.
  await new Promise((r) => setTimeout(r, 500))
  if (!email.trim()) throw new AuthError('Enter your email address')
}

export async function changePassword(
  userId: string,
  currentPw: string,
  newPw: string,
): Promise<void> {
  const users = usersCollection()
  const user = users.read().find((u) => u.id === userId)
  if (!user) throw new AuthError('Account not found')
  if (!(await verifyPassword(currentPw, user.passwordHash))) {
    throw new AuthError('Current password is incorrect')
  }
  const passwordHash = await hashPassword(newPw)
  users.write(
    users.read().map((u) =>
      u.id === userId ? { ...u, passwordHash, updatedAt: new Date().toISOString() } : u,
    ),
  )
}
