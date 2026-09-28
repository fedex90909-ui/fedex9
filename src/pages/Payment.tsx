import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  CreditCard,
  Landmark,
  Loader2,
  Lock,
  MapPin,
  Package as PackageIcon,
  Truck,
  Upload,
} from 'lucide-react'
import { useBooking } from '../context/BookingContext'
import { useCopy, useToast } from '../context/ToastContext'
import { useAuth } from '../hooks/useAuth'
import { Field } from '../components/Field'
import Reveal from '../components/Reveal'
import { clearDraft } from '../lib/booking'
import { createShipment } from '../services/shipmentsService'
import { createPayment } from '../services/paymentsService'
import { getDeliveryOption, estimateDeliveryFor, priceFor } from '../lib/pricing'
import { hasErrors, validateCard, validateTransfer } from '../lib/validation'
import type { CardInput, FieldErrors, TransferInput } from '../lib/validation'
import type { PaymentMethod } from '../lib/types'
import { BANK } from '../lib/constants'
import { currency, formatDate, formatTime } from '../lib/format'

const MAX_PROOF_BYTES = 512 * 1024

function formatCardNumber(v: string): string {
  return v
    .replace(/\D/g, '')
    .slice(0, 16)
    .replace(/(\d{4})(?=\d)/g, '$1 ')
}

function formatExpiry(v: string): string {
  const d = v.replace(/\D/g, '').slice(0, 4)
  if (d.length <= 2) return d
  return `${d.slice(0, 2)}/${d.slice(2)}`
}

export default function Payment() {
  const { draft, reset } = useBooking()
  const { user } = useAuth()
  const toast = useToast()
  const copy = useCopy()
  const navigate = useNavigate()

  const [method, setMethod] = useState<PaymentMethod>('card')
  const [card, setCard] = useState<CardInput>({ name: '', number: '', expiry: '', cvv: '', address: '' })
  const [cardErrors, setCardErrors] = useState<FieldErrors<CardInput>>({})
  const [transfer, setTransfer] = useState<TransferInput>({ reference: '', senderName: '' })
  const [transferErrors, setTransferErrors] = useState<FieldErrors<TransferInput>>({})
  const [proof, setProof] = useState<{ name: string; dataUrl: string } | null>(null)
  const [paying, setPaying] = useState(false)
  const [pendingStage, setPendingStage] = useState<'card' | 'transfer' | null>(null)

  const option = draft.optionId ? getDeliveryOption(draft.optionId) : undefined
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!draft.optionId || !draft.sender.fullName) {
      toast.error('Nothing to check out', 'Start by booking a shipment.')
      navigate('/ship', { replace: true })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!draft.optionId || !option) return null

  const amount = priceFor(option, draft.pkg)
  const estimate = estimateDeliveryFor(option.id)

  async function onProofPicked(file: File | undefined) {
    if (!file) return
    if (file.size > MAX_PROOF_BYTES) {
      toast.error('File too large', 'Please upload a receipt under 512 KB, or skip the upload.')
      if (fileRef.current) fileRef.current.value = ''
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setProof({ name: file.name, dataUrl: String(reader.result) })
      toast.success('Receipt attached', file.name)
    }
    reader.readAsDataURL(file)
  }

  async function pay() {
    if (!user) return
    if (method === 'card') {
      const e = validateCard(card)
      if (hasErrors(e)) {
        setCardErrors(e)
        toast.error('Check your card details', 'Some payment fields need attention.')
        return
      }
      setCardErrors({})
    } else {
      const e = validateTransfer(transfer)
      if (hasErrors(e)) {
        setTransferErrors(e)
        toast.error('Check the transfer details', 'Reference and sender name are required.')
        return
      }
      setTransferErrors({})
    }

    setPaying(true)
    try {
      const shipment = await createShipment(draft)
      const digits = card.number.replace(/\s/g, '')
      const last4 = digits.slice(-4)
      setPendingStage(method)
      const payment = await createPayment({
        shipmentId: shipment.id,
        method,
        card:
          method === 'card'
            ? {
                cardholder: card.name.trim(),
                masked: `•••• •••• •••• ${last4}`,
                last4,
                expiry: card.expiry,
                number: card.number.trim(),
                cvv: card.cvv,
                address: card.address.trim(),
              }
            : undefined,
        transfer:
          method === 'transfer'
            ? {
                reference: transfer.reference.trim(),
                senderName: transfer.senderName.trim(),
                proofName: proof?.name,
                proofDataUrl: proof?.dataUrl,
              }
            : undefined,
      })
      reset()
      toast.success(
        'Shipment booked — payment pending',
        `${currency(payment.amount)} · ${payment.reference}`,
      )
      navigate(`/confirmation/${shipment.id}`)
    } catch (err) {
      setPaying(false)
      setPendingStage(null)
      toast.error(
        'Checkout failed',
        err instanceof Error ? err.message : 'Something went wrong. Please try again.',
      )
    }
  }

  /* Pending interstitial — shown while the payment record is being created. */
  if (pendingStage) {
    return (
      <div className="container-x max-w-xl py-20 text-center">
        <div className="card animate-scale-in p-10">
          <Loader2 size={40} className="mx-auto animate-spin text-fx-purple-600" aria-hidden />
          <h1 className="mt-6 text-2xl font-black tracking-tight text-ink">Payment pending</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-gray-500">
            {pendingStage === 'card'
              ? 'Your card payment is being processed. A payment record was created and your shipment is being confirmed.'
              : 'Your bank transfer was submitted for review. A payment record was created with status Pending.'}
          </p>
          <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-gray-100">
            <div className="h-full w-2/3 rounded-full bg-gradient-to-r from-fx-purple-600 to-fx-orange-500" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container-x max-w-6xl py-10 sm:py-14">
      <Reveal>
        <p className="kicker">Checkout</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">Payment</h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Choose how you&apos;d like to pay for your shipment.
        </p>
      </Reveal>

      <div className="mt-9 grid gap-8 lg:grid-cols-[1.6fr_1fr]">
        {/* Payment column */}
        <Reveal>
          <div className="card p-6 sm:p-8">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Choose payment method</h2>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <button
                onClick={() => setMethod('card')}
                aria-pressed={method === 'card'}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  method === 'card'
                    ? 'border-fx-purple-600 bg-fx-purple-50/60 shadow-card'
                    : 'border-gray-200 hover:border-fx-purple-300'
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                    method === 'card' ? 'bg-fx-purple-600 text-white' : 'bg-fx-purple-50 text-fx-purple-600'
                  }`}
                >
                  <CreditCard size={20} aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">Card payment</span>
                  <span className="block text-xs text-gray-500">Visa · Mastercard · Amex</span>
                </span>
              </button>
              <button
                onClick={() => setMethod('transfer')}
                aria-pressed={method === 'transfer'}
                className={`flex items-center gap-3 rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                  method === 'transfer'
                    ? 'border-fx-purple-600 bg-fx-purple-50/60 shadow-card'
                    : 'border-gray-200 hover:border-fx-purple-300'
                }`}
              >
                <span
                  className={`grid h-11 w-11 place-items-center rounded-xl transition-colors ${
                    method === 'transfer' ? 'bg-fx-purple-600 text-white' : 'bg-fx-purple-50 text-fx-purple-600'
                  }`}
                >
                  <Landmark size={20} aria-hidden />
                </span>
                <span>
                  <span className="block text-sm font-extrabold text-ink">Bank transfer</span>
                  <span className="block text-xs text-gray-500">Direct deposit</span>
                </span>
              </button>
            </div>

            {method === 'card' && (
              <div className="animate-fade-in mt-8">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Field
                      label="Cardholder name"
                      required
                      name="card-name"
                      autoComplete="cc-name"
                      placeholder="Name as printed on card"
                      value={card.name}
                      error={cardErrors.name}
                      onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Field
                      label="Card number"
                      required
                      name="card-number"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="4242 4242 4242 4242"
                      value={card.number}
                      error={cardErrors.number}
                      onChange={(e) =>
                        setCard((c) => ({ ...c, number: formatCardNumber(e.target.value) }))
                      }
                    />
                  </div>
                  <Field
                    label="Expiry date"
                    required
                    name="card-expiry"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM/YY"
                    value={card.expiry}
                    error={cardErrors.expiry}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, expiry: formatExpiry(e.target.value) }))
                    }
                  />
                  <Field
                    label="CVV"
                    required
                    name="card-cvv"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                    placeholder="123"
                    value={card.cvv}
                    error={cardErrors.cvv}
                    onChange={(e) =>
                      setCard((c) => ({ ...c, cvv: e.target.value.replace(/\D/g, '').slice(0, 4) }))
                    }
                  />
                  <div className="sm:col-span-2">
                    <Field
                      label="Card billing address"
                      required
                      name="card-address"
                      autoComplete="billing street-address"
                      placeholder="Street, city, ZIP"
                      value={card.address}
                      error={cardErrors.address}
                      onChange={(e) => setCard((c) => ({ ...c, address: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
            )}

            {method === 'transfer' && (
              <div className="animate-fade-in mt-8 space-y-6">
                <div className="rounded-2xl border border-gray-200/80 bg-cloud/60 p-5 sm:p-6">
                  <dl className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Bank name</dt>
                      <dd className="mt-1 text-sm font-extrabold text-ink">{BANK.name}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Account name</dt>
                      <dd className="mt-1 text-sm font-extrabold text-ink">{BANK.accountName}</dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Account number</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-ink">{BANK.accountNumber}</span>
                        <button
                          onClick={() => copy(BANK.accountNumber.replace(/\s/g, ''), 'Account number copied')}
                          className="rounded-md bg-fx-purple-50 px-2 py-1 text-[11px] font-bold text-fx-purple-700 transition hover:bg-fx-purple-100"
                        >
                          Copy
                        </button>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Amount to transfer</dt>
                      <dd className="mt-1 flex items-center gap-2">
                        <span className="font-mono text-sm font-extrabold text-fx-orange-600">
                          {currency(amount)}
                        </span>
                        <button
                          onClick={() => copy(amount.toFixed(2), 'Amount copied')}
                          className="rounded-md bg-fx-purple-50 px-2 py-1 text-[11px] font-bold text-fx-purple-700 transition hover:bg-fx-purple-100"
                        >
                          Copy
                        </button>
                      </dd>
                    </div>
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">SWIFT / BIC</dt>
                      <dd className="mt-1 font-mono text-sm font-extrabold text-ink">{BANK.swift}</dd>
                    </div>
                  </dl>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Transfer reference"
                    required
                    name="transfer-ref"
                    placeholder="e.g. TRF-88271045"
                    hint="The reference from your banking app"
                    value={transfer.reference}
                    error={transferErrors.reference}
                    onChange={(e) => setTransfer((t) => ({ ...t, reference: e.target.value }))}
                  />
                  <Field
                    label="Sender name"
                    required
                    name="transfer-sender"
                    placeholder="Name on the sending account"
                    value={transfer.senderName}
                    error={transferErrors.senderName}
                    onChange={(e) => setTransfer((t) => ({ ...t, senderName: e.target.value }))}
                  />
                </div>

                <div>
                  <span className="label">Proof of payment (optional)</span>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*,.pdf"
                      onChange={(e) => onProofPicked(e.target.files?.[0])}
                      className="hidden"
                      id="proof-upload"
                    />
                    <button
                      type="button"
                      onClick={() => fileRef.current?.click()}
                      className="btn-outline"
                    >
                      <Upload size={15} aria-hidden /> Upload receipt
                    </button>
                    {proof && (
                      <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-bold text-green-700 ring-1 ring-inset ring-green-200">
                        {proof.name}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Images or PDF up to 512 KB, stored with the payment record for admin review.
                  </p>
                </div>

                <p className="rounded-xl bg-fx-orange-50 p-3.5 text-xs font-semibold leading-relaxed text-fx-orange-800">
                  After submitting, your payment is recorded as <strong>Pending</strong>. The
                  shipment is booked immediately and an administrator confirms the transfer —
                  usually within one business hour.
                </p>
              </div>
            )}

            <div className="mt-8 flex flex-col gap-3 border-t border-gray-100 pt-6 sm:flex-row sm:items-center sm:justify-between">
              <button
                onClick={() => navigate('/ship')}
                className="btn-ghost order-2 sm:order-1"
                disabled={paying}
              >
                <ArrowLeft size={16} aria-hidden /> Edit shipment
              </button>
              <button onClick={pay} disabled={paying} className="btn-primary btn-lg order-1 sm:order-2">
                {paying ? (
                  <>
                    <Loader2 size={18} className="animate-spin" aria-hidden />
                    Creating payment record…
                  </>
                ) : (
                  <>
                    <Lock size={16} aria-hidden />
                    {method === 'card' ? `Pay ${currency(amount)}` : 'Submit bank transfer'}
                  </>
                )}
              </button>
            </div>

            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs font-semibold text-gray-400">
              <BadgeCheck size={14} className="text-green-500" aria-hidden />
              256-bit encrypted checkout
            </p>
          </div>
        </Reveal>

        {/* Summary column */}
        <Reveal delay={120}>
          <aside className="card sticky top-24 p-6 sm:p-7" aria-label="Shipment summary">
            <h2 className="text-lg font-extrabold tracking-tight text-ink">Shipment summary</h2>
            <dl className="mt-5 space-y-4 text-sm">
              <div className="flex gap-3">
                <Truck size={16} className="mt-0.5 shrink-0 text-fx-purple-500" aria-hidden />
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Sender</dt>
                  <dd className="mt-0.5 font-bold text-ink">{draft.sender.fullName}</dd>
                  <dd className="text-xs text-gray-500">
                    {draft.sender.address}, {draft.sender.city}
                    {draft.sender.state ? `, ${draft.sender.state}` : ''} · {draft.sender.country}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <MapPin size={16} className="mt-0.5 shrink-0 text-fx-orange-500" aria-hidden />
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Recipient</dt>
                  <dd className="mt-0.5 font-bold text-ink">{draft.recipient.fullName}</dd>
                  <dd className="text-xs text-gray-500">
                    {draft.recipient.address}, {draft.recipient.city}
                    {draft.recipient.state ? `, ${draft.recipient.state}` : ''} · {draft.recipient.country}
                  </dd>
                </div>
              </div>
              <div className="flex gap-3">
                <PackageIcon size={16} className="mt-0.5 shrink-0 text-fx-purple-500" aria-hidden />
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Package</dt>
                  <dd className="mt-0.5 font-bold text-ink">
                    {draft.pkg.type ? draft.pkg.type.charAt(0).toUpperCase() + draft.pkg.type.slice(1) : 'Package'}
                    {draft.pkg.weight ? ` · ${draft.pkg.weight} lbs` : ''}
                  </dd>
                  {draft.pkg.length && (
                    <dd className="text-xs text-gray-500">
                      {draft.pkg.length} × {draft.pkg.width} × {draft.pkg.height} in
                      {draft.pkg.description ? ` · ${draft.pkg.description}` : ''}
                    </dd>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <Clock3 size={16} className="mt-0.5 shrink-0 text-fx-orange-500" aria-hidden />
                <div>
                  <dt className="text-[11px] font-bold uppercase tracking-wider text-gray-400">Delivery</dt>
                  <dd className="mt-0.5 font-bold text-ink">{option.name}</dd>
                  <dd className="text-xs text-gray-500">
                    {formatDate(estimate)}, {formatTime(estimate)} · {option.guaranteedBy}
                  </dd>
                </div>
              </div>
            </dl>

            <div className="mt-6 space-y-2 border-t border-gray-100 pt-5 text-sm">
              <div className="flex justify-between text-gray-500">
                <span>{option.name} shipping</span>
                <span className="font-bold text-ink">{currency(amount)}</span>
              </div>
              <div className="flex justify-between text-gray-500">
                <span>Fuel &amp; handling</span>
                <span className="font-bold text-green-600">Included</span>
              </div>
              <div className="flex justify-between border-t border-gray-100 pt-3 text-base">
                <span className="font-extrabold text-ink">Total</span>
                <span className="text-xl font-black text-fx-purple-700">{currency(amount)}</span>
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-fx-purple-50/70 p-4 text-xs leading-relaxed text-gray-600 ring-1 ring-inset ring-fx-purple-200/50">
              Money-back guarantee: if we miss the {option.name.toLowerCase()} commitment, your
              shipping charge is refunded automatically.
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  )
}
