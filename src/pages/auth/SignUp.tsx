import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, Loader2, UserRoundPlus } from 'lucide-react'
import { AuthShell, FormError } from '../../components/auth/AuthShell'
import { Field } from '../../components/Field'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { AuthError } from '../../services/authService'
import { hasErrors, validateSignUp } from '../../lib/validation'
import type { SignUpInput, FieldErrors } from '../../lib/validation'

export default function SignUp() {
  const { signUp } = useAuth()
  const toast = useToast()
  const navigate = useNavigate()

  const [form, setForm] = useState<SignUpInput>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirm: '',
  })
  const [errors, setErrors] = useState<FieldErrors<SignUpInput>>({})
  const [formError, setFormError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function set<K extends keyof SignUpInput>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const v = validateSignUp(form)
    if (hasErrors(v)) {
      setErrors(v)
      return
    }
    setErrors({})
    setFormError('')
    setSubmitting(true)
    try {
      const user = await signUp({
        name: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
      })
      toast.success('Account created', `Welcome to FedEx, ${user.name.split(' ')[0]}!`)
      navigate('/account', { replace: true })
    } catch (err) {
      setFormError(err instanceof AuthError ? err.message : 'Could not create your account. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Create your account"
      subtitle="Ship, track and manage everything from one dashboard."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/signin" className="font-extrabold text-fx-purple-700 hover:text-fx-orange-600">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {formError && <FormError message={formError} />}

        <Field
          label="Full name"
          required
          name="name"
          autoComplete="name"
          placeholder="Jordan Miles"
          value={form.name}
          error={errors.name}
          onChange={(e) => set('name', e.target.value)}
        />
        <Field
          label="Email"
          required
          type="email"
          name="email"
          autoComplete="email"
          placeholder="you@company.com"
          value={form.email}
          error={errors.email}
          onChange={(e) => set('email', e.target.value)}
        />
        <Field
          label="Phone number"
          required
          type="tel"
          name="phone"
          autoComplete="tel"
          placeholder="+1 555 000 1234"
          value={form.phone}
          error={errors.phone}
          onChange={(e) => set('phone', e.target.value)}
        />
        <Field
          label="Password"
          required
          type="password"
          name="password"
          autoComplete="new-password"
          placeholder="Minimum 8 characters"
          hint="At least 8 characters with an uppercase letter, a lowercase letter and a number."
          value={form.password}
          error={errors.password}
          onChange={(e) => set('password', e.target.value)}
        />
        <Field
          label="Confirm password"
          required
          type="password"
          name="confirm"
          autoComplete="new-password"
          placeholder="Repeat your password"
          value={form.confirm}
          error={errors.confirm}
          onChange={(e) => set('confirm', e.target.value)}
        />

        <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
          {submitting ? (
            <>
              <Loader2 size={18} className="animate-spin" aria-hidden /> Creating account…
            </>
          ) : (
            <>
              <UserRoundPlus size={16} aria-hidden /> Create account <ArrowRight size={15} aria-hidden />
            </>
          )}
        </button>
      </form>
    </AuthShell>
  )
}
