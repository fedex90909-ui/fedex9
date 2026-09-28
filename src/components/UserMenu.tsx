import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronDown, LayoutDashboard, LogOut, Package, ShieldCheck, UserRound } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join('')
}

export default function UserMenu() {
  const { user, isAdmin, signOut } = useAuth()
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  if (!user) return null

  function handleSignOut() {
    setOpen(false)
    signOut()
    navigate('/')
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-1.5 pr-3 text-sm font-bold text-gray-700 shadow-sm transition hover:border-fx-purple-300 hover:text-fx-purple-700"
      >
        <span
          className="grid h-8 w-8 place-items-center rounded-full bg-fx-purple-600 text-xs font-black text-white"
          aria-hidden
        >
          {initials(user.name)}
        </span>
        <span className="hidden max-w-[120px] truncate sm:block">{user.name.split(' ')[0]}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`}
          aria-hidden
        />
      </button>

      {open && (
        <div
          role="menu"
          className="animate-scale-in absolute right-0 top-[calc(100%+10px)] z-50 w-64 overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-lift"
        >
          <div className="border-b border-gray-100 bg-gray-50/70 px-4 py-3.5">
            <p className="truncate text-sm font-extrabold text-ink">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
            <span
              className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${
                isAdmin ? 'bg-fx-orange-100 text-fx-orange-700' : 'bg-fx-purple-100 text-fx-purple-700'
              }`}
            >
              {isAdmin ? 'Administrator' : 'User'}
            </span>
          </div>
          <div className="p-1.5">
            <MenuLink to="/account" icon={LayoutDashboard} onClick={() => setOpen(false)}>
              Dashboard
            </MenuLink>
            <MenuLink to="/account/shipments" icon={Package} onClick={() => setOpen(false)}>
              My Shipments
            </MenuLink>
            <MenuLink to="/account/profile" icon={UserRound} onClick={() => setOpen(false)}>
              Profile
            </MenuLink>
            {isAdmin && (
              <MenuLink to="/admin" icon={ShieldCheck} onClick={() => setOpen(false)}>
                Admin Panel
              </MenuLink>
            )}
            <button
              onClick={handleSignOut}
              role="menuitem"
              className="mt-1 flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 transition hover:bg-red-50"
            >
              <LogOut size={16} aria-hidden /> Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function MenuLink({
  to,
  icon: Icon,
  children,
  onClick,
}: {
  to: string
  icon: typeof Package
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <Link
      to={to}
      role="menuitem"
      onClick={onClick}
      className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-fx-purple-50 hover:text-fx-purple-700"
    >
      <Icon size={16} className="text-fx-purple-500" aria-hidden /> {children}
    </Link>
  )
}
