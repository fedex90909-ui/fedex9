import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { CheckCircle2, KeyRound, Loader2 } from 'lucide-react'
import { AuthShell, FormError } from '../../components/auth/AuthShell'
import { Field } from '../../components/Field'
import { useToast } from '../../context/ToastContext'
import { AuthError, requestPasswordReset } from '../../services/authService'

export default function ForgotPassword() {
  const toast = useToast()
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!email.trim()) {
      setError('Enter your email address')
      return
    }
    setError('')
    setSubmitting(true)
    try {
      await requestPasswordReset(email)
      setSent(true)
      toast.success('Reset link sent', 'Check your inbox for the reset instructions.')
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Could not send a reset link.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your account email and we'll send you a reset link."
      footer={
        <>
          Remembered it?{' '}
          <Link to="/signin" className="font-extrabold text-fx-purple-700 hover:text-fx-orange-600">
            Back to sign in
          </Link>
        </>
      }
    >
      {sent ? (
        <div className="animate-scale-in py-4 text-center">
          <CheckCircle2 size={44} className="mx-auto text-green-500" aria-hidden />
          <h2 className="mt-4 text-lg font-extrabold text-ink">Check your inbox</h2>
          <p className="mx-auto mt-2 max-w-xs text-sm text-gray-500">
            If an account exists for <span className="font-bold text-ink">{email}</span>, a
            password reset link is on its way.
          </p>
          <Link to="/signin" className="btn-primary mt-6">
            Back to sign in
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} noValidate className="space-y-5">
          {error && <FormError message={error} />}
          <Field
            label="Email"
            required
            type="email"
            name="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            error={error || undefined}
            onChange={(e) => {
              setEmail(e.target.value)
              setError('')
            }}
          />
          <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
            {submitting ? (
              <>
                <Loader2 size={18} className="animate-spin" aria-hidden /> Sending…
              </>
            ) : (
              <>
                <KeyRound size={16} aria-hidden /> Send reset link
              </>
            )}
          </button>
        </form>
      )}
    </AuthShell>
  )
}
