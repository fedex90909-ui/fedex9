import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { ArrowRight, Lock, Menu, ShieldCheck, X } from 'lucide-react'
import Logo from './Logo'
import UserMenu from './UserMenu'
import { useAuth } from '../hooks/useAuth'

const BASE_ITEMS = [
  { to: '/', label: 'Home' },
  { to: '/ship', label: 'Ship' },
  { to: '/track', label: 'Track' },
  { to: '/services', label: 'Services' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, isAdmin } = useAuth()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const navItems = [
    ...BASE_ITEMS,
    ...(user ? [{ to: '/account/shipments', label: 'My Shipments' }, { to: '/account', label: 'Account' }] : []),
    ...(user && isAdmin ? [{ to: '/admin', label: 'Admin Panel' }] : []),
  ]

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `nav-link after:absolute after:-bottom-1.5 after:left-0 after:h-0.5 after:rounded-full after:bg-fx-orange-500 after:transition-all after:duration-200 ${
      isActive ? 'nav-link-active after:w-full' : 'after:w-0 hover:after:w-full'
    }`

  const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
    `rounded-xl px-4 py-3 text-[15px] font-semibold transition-colors ${
      isActive ? 'bg-fx-purple-50 text-fx-purple-700' : 'text-gray-700 hover:bg-gray-50'
    }`

  return (
    <header
      className={`sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md transition-shadow duration-300 ${
        scrolled ? 'border-gray-200 shadow-card' : 'border-transparent'
      }`}
    >
      <div className="container-x flex h-[72px] items-center justify-between gap-4">
        <Link to="/" aria-label="FedEx home" className="shrink-0">
          <Logo />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-6 xl:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-2 lg:flex">
          {user ? (
            <UserMenu />
          ) : (
            <Link to="/signin" className="btn-ghost">
              <Lock size={15} aria-hidden /> Sign In
            </Link>
          )}
          <Link to="/ship" className="btn-primary">
            Ship Now <ArrowRight size={16} aria-hidden />
          </Link>
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {!user && (
            <Link to="/signin" className="btn-ghost" aria-label="Sign in">
              <Lock size={16} aria-hidden />
            </Link>
          )}
          <button
            className="rounded-full p-2.5 text-gray-700 transition hover:bg-gray-100"
            onClick={() => setMenuOpen((v) => !v)}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile panel */}
      <div
        id="mobile-nav"
        className={`overflow-hidden border-t border-gray-100 bg-white transition-all duration-300 lg:hidden ${
          menuOpen ? 'max-h-[720px] opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <nav aria-label="Mobile" className="container-x flex flex-col gap-1 py-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={mobileLinkClass}>
              {item.label}
            </NavLink>
          ))}
          {user && isAdmin && (
            <NavLink to="/admin" className={mobileLinkClass}>
              <ShieldCheck size={16} className="mr-2 inline text-fx-orange-500" aria-hidden />
              Admin Panel
            </NavLink>
          )}
          <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-4">
            {user ? (
              <>
                <div className="rounded-xl bg-gray-50 px-4 py-3">
                  <p className="text-sm font-extrabold text-ink">{user.name}</p>
                  <p className="truncate text-xs text-gray-500">{user.email}</p>
                </div>
                <Link to="/account" className="btn-outline w-full">
                  My account
                </Link>
              </>
            ) : (
              <Link to="/signin" className="btn-outline w-full">
                <Lock size={15} aria-hidden /> Sign In
              </Link>
            )}
            <Link to="/ship" className="btn-primary w-full">
              Ship Now <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </nav>
      </div>
    </header>
  )
}
