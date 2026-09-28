import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  CreditCard,
  Package as PackageIcon,
  Truck,
  User,
} from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { useToast } from '../context/ToastContext'
import { Field, SelectField } from '../components/Field'
import StepProgress from '../components/StepProgress'
import DeliveryOptionCard from '../components/DeliveryOptionCard'
import Reveal from '../components/Reveal'
import { COUNTRIES, PACKAGE_TYPES } from '../lib/content'
import { getDeliveryOption, getDeliveryOptions, estimateDeliveryFor } from '../lib/pricing'
import { hasErrors, validateAddress, validatePackage } from '../lib/validation'
import type { FieldErrors } from '../lib/validation'
import type { Address, PackageInfo } from '../lib/types'
import { currency, formatDate, formatTime } from '../lib/format'

const STEPS = ['Sender', 'Recipient', 'Package', 'Delivery']

export default function Ship() {
  const { draft, setSender, setRecipient, setPackage, setOptionId } = useBooking()
  const toast = useToast()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [step, setStep] = useState(1)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Deep-link: /ship?service=overnight preselects a delivery speed for step 4.
  useEffect(() => {
    const s = searchParams.get('service')
    if (s && getDeliveryOption(s)) {
      setOptionId(s)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function validateStep(n: number): boolean {
    let e: Record<string, string> = {}
    if (n === 1) e = validateAddress(draft.sender)
    if (n === 2) e = validateAddress(draft.recipient)
    if (n === 3) e = validatePackage(draft.pkg)
    if (hasErrors(e)) {
      setErrors(e)
      toast.error('Please fix the highlighted fields', 'Some required details are missing or invalid.')
      return false
    }
    setErrors({})
    return true
  }

  function next() {
    if (!validateStep(step)) return
    setStep((s) => s + 1)
    scrollToTop()
  }

  function back() {
    setErrors({})
    setStep((s) => Math.max(1, s - 1))
    scrollToTop()
  }

  function goToPayment() {
    if (!draft.optionId) {
      toast.error('Choose a delivery option', 'Select one of the delivery speeds to continue.')
      return
    }
    navigate('/payment')
  }

  const selectedOption = draft.optionId ? getDeliveryOption(draft.optionId) : undefined
  const optionList = useMemo(() => getDeliveryOptions(), [])

  const addressFields = (
    which: 'sender' | 'recipient',
    data: Address,
    setter: (p: Partial<Address>) => void,
  ) => (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field
          label="Full name"
          required
          name={`${which}-fullName`}
          autoComplete={which === 'sender' ? 'name' : 'off'}
          placeholder="e.g. Jordan Miles"
          value={data.fullName}
          error={errors.fullName}
          onChange={(e) => setter({ fullName: e.target.value })}
        />
      </div>
      <Field
        label="Email"
        required
        type="email"
        name={`${which}-email`}
        autoComplete="email"
        placeholder="you@company.com"
        value={data.email}
        error={errors.email}
        onChange={(e) => setter({ email: e.target.value })}
      />
      <Field
        label="Phone"
        required
        type="tel"
        name={`${which}-phone`}
        autoComplete="tel"
        placeholder="+1 555 000 1234"
        value={data.phone}
        error={errors.phone}
        onChange={(e) => setter({ phone: e.target.value })}
      />
      <div className="sm:col-span-2">
        <Field
          label="Street address"
          required
          name={`${which}-address`}
          autoComplete="street-address"
          placeholder="1200 Harbor Blvd, Apt 4"
          value={data.address}
          error={errors.address}
          onChange={(e) => setter({ address: e.target.value })}
        />
      </div>
      <Field
        label="City"
        required
        name={`${which}-city`}
        placeholder="Memphis"
        value={data.city}
        error={errors.city}
        onChange={(e) => setter({ city: e.target.value })}
      />
      <Field
        label="State / Province"
        required
        name={`${which}-state`}
        placeholder="Tennessee"
        value={data.state}
        error={errors.state}
        onChange={(e) => setter({ state: e.target.value })}
      />
      <SelectField
        label="Country"
        required
        name={`${which}-country`}
        value={data.country}
        error={errors.country}
        onChange={(e) => setter({ country: e.target.value })}
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
        required
        name={`${which}-zip`}
        autoComplete="postal-code"
        placeholder="38118"
        value={data.zip}
        error={errors.zip}
        onChange={(e) => setter({ zip: e.target.value })}
      />
    </div>
  )

  const pkgFields = (data: PackageInfo, setter: (p: Partial<PackageInfo>) => void) => (
    <div className="grid gap-5 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <span className="label">
          Package type<span className="ml-0.5 text-fx-orange-600">*</span>
        </span>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {PACKAGE_TYPES.map((t) => (
            <button
              type="button"
              key={t.value}
              onClick={() => setter({ type: t.value })}
              className={`rounded-xl border-2 px-3 py-2.5 text-left transition-all duration-200 ${
                data.type === t.value
                  ? 'border-fx-purple-600 bg-fx-purple-50/60 shadow-card'
                  : 'border-gray-200 bg-white hover:border-fx-purple-300'
              }`}
              aria-pressed={data.type === t.value}
            >
              <span className="block text-sm font-bold text-ink">{t.label}</span>
              <span className="mt-0.5 block text-[11px] leading-snug text-gray-400">
                {t.hint}
              </span>
            </button>
          ))}
        </div>
        {errors.type && (
          <p className="error-text" role="alert">
            {errors.type}
          </p>
        )}
      </div>
      <Field
        label="Weight (lbs)"
        required
        name="pkg-weight"
        inputMode="decimal"
        placeholder="12.5"
        value={data.weight}
        error={errors.weight}
        onChange={(e) => setter({ weight: e.target.value })}
      />
      <Field
        label="Package description"
        name="pkg-description"
        placeholder="e.g. Books, clothing"
        value={data.description}
        hint="Helps our crew handle it right (optional)"
        onChange={(e) => setter({ description: e.target.value })}
      />
      <Field
        label="Length (in)"
        required
        name="pkg-length"
        inputMode="decimal"
        placeholder="18"
        value={data.length}
        error={errors.length}
        onChange={(e) => setter({ length: e.target.value })}
      />
      <Field
        label="Width (in)"
        required
        name="pkg-width"
        inputMode="decimal"
        placeholder="12"
        value={data.width}
        error={errors.width}
        onChange={(e) => setter({ width: e.target.value })}
      />
      <Field
        label="Height (in)"
        required
        name="pkg-height"
        inputMode="decimal"
        placeholder="9"
        value={data.height}
        error={errors.height}
        onChange={(e) => setter({ height: e.target.value })}
      />
    </div>
  )

  const estimate = selectedOption ? estimateDeliveryFor(selectedOption.id) : null

  return (
    <div className="container-x max-w-4xl py-10 sm:py-14">
      <Reveal>
        <p className="kicker">Ship now</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
          Book your shipment
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Tell us where it&apos;s going and what we&apos;re carrying. Everything stays on
          this device until checkout.
        </p>
      </Reveal>

      <div className="card mt-8 p-6 sm:p-9">
        <StepProgress steps={STEPS} current={step} onStepClick={(n) => { setStep(n); scrollToTop() }} />

        <div className="mt-9">
          {step === 1 && (
            <section aria-label="Sender information">
              <StepHeading
                icon={<User size={18} aria-hidden />}
                title="Sender information"
                sub="Where the courier will collect the package."
              />
              {addressFields('sender', draft.sender, setSender)}
            </section>
          )}

          {step === 2 && (
            <section aria-label="Recipient information">
              <StepHeading
                icon={<Truck size={18} aria-hidden />}
                title="Recipient information"
                sub="Where the package should be delivered."
              />
              {addressFields('recipient', draft.recipient, setRecipient)}
            </section>
          )}

          {step === 3 && (
            <section aria-label="Package information">
              <StepHeading
                icon={<PackageIcon size={18} aria-hidden />}
                title="Package information"
                sub="Dimensions and weight determine handling."
              />
              {pkgFields(draft.pkg, setPackage)}
            </section>
          )}

          {step === 4 && (
            <section aria-label="Delivery options">
              <StepHeading
                icon={<CreditCard size={18} aria-hidden />}
                title="Choose your delivery speed"
                sub="One option only — you can always change it before payment."
              />
              <div className="grid gap-4">
                {optionList.map((option) => (
                  <DeliveryOptionCard
                    key={option.id}
                    option={option}
                    selected={draft.optionId === option.id}
                    onSelect={() => {
                      setOptionId(option.id)
                      setErrors({})
                    }}
                  />
                ))}
              </div>

              <div className="mt-6 rounded-2xl bg-fx-purple-50/70 p-5 ring-1 ring-inset ring-fx-purple-200/60">
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className="font-semibold text-gray-600">
                    {draft.sender.city || 'Origin'} → {draft.recipient.city || 'Destination'} ·{' '}
                    {draft.pkg.type ? PACKAGE_TYPES.find((t) => t.value === draft.pkg.type)?.label : 'Package'}
                    {draft.pkg.weight ? `, ${draft.pkg.weight} lbs` : ''}
                  </span>
                  <span className="font-extrabold text-ink">
                    {selectedOption
                      ? `${selectedOption.name} — ${currency(selectedOption.price)} · arrives ${estimate ? `${formatDate(estimate)}, ${formatTime(estimate)}` : ''}`
                      : 'Select a delivery speed'}
                  </span>
                </div>
              </div>
            </section>
          )}
        </div>

        {/* Wizard controls */}
        <div className="mt-9 flex items-center justify-between gap-3 border-t border-gray-100 pt-6">
          {step > 1 ? (
            <button onClick={back} className="btn-outline">
              <ArrowLeft size={16} aria-hidden /> Back
            </button>
          ) : (
            <span />
          )}

          {step < 4 && (
            <button onClick={next} className="btn-primary">
              Continue <ArrowRight size={16} aria-hidden />
            </button>
          )}
          {step === 4 && (
            <button
              onClick={goToPayment}
              disabled={!draft.optionId}
              className="btn-primary"
              title={draft.optionId ? undefined : 'Select a delivery option first'}
            >
              Continue to Payment <ArrowRight size={16} aria-hidden />
            </button>
          )}
        </div>
      </div>

      <p className="mt-6 text-center text-sm text-gray-500">
        Need something unusual shipped?{' '}
        <Link to="/contact" className="font-bold text-fx-purple-700 hover:text-fx-orange-600">
          Talk to a logistics specialist
        </Link>
      </p>
    </div>
  )
}

function StepHeading({ icon, title, sub }: { icon: React.ReactNode; title: string; sub: string }) {
  return (
    <div className="mb-6 flex items-start gap-3.5">
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-fx-purple-50 text-fx-purple-600">
        {icon}
      </span>
      <div>
        <h2 className="text-lg font-extrabold tracking-tight text-ink">{title}</h2>
        <p className="text-sm text-gray-500">{sub}</p>
      </div>
    </div>
  )
}
