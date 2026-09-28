import { useState } from 'react'
import type { FormEvent } from 'react'
import { Loader2, Save, ShieldCheck } from 'lucide-react'
import { Field, SelectField } from '../../components/Field'
import { useAuth } from '../../hooks/useAuth'
import { useToast } from '../../context/ToastContext'
import { AuthError } from '../../services/authService'
import { COUNTRIES } from '../../lib/content'
import { hasErrors, validateProfile } from '../../lib/validation'
import type { FieldErrors, ProfileInput } from '../../lib/validation'

export default function Profile() {
  const { user, updateProfile } = useAuth()
  const toast = useToast()
  const [errors, setErrors] = useState<FieldErrors<ProfileInput>>({})
  const [saving, setSaving] = useState(false)

  const [form, setForm] = useState<ProfileInput>({
    name: user?.name ?? '',
    email: user?.email ?? '',
    phone: user?.phone ?? '',
    street: user?.address.street ?? '',
    city: user?.address.city ?? '',
    state: user?.address.state ?? '',
    country: user?.address.country ?? '',
    zip: user?.address.zip ?? '',
  })

  function set<K extends keyof ProfileInput>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    const v = validateProfile(form)
    if (hasErrors(v)) {
      setErrors(v)
      return
    }
    setErrors({})
    setSaving(true)
    try {
      await updateProfile({
        name: form.name,
        email: form.email,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          country: form.country,
          zip: form.zip,
        },
      })
      toast.success('Profile updated', 'Your account details have been saved.')
    } catch (err) {
      toast.error(
        'Could not save profile',
        err instanceof AuthError ? err.message : 'Please try again.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <p className="kicker">Profile</p>
        <h1 className="mt-2 text-2xl font-black tracking-tight text-ink sm:text-3xl">
          Account &amp; profile
        </h1>
        <p className="mt-1.5 text-sm text-gray-600">
          Update your contact and pickup address details.
        </p>
      </header>

      {/* Role is display-only */}
      <div className="card flex flex-wrap items-center justify-between gap-3 p-5">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-fx-purple-50 text-fx-purple-600">
            <ShieldCheck size={19} aria-hidden />
          </span>
          <div>
            <p className="text-sm font-extrabold text-ink">Role</p>
            <p className="text-xs text-gray-500">Roles are managed by FedEx administrators.</p>
          </div>
        </div>
        <span
          className={`rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider ring-1 ring-inset ${
            user?.role === 'admin'
              ? 'bg-fx-orange-50 text-fx-orange-700 ring-fx-orange-200'
              : 'bg-fx-purple-50 text-fx-purple-700 ring-fx-purple-200'
          }`}
        >
          {user?.role === 'admin' ? 'Administrator' : 'User'}
        </span>
      </div>

      <form onSubmit={submit} noValidate className="card space-y-5 p-6 sm:p-8">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Full name"
            required
            name="profile-name"
            value={form.name}
            error={errors.name}
            onChange={(e) => set('name', e.target.value)}
          />
          <Field
            label="Email"
            required
            type="email"
            name="profile-email"
            value={form.email}
            error={errors.email}
            onChange={(e) => set('email', e.target.value)}
          />
          <Field
            label="Phone"
            required
            type="tel"
            name="profile-phone"
            value={form.phone}
            error={errors.phone}
            onChange={(e) => set('phone', e.target.value)}
          />
          <div className="hidden sm:block" />
          <div className="sm:col-span-2">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-gray-400">
              Default pickup address
            </h2>
          </div>
          <div className="sm:col-span-2">
            <Field
              label="Street address"
              required
              name="profile-street"
              value={form.street}
              error={errors.street}
              onChange={(e) => set('street', e.target.value)}
            />
          </div>
          <Field
            label="City"
            required
            name="profile-city"
            value={form.city}
            error={errors.city}
            onChange={(e) => set('city', e.target.value)}
          />
          <Field
            label="State / Province"
            name="profile-state"
            value={form.state}
            error={errors.state}
            onChange={(e) => set('state', e.target.value)}
          />
          <SelectField
            label="Country"
            required
            name="profile-country"
            value={form.country}
            error={errors.country}
            onChange={(e) => set('country', e.target.value)}
          >
            <option value="">Select country…</option>
            {COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </SelectField>
          <Field
            label="ZIP / Postal code"
            name="profile-zip"
            value={form.zip}
            error={errors.zip}
            onChange={(e) => set('zip', e.target.value)}
          />
        </div>

        <div className="flex justify-end border-t border-gray-100 pt-5">
          <button type="submit" disabled={saving} className="btn-primary">
            {saving ? (
              <>
                <Loader2 size={16} className="animate-spin" aria-hidden /> Saving…
              </>
            ) : (
              <>
                <Save size={16} aria-hidden /> Save changes
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}
