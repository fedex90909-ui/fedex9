import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  Radar,
  Settings,
  Users,
} from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'

const ITEMS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/shipments', label: 'Shipments', icon: Package, end: false },
  { to: '/admin/payments', label: 'Payments', icon: CreditCard, end: false },
  { to: '/admin/users', label: 'Users', icon: Users, end: false },
  { to: '/admin/tracking', label: 'Tracking', icon: Radar, end: false },
  { to: '/admin/settings', label: 'Settings', icon: Settings, end: false },
]

export default function AdminLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] bg-[#150a26] text-white">
      {/* Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-white/10 bg-fx-purple-900/60 p-5 lg:flex">
        <div>
          <Logo light />
          <p className="mt-1 text-[10px] font-extrabold uppercase tracking-[0.2em] text-fx-orange-400">
            Admin Panel
          </p>
        </div>
        <nav aria-label="Admin" className="mt-8 flex-1 space-y-1">
          {ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-fx-orange-500 text-white shadow-btn-orange'
                    : 'text-purple-200/75 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon size={17} aria-hidden /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="space-y-1 border-t border-white/10 pt-4">
          <Link
            to="/"
            className="flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-purple-200/75 transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft size={16} aria-hidden /> View site
          </Link>
          <button
            onClick={handleSignOut}
            className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-300 transition hover:bg-red-500/15"
          >
            <LogOut size={16} aria-hidden /> Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="min-w-0 flex-1">
        {/* Mobile admin nav */}
        <div className="border-b border-white/10 bg-fx-purple-900/60 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <Logo light />
            <button
              onClick={handleSignOut}
              className="rounded-full bg-white/10 p-2 text-red-300"
              aria-label="Sign out"
            >
              <LogOut size={16} />
            </button>
          </div>
          <nav aria-label="Admin mobile" className="mt-3 flex gap-1.5 overflow-x-auto pb-1">
            {ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'bg-fx-orange-500 text-white'
                      : 'bg-white/10 text-purple-100 hover:bg-white/20'
                  }`
                }
              >
                <item.icon size={13} aria-hidden /> {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="bg-cloud/95 min-h-full p-5 text-ink sm:p-8">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
