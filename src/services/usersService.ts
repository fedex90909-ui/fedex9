import type { PublicUser, UserRole, UserWithStats } from '../types/models'
import { supabase } from '../lib/supabaseClient'
import { requireAdmin } from './authService'

interface DbAccount {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  address: Record<string, unknown>
  created_at: string
  updated_at: string
}

function dbToPublic(r: DbAccount): PublicUser {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    phone: r.phone,
    role: r.role,
    address: r.address as unknown as PublicUser['address'],
    createdAt: r.created_at,
  }
}

export async function listUsers(): Promise<UserWithStats[]> {
  requireAdmin()
  const { data: users, error } = await supabase
    .from('accounts')
    .select('*')
    .order('created_at', { ascending: false })
  if (error || !users) return []

  const { data: shipments } = await supabase
    .from('shipments')
    .select('user_id')
  const { data: payments } = await supabase
    .from('payments')
    .select('user_id')

  const shipCounts = new Map<string, number>()
  for (const s of (shipments ?? []) as { user_id: string | null }[]) {
    if (s.user_id) shipCounts.set(s.user_id, (shipCounts.get(s.user_id) ?? 0) + 1)
  }
  const payCounts = new Map<string, number>()
  for (const p of (payments ?? []) as { user_id: string | null }[]) {
    if (p.user_id) payCounts.set(p.user_id, (payCounts.get(p.user_id) ?? 0) + 1)
  }

  return (users as DbAccount[]).map((u) => ({
    ...dbToPublic(u),
    shipmentCount: shipCounts.get(u.id) ?? 0,
    paymentCount: payCounts.get(u.id) ?? 0,
  }))
}

export async function getUserById(id: string): Promise<PublicUser | null> {
  requireAdmin()
  const { data, error } = await supabase
    .from('accounts')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error || !data) return null
  return dbToPublic(data as DbAccount)
}

export async function countUsers(): Promise<number> {
  const { count, error } = await supabase
    .from('accounts')
    .select('*', { count: 'exact', head: true })
  if (error) return 0
  return count ?? 0
}

export async function updateUserRole(userId: string, role: UserRole, adminId: string): Promise<void> {
  const admin = requireAdmin()
  if (userId === adminId || userId === admin.id) {
    throw new Error('You cannot change your own role')
  }
  const now = new Date().toISOString()
  const { error } = await supabase
    .from('accounts')
    .update({ role, updated_at: now })
    .eq('id', userId)
  if (error) throw new Error('Could not update user role')
}
