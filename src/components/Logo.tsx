interface LogoProps {
  light?: boolean
  className?: string
}

/**
 * FedEx-style wordmark: purple "Fed" + orange "Ex" with tight, forward-leaning
 * tracking — rendered in type.
 */
export default function Logo({ light = false, className = '' }: LogoProps) {
  return (
    <span
      className={`inline-flex select-none items-baseline ${className}`}
      aria-label="FedEx"
    >
      <span
        className={`text-[26px] font-black leading-none tracking-[-0.055em] ${
          light ? 'text-white' : 'text-fx-purple-600'
        }`}
      >
        Fed
        <span className="text-fx-orange-500">Ex</span>
      </span>
    </span>
  )
}
