import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Banknote, Database, KeyRound, RotateCcw } from 'lucide-react'
import Modal from '../../components/Modal'
import { useState } from 'react'
import { useToast } from '../../context/ToastContext'
import { resetAllData } from '../../services/db'
import { BANK } from '../../lib/constants'
import { ADMIN_EMAILS } from '../../lib/config'
import { useAuth } from '../../hooks/useAuth'

export default function AdminSettings() {
  const [confirmReset, setConfirmReset] = useState(false)
  const toast = useToast()
  const navigate = useNavigate()
  const { signOut } = useAuth()

  function doReset() {
    resetAllData()
    signOut()
    toast.info('Data reset', 'All shipments, payments and accounts were cleared.')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Admin · Settings</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Platform settings
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Configuration, integrations and data tools.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <KeyRound size={17} className="text-fx-purple-600" aria-hidden /> Administration
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex items-baseline justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
              <dt className="font-semibold text-gray-500">Admin email(s)</dt>
              <dd className="truncate font-mono text-xs font-bold text-ink">
                {ADMIN_EMAILS.join(', ')}
              </dd>
            </div>
            <p className="px-1 text-xs leading-relaxed text-gray-400">
              Set <code className="rounded bg-gray-100 px-1">VITE_ADMIN_EMAIL</code> in your
              environment (or Netlify → Environment variables) to grant the admin role to a
              specific address at registration or sign-in. Additional admins can be promoted
              from Users → Manage → Role.
            </p>
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Banknote size={17} className="text-fx-purple-600" aria-hidden /> Bank transfer details
          </h2>
          <dl className="mt-4 space-y-2 text-sm">
            {[
              ['Bank name', BANK.name],
              ['Account name', BANK.accountName],
              ['Account number', BANK.accountNumber],
              ['SWIFT / BIC', BANK.swift],
            ].map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-3 rounded-xl bg-gray-50 px-4 py-3">
                <dt className="font-semibold text-gray-500">{k}</dt>
                <dd className={`font-bold text-ink ${k === 'Account number' ? 'font-mono' : ''}`}>{v}</dd>
              </div>
            ))}
            <p className="px-1 text-xs leading-relaxed text-gray-400">
              Shown to customers on the Bank Transfer checkout option. Card processing is
              handled by the payments service
              <code className="mx-1 rounded bg-gray-100 px-1">src/services/paymentsService.ts</code>.
            </p>
          </dl>
        </div>

        <div className="card p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-ink">
            <Database size={17} className="text-fx-purple-600" aria-hidden /> Data store
          </h2>
            <p className="mt-3 text-sm leading-relaxed text-gray-600">
              Users, shipments, tracking events and payments persist in browser
              localStorage via <code className="rounded bg-gray-100 px-1">src/services/</code>.
              Every service call verifies the session and role before touching data, mirroring
              the server-side checks a production backend performs.
            </p>
          <ul className="mt-4 space-y-1.5 text-sm text-gray-600">
            <li>• Swap-in point for a real database: the service layer.</li>
            <li>• Netlify Functions scaffold lives in <code className="rounded bg-gray-100 px-1">netlify/functions/</code>.</li>
            <li>• Secrets belong in environment variables — never in the repo.</li>
          </ul>
        </div>

        <div className="card border-red-200/70 p-6">
          <h2 className="flex items-center gap-2 text-base font-extrabold text-red-700">
            <AlertTriangle size={17} aria-hidden /> Danger zone
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-600">
            Reset clears every user, shipment, tracking event and payment from this browser
            (including your own account) and signs you out. Sample shipments are re-seeded on
            next load.
          </p>
          <button
            onClick={() => setConfirmReset(true)}
            className="mt-4 inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-2.5 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            <RotateCcw size={15} aria-hidden /> Reset all data
          </button>
        </div>
      </div>

      <Modal open={confirmReset} onClose={() => setConfirmReset(false)} title="Reset all data?">
        <p className="text-sm leading-relaxed text-gray-600">
          Every account (including yours), shipment and payment record will be permanently
          removed from this browser and you will be signed out. This is intended for cleaning
          up test data before sharing screenshots or packaging the project.
        </p>
        <div className="mt-5 flex gap-2">
          <button onClick={() => setConfirmReset(false)} className="btn-outline flex-1">
            Keep my data
          </button>
          <button
            onClick={doReset}
            className="flex-1 rounded-full bg-red-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-red-700"
          >
            Reset everything
          </button>
        </div>
      </Modal>
    </div>
  )
}
