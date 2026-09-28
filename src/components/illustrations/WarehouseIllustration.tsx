/** Original warehouse illustration — sorting facility with docked parcel boxes. */
export default function WarehouseIllustration() {
  return (
    <svg
      viewBox="0 0 520 360"
      className="h-auto w-full"
      role="img"
      aria-label="Illustration of a FedEx sorting warehouse with outbound parcels"
    >
      <defs>
        <linearGradient id="wh-roof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6A30B8" />
          <stop offset="100%" stopColor="#4D148C" />
        </linearGradient>
        <linearGradient id="wh-door" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8536" />
          <stop offset="100%" stopColor="#FF6600" />
        </linearGradient>
      </defs>

      {/* backdrop accents */}
      <circle cx="60" cy="60" r="34" fill="#FFC39E" opacity="0.3" />
      <circle cx="480" cy="80" r="46" fill="#D9C9F0" opacity="0.4" />
      {Array.from({ length: 4 }).map((_, i) => (
        <circle key={i} cx={30 + i * 26} cy={330} r="2" fill="#D9C9F0" />
      ))}

      {/* ground */}
      <rect x="16" y="306" width="488" height="6" rx="3" fill="#E3DAF3" />

      {/* roof */}
      <polygon points="44,120 476,120 446,78 74,78" fill="url(#wh-roof)" />

      {/* body */}
      <rect x="66" y="120" width="388" height="186" rx="10" fill="#FFFFFF" stroke="#E0D6F2" strokeWidth="2" />

      {/* signage band */}
      <rect x="66" y="120" width="388" height="38" rx="10" fill="#F5F1FB" />
      <text x="92" y="146" fontSize="20" fontWeight="900" letterSpacing="-0.5">
        <tspan fill="#4D148C">Fed</tspan>
        <tspan fill="#FF6600">Ex</tspan>
      </text>
      <rect x="330" y="132" width="96" height="14" rx="7" fill="#EDE6F8" />

      {/* windows */}
      <rect x="200" y="182" width="30" height="38" rx="5" fill="#D9C9F0" />
      <rect x="242" y="182" width="30" height="38" rx="5" fill="#D9C9F0" />

      {/* staff door */}
      <rect x="100" y="186" width="56" height="120" rx="5" fill="#4D148C" />
      <circle cx="146" cy="248" r="3.5" fill="#B79BE3" />

      {/* loading dock door */}
      <rect x="300" y="168" width="118" height="138" rx="6" fill="url(#wh-door)" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <line
          key={i}
          x1="304"
          y1={188 + i * 20}
          x2="414"
          y2={188 + i * 20}
          stroke="#FFFFFF"
          strokeWidth="3"
          opacity="0.3"
        />
      ))}
      <rect x="286" y="296" width="146" height="10" rx="5" fill="#2E0B57" />

      {/* parcels */}
      <g aria-hidden>
        <rect x="28" y="268" width="42" height="38" rx="5" fill="#FFC39E" stroke="#FF8536" strokeWidth="2" />
        <line x1="49" y1="268" x2="49" y2="306" stroke="#FFFFFF" strokeWidth="4" opacity="0.8" />
        <rect x="40" y="234" width="38" height="34" rx="5" fill="#FF9E63" stroke="#FF8536" strokeWidth="2" />
        <line x1="59" y1="234" x2="59" y2="268" stroke="#FFFFFF" strokeWidth="4" opacity="0.8" />
      </g>

      {/* small truck leaving */}
      <g transform="translate(352, 236)" aria-hidden>
        <rect x="0" y="18" width="86" height="52" rx="8" fill="url(#wh-door)" />
        <text x="43" y="50" textAnchor="middle" fontSize="17" fontWeight="900" letterSpacing="-0.5">
          <tspan fill="#FFFFFF">Fed</tspan>
          <tspan fill="#4D148C">Ex</tspan>
        </text>
        <rect x="86" y="30" width="30" height="40" rx="6" fill="#4D148C" />
        <rect x="92" y="36" width="18" height="14" rx="3" fill="#EDE6F8" />
        <circle cx="24" cy="74" r="11" fill="#241239" />
        <circle cx="24" cy="74" r="4" fill="#B79BE3" />
        <circle cx="98" cy="74" r="11" fill="#241239" />
        <circle cx="98" cy="74" r="4" fill="#B79BE3" />
      </g>
    </svg>
  )
}
