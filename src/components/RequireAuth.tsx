import { useEffect } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { useAuth } from '../hooks/useAuth'
import { useToast } from '../context/ToastContext'

function BootingScreen() {
  return (
    <div className="grid min-h-[50vh] place-items-center text-fx-purple-600" role="status">
      <Loader2 className="animate-spin" size={32} aria-hidden />
      <span className="sr-only">Checking your session…</span>
    </div>
  )
}

function returnTo(pathname: string, search: string): string {
  const target = encodeURIComponent(pathname + search)
  return `/signin?returnTo=${target}`
}

/** Blocks unauthenticated access; remembers where the user was heading. */
export function RequireAuth() {
  const { user, booting } = useAuth()
  const location = useLocation()
  if (booting) return <BootingScreen />
  if (!user) return <Navigate to={returnTo(location.pathname, location.search)} replace />
  return <Outlet />
}

/** Admin-only area: verifies the session AND the role before rendering. */
export function RequireAdmin() {
  const { user, booting } = useAuth()
  const location = useLocation()
  const toast = useToast()

  const denied = !booting && user && user.role !== 'admin'
  useEffect(() => {
    if (denied) {
      toast.error('Admin access required', 'Your account does not have permission to view that page.')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [denied])

  if (booting) return <BootingScreen />
  if (!user) return <Navigate to={returnTo(location.pathname, location.search)} replace />
  if (user.role !== 'admin') return <Navigate to="/account" replace />
  return <Outlet />
}
