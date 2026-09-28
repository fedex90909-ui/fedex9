/** Original air-freight illustration — cargo jet with dashed flight path. */
export default function PlaneIllustration() {
  return (
    <svg
      viewBox="0 0 520 300"
      className="h-auto w-full"
      role="img"
      aria-label="Illustration of a FedEx cargo aircraft in flight"
    >
      <defs>
        <linearGradient id="pl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6A30B8" />
          <stop offset="100%" stopColor="#4D148C" />
        </linearGradient>
      </defs>

      {/* trail */}
      <path
        d="M 8 148 Q 40 120 72 142"
        fill="none"
        stroke="#B79BE3"
        strokeWidth="3"
        strokeLinecap="round"
        className="route-dash"
        opacity="0.7"
      />
      <circle cx="470" cy="52" r="30" fill="#FFC39E" opacity="0.25" />
      <circle cx="60" cy="250" r="40" fill="#D9C9F0" opacity="0.35" />

      {/* tail fin */}
      <polygon points="74,128 108,74 138,124" fill="#FF6600" />

      {/* fuselage */}
      <path
        d="M 66 148 Q 66 120 118 116 L 318 116 Q 402 118 448 142 Q 452 146 448 150 Q 402 166 318 168 L 118 168 Q 66 166 66 148 Z"
        fill="url(#pl-body)"
      />

      {/* wing */}
      <polygon points="196,142 268,196 306,194 246,140" fill="#2E0B57" />
      {/* engine */}
      <rect x="238" y="158" width="44" height="20" rx="10" fill="#2E0B57" />
      <circle cx="282" cy="168" r="8" fill="#1F0740" />
      <circle cx="282" cy="168" r="3.5" fill="#8F5FD0" />

      {/* cockpit */}
      <path d="M 414 128 Q 438 134 446 142 Q 436 148 414 148 Z" fill="#EDE6F8" opacity="0.9" />

      {/* windows */}
      {Array.from({ length: 9 }).map((_, i) => (
        <circle key={i} cx={128 + i * 26} cy="136" r="3.4" fill="#FFFFFF" opacity="0.85" />
      ))}

      {/* wordmark on fuselage */}
      <text x="200" y="162" fontSize="15" fontWeight="900" letterSpacing="-0.4">
        <tspan fill="#FFFFFF">Fed</tspan>
        <tspan fill="#FF9E63">Ex</tspan>
      </text>
    </svg>
  )
}
