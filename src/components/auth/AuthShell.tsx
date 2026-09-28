import { Link } from 'react-router-dom'
import type { ReactNode } from 'react'
import { ShieldCheck } from 'lucide-react'
import Logo from '../Logo'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="dot-bg min-h-[calc(100vh-72px)] py-12 sm:py-16">
      <div className="mx-auto w-full max-w-md px-4">
        <div className="text-center">
          <Link to="/" className="inline-block" aria-label="FedEx home">
            <Logo />
          </Link>
          <h1 className="mt-6 text-2xl font-black tracking-tight text-ink sm:text-3xl">{title}</h1>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        <div className="card mt-8 p-6 sm:p-8">{children}</div>

        {footer && <div className="mt-5 text-center text-sm text-gray-600">{footer}</div>}

        <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-xs text-gray-400">
          <ShieldCheck size={13} className="text-green-500" aria-hidden />
          Passwords are hashed (PBKDF2) and never stored in plaintext.
        </p>
      </div>
    </div>
  )
}

export function FormError({ message }: { message: string }) {
  return (
    <div
      role="alert"
      className="animate-fade-in rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700"
    >
      {message}
    </div>
  )
}
