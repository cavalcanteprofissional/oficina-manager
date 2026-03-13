'use client'

import { useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { consultarCEP, CEPResponse } from '@/lib/utils/cep'

interface CEPInputProps {
  label?: string
  name: string
  value?: string
  defaultValue?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onCepFound?: (data: CEPResponse) => void
  required?: boolean
  className?: string
}

export function CEPInput({
  label = 'CEP',
  name,
  value,
  defaultValue = '',
  onChange,
  onCepFound,
  required = false,
  className = ''
}: CEPInputProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [inputValue, setInputValue] = useState(value || defaultValue || '')

  const handleSearch = async () => {
    const cepToSearch = inputValue || value
    if (!cepToSearch || cepToSearch.replace(/\D/g, '').length !== 8) {
      setError('CEP inválido')
      return
    }

    setLoading(true)
    setError('')

    const data = await consultarCEP(cepToSearch)

    setLoading(false)

    if (data) {
      onCepFound?.(data)
    } else {
      setError('CEP não encontrado')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    onChange?.(e)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSearch()
    }
  }

  return (
    <div className={className}>
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex gap-2">
        <input
          id={name}
          name={name}
          type="text"
          value={value !== undefined ? value : inputValue}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={loading}
          className="px-3 py-2 bg-primary text-white rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          {loading ? (
            <Loader2 size={18} className="animate-spin" />
          ) : (
            <Search size={18} />
          )}
        </button>
      </div>
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  )
}
