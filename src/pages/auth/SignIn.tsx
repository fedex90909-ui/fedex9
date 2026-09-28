import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Eye, EyeOff, Loader2, Lock } from 'lucide-react'
import { AuthShell, FormError } from '../../components/auth/AuthShell'
import { Field } from '../../components/Field'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { AuthError } from '../../services/authService'
import { hasErrors, validateSignIn } from '../../lib/validation'
import type { SignInInput, FieldErrors } from '../../lib/validation'

export default function SignIn() {
  const { signIn } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const returnTo = params.get('returnTo') || '/account'

  const [form, setForm] = useState<SignInInput>({ email: '', password: '' })
  const [errors, setErrors] = useState<FieldErrors<SignInInput>>({})
  const [formError, setFormError] = useState('')
  const [remember, setRemember] = useState(true)
  const [showPw, setShowPw] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    const v = validateSignIn(form)
    if (hasErrors(v)) {
      setErrors(v)
      return
    }
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      const user = await signIn(form.email, form.password, remember)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`, 'You are signed in.')
      navigate(returnTo, { replace: true })
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : 'Could not sign in. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Sign in to FedEx"
      subtitle="Access your shipments, payments and account settings."
      footer={
        <>
          New to FedEx?{' '}
          <Link to="/signup" className="font-extrabold text-fx-purple-700 hover:text-fx-orange-600">
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {formError && <FormError message={formError} />}

        <Field
          label="Email"
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          error={errors.email}
          onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
        />

        <div className="relative">
          <Field
            label="Password"
            required
            type={showPw ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={form.password}
            error={errors.password}
            onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            aria-label={showPw ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-[34px] text-gray-400 transition hover:text-gray-600"
          >
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>

        <div className="flex items-center justify-between">
          <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-600">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 accent-fx-purple-600"
            />
            Remember me
          </label>
          <Link
            to="/forgot-password"
            className="text-sm font-bold text-fx-purple-700 hover:text-fx-orange-600"
          >
            Forgot password?
          </Link>
        </div>

        <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Signing in…
            </>
          ) : (
            <>
              <Lock size={16} aria-hidden /> Sign in
            </>
          )}
        </button>
      </form>
    </AuthShell>
  )
}
