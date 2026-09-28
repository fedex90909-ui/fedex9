interface RouteMapProps {
  origin: { city: string; country: string }
  destination: { city: string; country: string }
  progress?: number
}

/** Stylized origin → destination route with animated air path. */
export default function RouteMap({ origin, destination, progress = 50 }: RouteMapProps) {
  const clamped = Math.min(100, Math.max(4, progress))
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200/70 bg-gradient-to-b from-fx-purple-50/60 to-white">
      <svg
        viewBox="0 0 640 200"
        className="h-auto w-full"
        role="img"
        aria-label={`Route from ${origin.city} to ${destination.city}`}
      >
        <defs>
          <linearGradient id="route-air" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#B79BE3" />
            <stop offset="50%" stopColor="#FF6600" />
            <stop offset="100%" stopColor="#B79BE3" />
          </linearGradient>
        </defs>

        {/* ground dots */}
        {Array.from({ length: 16 }).map((_, i) => (
          <circle
            key={i}
            cx={40 + i * 38}
            cy={158}
            r={2}
            fill="#D9C9F0"
            aria-hidden
          />
        ))}

        {/* arc path */}
        <path
          d="M 80 140 Q 320 10 560 140"
          fill="none"
          stroke="url(#route-air)"
          strokeWidth="2.5"
          strokeLinecap="round"
          className="route-dash"
          opacity="0.85"
        />
        {/* completed portion */}
        <path
          d="M 80 140 Q 320 10 560 140"
          fill="none"
          stroke="#4D148C"
          strokeWidth="3"
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${clamped} 100`}
          style={{ transition: 'stroke-dasharray 1.2s cubic-bezier(.22,.61,.36,1)' }}
        />

        {/* plane at 55% of arc */}
        <g transform="translate(305, 62) rotate(6)" aria-hidden>
          <path
            d="M -14 4 L 6 4 L 14 -2 L 10 4 L 12 9 L 4 7 L -8 10 Z"
            fill="#4D148C"
          />
          <circle cx="-17" cy="4" r="2" fill="#FF6600" />
        </g>

        {/* origin pin */}
        <g aria-hidden>
          <circle cx="80" cy="140" r="16" fill="#4D148C" opacity="0.12" />
          <circle cx="80" cy="140" r="7" fill="#4D148C" />
          <circle cx="80" cy="140" r="2.6" fill="#fff" />
        </g>
        {/* destination pin */}
        <g aria-hidden>
          <circle cx="560" cy="140" r="16" fill="#FF6600" opacity="0.14" />
          <circle cx="560" cy="140" r="7" fill="#FF6600" />
          <circle cx="560" cy="140" r="2.6" fill="#fff" />
        </g>

        <text
          x="80"
          y="176"
          textAnchor="middle"
          className="fill-gray-700"
          fontSize="13"
          fontWeight="700"
        >
          {origin.city}
        </text>
        <text
          x="80"
          y="192"
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="10"
          fontWeight="600"
        >
          {origin.country}
        </text>
        <text
          x="560"
          y="176"
          textAnchor="middle"
          className="fill-gray-700"
          fontSize="13"
          fontWeight="700"
        >
          {destination.city}
        </text>
        <text
          x="560"
          y="192"
          textAnchor="middle"
          className="fill-gray-400"
          fontSize="10"
          fontWeight="600"
        >
          {destination.country}
        </text>
      </svg>
    </div>
  )
}
