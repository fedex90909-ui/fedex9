/** Original globe illustration with pulsing network nodes and animated air routes. */
export default function GlobeIllustration({ light = false }: { light?: boolean }) {
  const meridian = light ? '#FFFFFF' : '#D9C9F0'
  const meridianOpacity = light ? 0.22 : 1
  return (
    <svg
      viewBox="0 0 520 440"
      className="h-auto w-full"
      role="img"
      aria-label="Illustration of the global delivery network with routes across continents"
    >
      <defs>
        <clipPath id="gl-clip">
          <circle cx="260" cy="210" r="140" />
        </clipPath>
        <linearGradient id="gl-arc" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FF6600" />
          <stop offset="100%" stopColor="#B79BE3" />
        </linearGradient>
      </defs>

      {/* orbit ring */}
      <g transform="rotate(-16 260 210)" opacity="0.55">
        <ellipse
          cx="260"
          cy="210"
          rx="196"
          ry="62"
          fill="none"
          stroke={light ? '#FFFFFF' : '#B79BE3'}
          strokeOpacity={light ? 0.35 : 0.6}
          strokeWidth="1.6"
          strokeDasharray="2 9"
        />
        <circle cx="452" cy="182" r="6" fill="#FF6600" />
      </g>

      {/* sphere */}
      <circle cx="260" cy="210" r="140" fill={light ? '#FFFFFF' : '#F5F1FB'} fillOpacity={light ? 0.08 : 1} stroke={light ? '#FFFFFF' : '#D9C9F0'} strokeOpacity={light ? 0.4 : 1} strokeWidth="2" />

      {/* landmass hints */}
      <g clipPath="url(#gl-clip)" opacity={light ? 0.25 : 0.8}>
        <ellipse cx="200" cy="160" rx="52" ry="34" fill="#D9C9F0" transform="rotate(-14 200 160)" />
        <ellipse cx="320" cy="190" rx="40" ry="26" fill="#D9C9F0" transform="rotate(12 320 190)" />
        <ellipse cx="240" cy="280" rx="46" ry="24" fill="#D9C9F0" transform="rotate(-8 240 280)" />
        <ellipse cx="330" cy="120" rx="26" ry="16" fill="#D9C9F0" />
      </g>

      {/* meridians + latitudes */}
      <g fill="none" stroke={meridian} strokeOpacity={meridianOpacity} strokeWidth="1.6">
        <ellipse cx="260" cy="210" rx="140" ry="140" />
        <ellipse cx="260" cy="210" rx="95" ry="140" />
        <ellipse cx="260" cy="210" rx="46" ry="140" />
        <line x1="120" y1="210" x2="400" y2="210" />
        <line x1="132" y1="160" x2="388" y2="160" />
        <line x1="132" y1="260" x2="388" y2="260" />
        <line x1="158" y1="118" x2="362" y2="118" />
        <line x1="158" y1="302" x2="362" y2="302" />
      </g>

      {/* air routes */}
      <g fill="none" strokeWidth="2.4" strokeLinecap="round">
        <path d="M 178 168 Q 258 84 344 148" stroke="url(#gl-arc)" className="route-dash" />
        <path d="M 150 252 Q 250 344 338 286" stroke="#FF6600" className="route-dash" opacity="0.75" />
        <path d="M 210 110 Q 330 150 372 226" stroke="#B79BE3" className="route-dash" opacity="0.8" />
      </g>

      {/* nodes */}
      {[
        { x: 178, y: 168, c: '#FF6600' },
        { x: 344, y: 148, c: '#4D148C' },
        { x: 150, y: 252, c: '#4D148C' },
        { x: 338, y: 286, c: '#FF6600' },
        { x: 210, y: 110, c: '#FF6600' },
        { x: 372, y: 226, c: '#4D148C' },
      ].map((n, i) => (
        <g key={i} aria-hidden>
          <circle cx={n.x} cy={n.y} r="5" fill={n.c}>
            <animate attributeName="opacity" values="1;0.55;1" dur="2.6s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
          </circle>
        </g>
      ))}

      {/* plane */}
      <g transform="translate(250, 96) rotate(24)" aria-hidden>
        <path d="M -14 3 L 7 3 L 15 -3 L 11 3 L 13 8 L 4 6 L -9 9 Z" fill={light ? '#FFFFFF' : '#4D148C'} />
      </g>
    </svg>
  )
}
