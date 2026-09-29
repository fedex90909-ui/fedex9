import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Search, ShieldCheck, UserRound } from 'lucide-react'
import Modal from '../../components/Modal'
import { useToast } from '../../context/ToastContext'
import { listUsers, updateUserRole } from '../../services/usersService'
import { listAllShipments } from '../../services/shipmentsService'
import { listAllPayments } from '../../services/paymentsService'
import { useAuth } from '../../hooks/useAuth'
import { currency, formatDate } from '../../lib/format'
import type { PaymentRecord, ShipmentRecord, UserWithStats } from '../../types/models'

export default function AdminUsers() {
  const [tick, setTick] = useState(0)
  const [users, setUsers] = useState<UserWithStats[]>([])
  const { user: me } = useAuth()
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [managing, setManaging] = useState<UserWithStats | null>(null)
  const [pendingRole, setPendingRole] = useState<'user' | 'admin' | null>(null)

  const shipments = useMemo(() => listAllShipments(), [tick])
  const payments = useMemo(() => listAllPayments(), [tick])

  useEffect(() => {
    listUsers()
      .then(setUsers)
      .catch((err) => {
        console.error('Failed to load users:', err)
        toast.error('Could not load users', err instanceof Error ? err.message : 'Try refreshing the page.')
      })
  }, [tick])

  const filtered = users.filter((u) => {
    const q = query.trim().toLowerCase()
    if (!q) return true
    return [u.name, u.email, u.phone].join(' ').toLowerCase().includes(q)
  })

  async function applyRoleChange() {
    if (!managing || !pendingRole) return
    try {
      await updateUserRole(managing.id, pendingRole, me?.id ?? '')
      toast.success('Role updated', `${managing.name} is now ${pendingRole === 'admin' ? 'an administrator' : 'a user'}.`)
      setPendingRole(null)
      setManaging(null)
      setTick((t) => t + 1)
    } catch (err) {
      toast.error('Could not change role', err instanceof Error ? err.message : 'Try again.')
      setPendingRole(null)
    }
  }

  const userShipments: ShipmentRecord[] = managing
    ? shipments.filter((s) => s.userId === managing.id)
    : []
  const userPayments: PaymentRecord[] = managing
    ? payments.filter((p) => p.userId === managing.id)
    : []

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Admin · Users</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          User management
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          {users.length} registered account{users.length === 1 ? '' : 's'}.
        </p>
      </header>

      <div className="card p-4">
        <div className="relative">
          <Search size={15} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email or phone…"
            aria-label="Search users"
            className="input pl-9"
          />
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[820px] text-left text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50/70 text-[11px] uppercase tracking-wider text-gray-400">
              <th className="px-5 py-3 font-extrabold">Name</th>
              <th className="px-5 py-3 font-extrabold">Email</th>
              <th className="px-5 py-3 font-extrabold">Phone</th>
              <th className="px-5 py-3 font-extrabold">Role</th>
              <th className="px-5 py-3 font-extrabold">Shipments</th>
              <th className="px-5 py-3 font-extrabold">Joined</th>
              <th className="px-5 py-3 font-extrabold">Manage</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map((u) => (
              <tr key={u.id} className="transition hover:bg-fx-purple-50/40">
                <td className="px-5 py-4 font-bold text-ink">{u.name}</td>
                <td className="px-5 py-4 text-gray-600">{u.email}</td>
                <td className="px-5 py-4 text-gray-600">{u.phone}</td>
                <td className="px-5 py-4">
                  <span
                    className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wide ring-1 ring-inset ${
                      u.role === 'admin'
                        ? 'bg-fx-orange-50 text-fx-orange-700 ring-fx-orange-200'
                        : 'bg-fx-purple-50 text-fx-purple-700 ring-fx-purple-200'
                    }`}
                  >
                    {u.role}
                  </span>
                </td>
                <td className="px-5 py-4 font-bold text-ink">{u.shipmentCount}</td>
                <td className="px-5 py-4 text-gray-500">{formatDate(u.createdAt)}</td>
                <td className="px-5 py-4">
                  <button onClick={() => setManaging(u)} className="btn-outline !px-4 !py-1.5 text-xs">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} className="px-5 py-12 text-center text-sm text-gray-400">
                  No users match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manage modal */}
      <Modal open={Boolean(managing)} onClose={() => setManaging(null)} title="Manage user">
        {managing && (
          <div className="space-y-5">
            <div className="flex items-center gap-3 rounded-xl bg-fx-purple-50/70 p-4 ring-1 ring-inset ring-fx-purple-200/50">
              <span className="grid h-11 w-11 place-items-center rounded-full bg-fx-purple-600 text-sm font-black text-white">
                {managing.name.split(' ').map((p) => p[0]).slice(0, 2).join('')}
              </span>
              <div className="min-w-0">
                <p className="truncate font-extrabold text-ink">{managing.name}</p>
                <p className="truncate text-xs text-gray-500">{managing.email} · {managing.phone}</p>
                <p className="text-xs text-gray-400">Joined {formatDate(managing.createdAt)}</p>
              </div>
            </div>

            {/* Role change with confirmation */}
            <div>
              <p className="label">Role</p>
              <select
                value={managing.role}
                disabled={managing.id === me?.id}
                onChange={(e) => {
                  const next = e.target.value as 'user' | 'admin'
                  if (next !== managing.role) setPendingRole(next)
                }}
                className="input"
                aria-label="Change role"
              >
                <option value="user">user</option>
                <option value="admin">admin</option>
              </select>
              {managing.id === me?.id ? (
                <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-gray-400">
                  <UserRound size={13} aria-hidden /> You cannot change your own role.
                </p>
              ) : (
                <p className="mt-2 text-xs text-gray-400">
                  Selecting a different role requires confirmation.
                </p>
              )}
            </div>

            {/* Shipments */}
            <div>
              <p className="label">Shipments ({userShipments.length})</p>
              {userShipments.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
                  No shipments booked on this account.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl ring-1 ring-gray-200/70">
                  {userShipments.map((s) => (
                    <li key={s.id}>
                      <Link
                        to={`/admin/shipments/${s.id}`}
                        onClick={() => setManaging(null)}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm transition hover:bg-gray-50"
                      >
                        <span className="font-mono text-xs font-bold text-fx-purple-700">
                          {s.trackingNumber}
                        </span>
                        <span className="text-xs text-gray-500">
                          {s.sender.city} → {s.recipient.city} · {currency(s.price)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Payments */}
            <div>
              <p className="label">Payments ({userPayments.length})</p>
              {userPayments.length === 0 ? (
                <p className="rounded-xl bg-gray-50 px-4 py-3 text-xs text-gray-400">
                  No payment records for this account.
                </p>
              ) : (
                <ul className="divide-y divide-gray-100 rounded-xl ring-1 ring-gray-200/70">
                  {userPayments.map((p) => (
                    <li key={p.id} className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm">
                      <span className="font-mono text-xs text-gray-500">{p.reference}</span>
                      <span className="text-xs font-bold text-ink">
                        {currency(p.amount)} · <span className="capitalize">{p.status}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <button onClick={() => setManaging(null)} className="btn-outline w-full">
              Close
            </button>
          </div>
        )}
      </Modal>

      {/* Role confirmation modal */}
      <Modal
        open={Boolean(pendingRole) && Boolean(managing)}
        onClose={() => setPendingRole(null)}
        title="Confirm role change"
      >
        {managing && pendingRole && (
          <>
            <p className="text-sm leading-relaxed text-gray-600">
              Change <span className="font-extrabold text-ink">{managing.name}</span>
              &apos;s role from <span className="font-mono font-bold">{managing.role}</span> to{' '}
              <span className="font-mono font-bold text-fx-orange-600">{pendingRole}</span>?
              {pendingRole === 'admin' && ' They will gain full access to the Admin Panel.'}
            </p>
            <div className="mt-5 flex gap-2">
              <button onClick={() => setPendingRole(null)} className="btn-outline flex-1">
                Keep current role
              </button>
              <button onClick={applyRoleChange} className="btn-purple flex-1">
                <ShieldCheck size={15} aria-hidden /> Confirm change
              </button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
