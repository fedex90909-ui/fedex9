import { Check } from 'lucide-react'

interface StepProgressProps {
  steps: string[]
  current: number // 1-based
  onStepClick?: (step: number) => void
}

export default function StepProgress({ steps, current, onStepClick }: StepProgressProps) {
  return (
    <ol className="flex items-center" aria-label="Checkout steps">
      {steps.map((label, i) => {
        const n = i + 1
        const done = n < current
        const active = n === current
        const clickable = done && onStepClick
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none">
            <button
              type="button"
              onClick={clickable ? () => onStepClick!(n) : undefined}
              disabled={!clickable}
              aria-current={active ? 'step' : undefined}
              className={`group flex items-center gap-2.5 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
            >
              <span
                className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-sm font-extrabold transition-all duration-300 ${
                  done
                    ? 'bg-fx-purple-600 text-white'
                    : active
                      ? 'bg-fx-orange-500 text-white shadow-btn-orange ring-4 ring-fx-orange-100'
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {done ? <Check size={16} aria-hidden /> : n}
              </span>
              <span
                className={`hidden text-sm font-bold sm:block ${
                  active ? 'text-ink' : done ? 'text-fx-purple-700' : 'text-gray-400'
                }`}
              >
                {label}
              </span>
            </button>
            {n < steps.length && (
              <span
                aria-hidden
                className={`mx-3 h-0.5 flex-1 rounded-full transition-colors duration-500 ${
                  n < current ? 'bg-fx-purple-600' : 'bg-gray-200'
                }`}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}
