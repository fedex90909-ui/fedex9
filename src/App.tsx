import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { BookingProvider } from './context/BookingContext'
import { ToastProvider } from './context/ToastContext'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireAdmin } from './components/RequireAuth'
import Header from './components/Header'
import Footer from './components/Footer'
import Home from './pages/Home'
import Ship from './pages/Ship'
import Track from './pages/Track'
import Services from './pages/Services'
import About from './pages/About'
import Contact from './pages/Contact'
import Payment from './pages/Payment'
import Confirmation from './pages/Confirmation'
import NotFound from './pages/NotFound'
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'
import ForgotPassword from './pages/auth/ForgotPassword'
import AccountLayout from './layouts/AccountLayout'
import AccountDashboard from './pages/account/AccountDashboard'
import MyShipments from './pages/account/MyShipments'
import Profile from './pages/account/Profile'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminShipments from './pages/admin/AdminShipments'
import AdminShipmentDetail from './pages/admin/AdminShipmentDetail'
import AdminPayments from './pages/admin/AdminPayments'
import AdminUsers from './pages/admin/AdminUsers'
import AdminTracking from './pages/admin/AdminTracking'
import AdminSettings from './pages/admin/AdminSettings'

function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      requestAnimationFrame(() => {
        const el = document.querySelector(hash)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
          return
        }
        window.scrollTo({ top: 0 })
      })
    } else {
      window.scrollTo({ top: 0 })
    }
  }, [pathname, hash])
  return null
}

function AnimatedRoutes() {
  const location = useLocation()
  // Admin has its own full-height layout; skip the page animation wrapper there.
  const isAdmin = location.pathname.startsWith('/admin')
  return (
    <main
      key={isAdmin ? 'admin' : location.pathname}
      className={`min-h-[60vh] ${isAdmin ? '' : 'animate-page-in'}`}
    >
      <Routes location={location}>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/ship" element={<Ship />} />
        <Route path="/track" element={<Track />} />
        <Route path="/track/:number" element={<Track />} />
        <Route path="/services" element={<Services />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />

        {/* Auth */}
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Authenticated customer */}
        <Route element={<RequireAuth />}>
          <Route path="/payment" element={<Payment />} />
          <Route path="/confirmation/:id" element={<Confirmation />} />
          <Route path="/account" element={<AccountLayout />}>
            <Route index element={<AccountDashboard />} />
            <Route path="shipments" element={<MyShipments />} />
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>

        {/* Admin (role-verified) */}
        <Route element={<RequireAdmin />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="shipments" element={<AdminShipments />} />
            <Route path="shipments/:id" element={<AdminShipmentDetail />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="tracking" element={<AdminTracking />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>
        </Route>

        <Route path="/login" element={<Navigate to="/signin" replace />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <BookingProvider>
            <ScrollManager />
            <div className="flex min-h-screen flex-col">
              <Header />
              <AnimatedRoutes />
              <Footer />
            </div>
          </BookingProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
