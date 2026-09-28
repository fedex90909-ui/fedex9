import { Link } from 'react-router-dom'
import { ArrowLeft, PackageSearch } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container-x flex max-w-xl flex-col items-center py-24 text-center">
      <span className="grid h-20 w-20 place-items-center rounded-3xl bg-fx-purple-50 text-fx-purple-600">
        <PackageSearch size={36} aria-hidden />
      </span>
      <p className="mt-6 text-6xl font-black tracking-tight text-fx-purple-700">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink">This route isn&apos;t on our map</h1>
      <p className="mt-3 text-gray-600">
        The page you&apos;re looking for took a detour. Let&apos;s get you back to a
        known delivery point.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link to="/" className="btn-primary">
          <ArrowLeft size={16} aria-hidden /> Back to home
        </Link>
        <Link to="/track" className="btn-outline">
          Track a shipment
        </Link>
      </div>
    </div>
  )
}
