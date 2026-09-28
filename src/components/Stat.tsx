import { useEffect, useRef, useState } from 'react'

function useCountUp(target: number, start: boolean, duration = 1600): number {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let raf = 0
    const t0 = performance.now()
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration)
      const eased = 1 - Math.pow(1 - p, 3)
      setValue(target * eased)
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [start, target, duration])
  return value
}

interface StatProps {
  value: number
  suffix?: string
  prefix?: string
  decimals?: number
  label: string
  light?: boolean
}

/** Animated count-up statistic; starts when scrolled into view. */
export default function Stat({
  value,
  suffix = '',
  prefix = '',
  decimals = 0,
  label,
  light = false,
}: StatProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [started, setStarted] = useState(false)
  const current = useCountUp(value, started)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (typeof IntersectionObserver === 'undefined') {
      setStarted(true)
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          setStarted(true)
          io.disconnect()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const display = current.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

  return (
    <div ref={ref} className="text-center">
      <p
        className={`text-4xl font-black tracking-tight sm:text-5xl ${
          light ? 'text-white' : 'text-fx-purple-700'
        }`}
      >
        {prefix}
        {display}
        <span className="text-fx-orange-500">{suffix}</span>
      </p>
      <p
        className={`mt-2 text-sm font-semibold ${
          light ? 'text-purple-200/80' : 'text-gray-500'
        }`}
      >
        {label}
      </p>
    </div>
  )
}
