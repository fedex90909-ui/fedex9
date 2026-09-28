import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  CheckCircle2,
  Clock,
  Headset,
  Loader2,
  Mail,
  Package,
} from 'lucide-react'
import { Field, SelectField } from '../components/Field'
import Reveal from '../components/Reveal'
import { useToast } from '../context/ToastContext'
import { CONTACT_SUBJECTS } from '../lib/content'
import { isEmail } from '../lib/validation'

const SUPPORT_EMAIL = 'FedEx90909@gmail.com'

const SUPPORT_CARDS = [
  {
    icon: Headset,
    title: 'Customer support',
    text: 'General questions, account help and feedback.',
    action: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    actionIcon: Mail,
  },
  {
    icon: Package,
    title: 'Shipping support',
    text: 'Help with bookings, pickups and deliveries in motion.',
    action: 'Track a shipment',
    href: '/track',
    actionIcon: null,
  },
  {
    icon: Briefcase,
    title: 'Business inquiries',
    text: 'Volume pricing, API access and dedicated account teams.',
    action: SUPPORT_EMAIL,
    href: `mailto:${SUPPORT_EMAIL}`,
    actionIcon: Mail,
  },
]

const HOURS = [
  ['Monday – Friday', '7:00 AM – 9:00 PM'],
  ['Saturday', '8:00 AM – 6:00 PM'],
  ['Sunday', 'Closed'],
  ['Email support', '24 / 7'],
]

const INITIAL_FORM = { name: '', email: '', phone: '', subject: '', message: '' }

export default function Contact() {
  const toast = useToast()
  const [form, setForm] = useState(INITIAL_FORM)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    const e2: Record<string, string> = {}
    if (!form.name.trim()) e2.name = 'Name is required'
    if (!form.email.trim()) e2.email = 'Email is required'
    else if (!isEmail(form.email)) e2.email = 'Enter a valid email address'
    if (!form.subject) e2.subject = 'Choose a subject'
    if (!form.message.trim()) e2.message = 'Message is required'
    else if (form.message.trim().length < 10) e2.message = 'Message should be at least 10 characters'
    if (Object.keys(e2).length) {
      setErrors(e2)
      toast.error('Please fix the highlighted fields')
      return
    }
    setErrors({})
    setSending(true)
    window.setTimeout(() => {
      setSending(false)
      setSent(true)
      toast.success('Message sent', "We'll get back to you within one business day.")
    }, 1200)
  }

  return (
    <div className="container-x max-w-6xl py-10 sm:py-14">
      <Reveal>
        <p className="kicker">Contact</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-ink sm:text-4xl">
          We&apos;re here around the clock
        </h1>
        <p className="mt-3 max-w-2xl text-gray-600">
          Questions about a shipment, an invoice, or moving your whole fulfillment
          operation? Send a note — real humans answer.
        </p>
      </Reveal>

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        {/* Form */}
        <Reveal>
          <div className="card p-6 sm:p-8">
            {sent ? (
              <div className="animate-scale-in py-10 text-center">
                <CheckCircle2 size={48} className="mx-auto text-green-500" aria-hidden />
                <h2 className="mt-4 text-xl font-extrabold text-ink">Message sent</h2>
                <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500">
                  Thanks, {form.name.split(' ')[0]}. Your message is with our{' '}
                  {form.subject.toLowerCase()} team — expect a reply within one business
                  day.
                </p>
                <button
                  onClick={() => {
                    setForm(INITIAL_FORM)
                    setSent(false)
                  }}
                  className="btn-outline mt-6"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={submit} noValidate>
                <div className="grid gap-5 sm:grid-cols-2">
                  <Field
                    label="Name"
                    required
                    name="name"
                    autoComplete="name"
                    placeholder="Your full name"
                    value={form.name}
                    error={errors.name}
                    onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
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
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  />
                  <Field
                    label="Phone"
                    type="tel"
                    name="phone"
                    autoComplete="tel"
                    placeholder="+1 555 000 1234"
                    value={form.phone}
                    error={errors.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  />
                  <SelectField
                    label="Subject"
                    required
                    name="subject"
                    value={form.subject}
                    error={errors.subject}
                    onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  >
                    <option value="">Choose a subject…</option>
                    {CONTACT_SUBJECTS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </SelectField>
                  <div className="sm:col-span-2">
                    <label htmlFor="message" className="label">
                      Message<span className="ml-0.5 text-fx-orange-600">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      placeholder="Tell us what you need…"
                      value={form.message}
                      aria-invalid={Boolean(errors.message)}
                      className={`input resize-none ${errors.message ? 'input-error' : ''}`}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                    />
                    {errors.message && (
                      <p className="error-text" role="alert">
                        {errors.message}
                      </p>
                    )}
                  </div>
                </div>
                <button type="submit" disabled={sending} className="btn-primary btn-lg mt-7 w-full sm:w-auto">
                  {sending ? (
                    <>
                      <Loader2 size={18} className="animate-spin" aria-hidden /> Sending…
                    </>
                  ) : (
                    <>
                      <Mail size={16} aria-hidden /> Send message
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </Reveal>

        {/* Sidebar */}
        <div className="space-y-5">
          {SUPPORT_CARDS.map((c, i) => (
            <Reveal key={c.title} delay={i * 90}>
              <div className="card flex items-start gap-4 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lift">
                <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-fx-purple-50 text-fx-purple-600">
                  <c.icon size={20} aria-hidden />
                </span>
                <div>
                  <h3 className="text-sm font-extrabold text-ink">{c.title}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-gray-500">{c.text}</p>
                  {c.href.startsWith('/') ? (
                    <Link
                      to={c.href}
                      className="mt-2 inline-block text-xs font-extrabold text-fx-purple-700 hover:text-fx-orange-600"
                    >
                      {c.action} →
                    </Link>
                  ) : (
                    <a
                      href={c.href}
                      className="mt-2 inline-block text-xs font-extrabold text-fx-purple-700 hover:text-fx-orange-600"
                    >
                      {c.action}
                    </a>
                  )}
                </div>
              </div>
            </Reveal>
          ))}

          <Reveal delay={280}>
            <div className="card p-6">
              <h3 className="flex items-center gap-2 text-sm font-extrabold text-ink">
                <Mail size={16} className="text-fx-orange-500" aria-hidden /> Email support
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">
                Write to us anytime — a real person answers every message.
              </p>
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="mt-2 inline-block break-all text-sm font-extrabold text-fx-purple-700 transition hover:text-fx-orange-600"
              >
                {SUPPORT_EMAIL}
              </a>
              <h3 className="mt-6 flex items-center gap-2 text-sm font-extrabold text-ink">
                <Clock size={16} className="text-fx-orange-500" aria-hidden /> Support hours
              </h3>
              <table className="mt-3 w-full text-sm">
                <tbody>
                  {HOURS.map(([d, h]) => (
                    <tr key={d} className="border-b border-gray-100 last:border-0">
                      <td className="py-2 pr-3 font-semibold text-gray-500">{d}</td>
                      <td className="py-2 text-right font-bold text-ink">{h}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
