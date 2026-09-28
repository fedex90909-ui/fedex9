import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { ArrowLeft, LayoutDashboard, LogOut, Package, UserRound } from 'lucide-react'
import Logo from '../components/Logo'
import { useAuth } from '../hooks/useAuth'

const ITEMS = [
  { to: '/account', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/account/shipments', label: 'My Shipments', icon: Package, end: false },
  { to: '/account/profile', label: 'Profile', icon: UserRound, end: false },
]

export default function AccountLayout() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  function handleSignOut() {
    signOut()
    navigate('/')
  }

  return (
    <div className="min-h-[calc(100vh-72px)] bg-cloud">
      <div className="container-x py-8 sm:py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          {/* Sidebar */}
          <aside className="space-y-4">
            <div className="card p-5">
              <Logo />
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="truncate text-sm font-extrabold text-ink">{user?.name}</p>
                <p className="truncate text-xs text-gray-500">{user?.email}</p>
              </div>
            </div>

            <nav aria-label="Account" className="card overflow-hidden p-2">
              <ul className="flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
                {ITEMS.map((item) => (
                  <li key={item.to} className="shrink-0 lg:shrink">
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        `flex items-center gap-2.5 whitespace-nowrap rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                          isActive
                            ? 'bg-fx-purple-600 text-white shadow-btn-purple'
                            : 'text-gray-600 hover:bg-fx-purple-50 hover:text-fx-purple-700'
                        }`
                      }
                    >
                      <item.icon size={16} aria-hidden /> {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>

            <div className="card space-y-2 p-2">
              <Link
                to="/"
                className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
              >
                <ArrowLeft size={16} aria-hidden /> Back to site
              </Link>
              <button
                onClick={handleSignOut}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
              >
                <LogOut size={16} aria-hidden /> Sign out
              </button>
            </div>
          </aside>

          {/* Content */}
          <section className="min-w-0">
            <Outlet />
          </section>
        </div>
      </div>
    </div>
  )
}
