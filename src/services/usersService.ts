import type { PublicUser, UserRole, UserWithStats, UserRecord, UserAddress } from '../types/models'
import { requireAdmin } from './authService'
import { listAllShipments } from './shipmentsService'
import { listAllPayments } from './paymentsService'
import { supabase } from '../lib/supabase'

interface AccountRow {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  address: UserAddress
  created_at: string
}

function rowToPublicUser(row: AccountRow): PublicUser {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    address: row.address ?? { street: '', city: '', state: '', country: '', zip: '' },
    createdAt: row.created_at,
  }
}

export async function listUsers(): Promise<UserWithStats[]> {
  requireAdmin()
  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, email, phone, role, address, created_at')
    .order('created_at', { ascending: false })
  if (error) throw new Error('Could not load users')

  const users = (data as AccountRow[]).map(rowToPublicUser)
  const shipments = listAllShipments()
  const payments = listAllPayments()

  return users.map((u) => ({
    ...u,
    shipmentCount: shipments.filter((s) => s.userId === u.id).length,
    paymentCount: payments.filter((p) => p.userId === u.id).length,
  }))
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  requireAdmin()
  const { data, error } = await supabase
    .from('accounts')
    .select('id, name, email, phone, role, address, created_at')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return rowToPublicUser(data as AccountRow)
}

export async function countUsers(): Promise<number> {
  const { count, error } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
  if (error) return 0
  return count ?? 0
}

/** Role changes are admin-only and never allowed on your own account. */
export async function updateUserRole(userId: string, role: UserRole, adminId: string): Promise<void> {
  const admin = requireAdmin()
  if (userId === adminId || userId === admin.id) {
    throw new Error('You cannot change your own role')
  }
  const { error } = await supabase
    .from('accounts')
    .update({ role, updated_at: new Date().toISOString() })
    .eq('id', userId)
  if (error) throw new Error('Could not update role')
}
