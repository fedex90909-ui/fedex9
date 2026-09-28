import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export interface FaqItem {
  q: string
  a: string
}

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  return (
    <div className="divide-y divide-gray-200 rounded-2xl border border-gray-200/70 bg-white shadow-card">
      {items.map((item, i) => {
        const open = openIndex === i
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50/80"
            >
              <span
                className={`text-[15px] font-bold transition-colors ${
                  open ? 'text-fx-purple-700' : 'text-ink'
                }`}
              >
                {item.q}
              </span>
              <span
                className={`grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-300 ${
                  open
                    ? 'rotate-180 bg-fx-orange-500 text-white'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <ChevronDown size={16} aria-hidden />
              </span>
            </button>
            <div className={`acc-panel ${open ? 'open' : ''}`}>
              <div className="acc-inner">
                <p className="px-6 pb-6 text-sm leading-relaxed text-gray-600">
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
