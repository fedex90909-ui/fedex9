/**
 * Original hero illustration: brand truck on a delivery route with live-status
 * cards. Flat vector style in the purple/orange palette — no external assets.
 */
export default function HeroScene() {
  return (
    <svg
      viewBox="0 0 640 500"
      className="h-auto w-full"
      role="img"
      aria-label="Illustration of a FedEx delivery truck on route with live tracking updates"
    >
      <defs>
        <linearGradient id="hs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FAF7FE" />
          <stop offset="100%" stopColor="#EFE8F9" />
        </linearGradient>
        <linearGradient id="hs-orange" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FF8536" />
          <stop offset="100%" stopColor="#FF6600" />
        </linearGradient>
        <linearGradient id="hs-purple" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6A30B8" />
          <stop offset="100%" stopColor="#4D148C" />
        </linearGradient>
        <linearGradient id="hs-progress" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#4D148C" />
          <stop offset="100%" stopColor="#FF6600" />
        </linearGradient>
      </defs>

      {/* backdrop */}
      <rect x="0" y="0" width="640" height="500" rx="28" fill="url(#hs-sky)" />
      <circle cx="90" cy="80" r="60" fill="#FFC39E" opacity="0.28" />
      <circle cx="600" cy="420" r="90" fill="#D9C9F0" opacity="0.35" />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 7 }).map((_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={470 + c * 24}
            cy={250 + r * 24}
            r="1.6"
            fill="#B79BE3"
            opacity="0.5"
          />
        )),
      )}

      {/* clouds */}
      <g fill="#FFFFFF" opacity="0.9">
        <g className="svg-float-slow">
          <rect x="60" y="52" width="86" height="22" rx="11" />
          <rect x="84" y="36" width="52" height="22" rx="11" />
        </g>
        <g className="svg-float">
          <rect x="420" y="180" width="70" height="18" rx="9" />
          <rect x="440" y="166" width="42" height="18" rx="9" />
        </g>
      </g>

      {/* route arc + endpoints */}
      <path
        d="M 78 158 Q 320 30 562 128"
        fill="none"
        stroke="#B79BE3"
        strokeWidth="2.5"
        strokeLinecap="round"
        className="route-dash"
        opacity="0.8"
      />
      <g aria-hidden>
        <circle cx="78" cy="158" r="14" fill="#4D148C" opacity="0.15" />
        <circle cx="78" cy="158" r="6.5" fill="#4D148C" />
        <circle cx="78" cy="158" r="2.4" fill="#fff" />
      </g>
      <g aria-hidden>
        <circle cx="562" cy="128" r="14" fill="#FF6600" opacity="0.16" />
        <circle cx="562" cy="128" r="6.5" fill="#FF6600" />
        <circle cx="562" cy="128" r="2.4" fill="#fff" />
      </g>
      {/* plane on route */}
      <g transform="translate(300, 62) rotate(8)" aria-hidden>
        <path d="M -16 3 L 8 3 L 17 -3 L 12 3 L 14 8 L 4 6 L -10 9 Z" fill="#4D148C" />
        <circle cx="-19" cy="3" r="2.2" fill="#FF6600" />
      </g>

      {/* skyline */}
      <g aria-hidden>
        <rect x="34" y="330" width="46" height="108" rx="4" fill="#C9B4E8" />
        <rect x="86" y="300" width="52" height="138" rx="4" fill="#B79BE3" />
        <rect x="144" y="352" width="40" height="86" rx="4" fill="#D9C9F0" />
        {[
          [46, 344], [58, 344], [46, 366], [58, 366],
          [98, 316], [112, 316], [126, 316], [98, 338], [112, 338], [126, 338],
          [154, 364], [166, 364], [154, 386],
        ].map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x} y={y} width="10" height="10" rx="1.5" fill="#FFFFFF" opacity="0.65" />
        ))}
      </g>

      {/* road */}
      <rect x="20" y="438" width="600" height="26" rx="13" fill="#E3DAF3" />
      {Array.from({ length: 12 }).map((_, i) => (
        <rect key={i} x={44 + i * 50} y="449" width="26" height="4" rx="2" fill="#FFFFFF" opacity="0.9" />
      ))}

      {/* truck */}
      <g transform="translate(148, 250)" aria-hidden>
        <ellipse cx="190" cy="196" rx="168" ry="12" fill="#1F0740" opacity="0.10" />
        {/* motion lines */}
        <g stroke="#8F5FD0" strokeWidth="6" strokeLinecap="round" opacity="0.3">
          <line x1="-52" y1="76" x2="6" y2="76" />
          <line x1="-38" y1="102" x2="10" y2="102" />
          <line x1="-58" y1="128" x2="0" y2="128" />
        </g>
        {/* chassis */}
        <rect x="52" y="146" width="316" height="14" rx="7" fill="#2E0B57" />
        {/* container */}
        <rect x="52" y="52" width="234" height="96" rx="12" fill="url(#hs-orange)" />
        <line x1="112" y1="58" x2="112" y2="142" stroke="#FFFFFF" opacity="0.18" strokeWidth="3" />
        <line x1="172" y1="58" x2="172" y2="142" stroke="#FFFFFF" opacity="0.18" strokeWidth="3" />
        <line x1="232" y1="58" x2="232" y2="142" stroke="#FFFFFF" opacity="0.18" strokeWidth="3" />
        <text x="169" y="112" textAnchor="middle" fontSize="36" fontWeight="900" letterSpacing="-1">
          <tspan fill="#FFFFFF">Fed</tspan>
          <tspan fill="#4D148C">Ex</tspan>
        </text>
        {/* cab */}
        <path
          d="M 286 148 L 286 84 Q 286 70 300 70 L 330 70 Q 342 70 348 80 L 364 108 Q 368 114 368 122 L 368 148 Z"
          fill="url(#hs-purple)"
        />
        <path
          d="M 298 84 L 328 84 Q 336 84 340 91 L 350 108 L 298 108 Z"
          fill="#EDE6F8"
        />
        <rect x="286" y="126" width="86" height="12" rx="6" fill="#1F0740" />
        <circle cx="360" cy="136" r="4.5" fill="#FFC39E" />
        {/* wheels */}
        {[100, 164, 322].map((cx) => (
          <g key={cx}>
            <circle cx={cx} cy="176" r="22" fill="#241239" />
            <circle cx={cx} cy="176" r="9.5" fill="#B79BE3" />
            <circle cx={cx} cy="176" r="3" fill="#4D148C" />
          </g>
        ))}
      </g>

      {/* floating status card */}
      <g className="svg-float" aria-hidden>
        <rect x="398" y="56" width="200" height="92" rx="14" fill="#1F0740" opacity="0.07" />
        <rect x="394" y="52" width="200" height="92" rx="14" fill="#FFFFFF" stroke="#EDE6F8" />
        <circle cx="418" cy="76" r="11" fill="#16A34A" />
        <path d="M 412.5 76 L 416.5 80 L 424 72.5" stroke="#FFFFFF" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <text x="438" y="80" fontSize="13" fontWeight="800" fill="#17131F">
          Out for delivery
        </text>
        <text x="418" y="99" fontSize="10.5" fontWeight="600" fill="#8A8494">
          Arriving today by 8:00 PM
        </text>
        <rect x="414" y="110" width="160" height="7" rx="3.5" fill="#EFEAF6" />
        <rect x="414" y="110" width="122" height="7" rx="3.5" fill="url(#hs-progress)" />
      </g>

      {/* floating package card */}
      <g className="svg-float-slow" style={{ animationDelay: '1.2s' }} aria-hidden>
        <rect x="46" y="236" width="186" height="70" rx="14" fill="#1F0740" opacity="0.07" />
        <rect x="42" y="232" width="186" height="70" rx="14" fill="#FFFFFF" stroke="#EDE6F8" />
        <rect x="58" y="248" width="38" height="34" rx="7" fill="url(#hs-orange)" />
        <line x1="77" y1="250" x2="77" y2="280" stroke="#FFFFFF" strokeWidth="4" opacity="0.7" />
        <text x="108" y="264" fontSize="12.5" fontWeight="800" fill="#17131F" fontFamily="monospace">
          7946 5891 2345
        </text>
        <circle cx="112" cy="282" r="3.5" fill="#16A34A" />
        <text x="122" y="286" fontSize="10.5" fontWeight="700" fill="#8A8494">
          On time · Same Day
        </text>
      </g>
    </svg>
  )
}
