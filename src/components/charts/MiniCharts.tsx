export interface ChartDatum {
  label: string
  value: number
  color: string
}

/** Minimal dependency-free horizontal bar chart. */
export function BarChartMini({ data }: { data: ChartDatum[] }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className="space-y-2.5" role="img" aria-label="Shipments by status">
      {data.map((d) => (
        <div key={d.label} className="flex items-center gap-3">
          <span className="w-28 shrink-0 truncate text-xs font-bold text-gray-500">{d.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${(d.value / max) * 100}%`, backgroundColor: d.color }}
            />
          </div>
          <span className="w-8 text-right text-xs font-extrabold text-ink">{d.value}</span>
        </div>
      ))}
    </div>
  )
}

/** Minimal dependency-free donut chart. */
export function DonutMini({ data, centerLabel, centerValue }: { data: ChartDatum[]; centerLabel: string; centerValue: string | number }) {
  const total = data.reduce((s, d) => s + d.value, 0)
  const R = 15.915 // circumference = 100
  let offset = 25
  return (
    <div className="flex items-center gap-6">
      <svg viewBox="0 0 42 42" className="h-36 w-36 shrink-0 -rotate-0" role="img" aria-label={centerLabel}>
        <circle cx="21" cy="21" r={R} fill="none" stroke="#EFEAF6" strokeWidth="5" />
        {total > 0 &&
          data.map((d) => {
            const pct = (d.value / total) * 100
            const el = (
              <circle
                key={d.label}
                cx="21"
                cy="21"
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth="5"
                strokeDasharray={`${pct} ${100 - pct}`}
                strokeDashoffset={offset}
                strokeLinecap="butt"
              />
            )
            offset -= pct
            return el
          })}
        <text x="21" y="20" textAnchor="middle" fontSize="6.5" fontWeight="900" fill="#17131F">
          {centerValue}
        </text>
        <text x="21" y="26" textAnchor="middle" fontSize="3" fontWeight="700" fill="#8A8494">
          {centerLabel}
        </text>
      </svg>
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.label} className="flex items-center gap-2 text-xs">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} aria-hidden />
            <span className="flex-1 truncate font-semibold text-gray-600">{d.label}</span>
            <span className="font-extrabold text-ink">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
