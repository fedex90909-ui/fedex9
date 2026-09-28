import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react'

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  required?: boolean
  hint?: string
}

export function Field({ label, error, required, hint, id, ...input }: FieldProps) {
  const fieldId = id ?? input.name
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
        {required && <span className="ml-0.5 text-fx-orange-600">*</span>}
      </label>
      <input
        id={fieldId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${fieldId}-error` : undefined}
        className={`input ${error ? 'input-error' : ''}`}
        {...input}
      />
      {hint && !error && <p className="mt-1.5 text-xs text-gray-400">{hint}</p>}
      {error && (
        <p className="error-text" id={`${fieldId}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  error?: string
  required?: boolean
  children: ReactNode
}

export function SelectField({
  label,
  error,
  required,
  children,
  id,
  ...select
}: SelectFieldProps) {
  const fieldId = id ?? select.name
  return (
    <div>
      <label htmlFor={fieldId} className="label">
        {label}
        {required && <span className="ml-0.5 text-fx-orange-600">*</span>}
      </label>
      <select
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={`input ${error ? 'input-error' : ''} ${!select.value ? 'text-gray-400' : ''}`}
        {...select}
      >
        {children}
      </select>
      {error && (
        <p className="error-text" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}
