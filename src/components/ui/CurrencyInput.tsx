'use client'

import { InputHTMLAttributes, forwardRef, useCallback } from 'react'

interface CurrencyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: number
  onChange: (value: number) => void
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onChange, className = '', ...props }, ref) => {
    const formatValue = (val: number) =>
      new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 }).format(val)

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value.replace(/[^\d,]/g, '').replace(',', '.')
      const num = parseFloat(raw)
      onChange(isNaN(num) ? 0 : num)
    }, [onChange])

    return (
      <input
        ref={ref}
        type="text"
        inputMode="decimal"
        value={formatValue(value)}
        onChange={handleChange}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
        {...props}
      />
    )
  }
)

CurrencyInput.displayName = 'CurrencyInput'
