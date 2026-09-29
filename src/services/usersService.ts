import type { PublicUser, UserRole, UserWithStats } from '../types/models'
import { KEYS, readCollection } from './db'
import { requireAdmin } from './authService'
import { listAllShipments } from './shipmentsService'
import { listAllPayments } from './paymentsService'

export function listUsers(): UserWithStats[] {
  requireAdmin()
  const users = readCollection<import('../types/models').UserRecord>(KEYS.users)
  const shipments = listAllShipments()
  const payments = listAllPayments()
  return users
    .map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      address: u.address,
      createdAt: u.createdAt,
      shipmentCount: shipments.filter((s) => s.userId === u.id).length,
      paymentCount: payments.filter((p) => p.userId === u.id).length,
    }))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function getUserById(id: string): PublicUser | null {
  requireAdmin()
  const u = readCollection<import('../types/models').UserRecord>(KEYS.users).find(
    (x) => x.id === id,
  )
  if (!u) return null
  const { passwordHash: _ph, ...rest } = u
  return rest
}

export function countUsers(): number {
  return readCollection<import('../types/models').UserRecord>(KEYS.users).length
}

/** Role changes are admin-only and never allowed on your own account. */
export function updateUserRole(userId: string, role: UserRole, adminId: string): void {
  const admin = requireAdmin()
  if (userId === adminId || userId === admin.id) {
    throw new Error('You cannot change your own role')
  }
  // Lazy import avoided: users collection handled directly here.
  const usersRaw = localStorage.getItem(KEYS.users)
  const users: import('../types/models').UserRecord[] = usersRaw ? JSON.parse(usersRaw) : []
  const target = users.find((u) => u.id === userId)
  if (!target) throw new Error('User not found')
  const updated = users.map((u) =>
    u.id === userId ? { ...u, role, updatedAt: new Date().toISOString() } : u,
  )
  localStorage.setItem(KEYS.users, JSON.stringify(updated))
}
