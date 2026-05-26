'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

const supabase = createClient()

export function useSupabaseQuery<T>(
  table: string,
  options?: {
    columns?: string
    filters?: Record<string, string | number | boolean | null>
    orderBy?: { column: string; ascending?: boolean }
    limit?: number
  }
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    let query = supabase.from(table).select(options?.columns || '*')

    if (options?.filters) {
      for (const [key, value] of Object.entries(options.filters)) {
        if (value !== undefined && value !== null && value !== '') {
          query = query.eq(key, value)
        }
      }
    }

    if (options?.orderBy) {
      query = query.order(options.orderBy.column, { ascending: options.orderBy.ascending ?? true })
    }

    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data: result, error: err } = await query

    if (err) {
      setError(err.message)
    } else {
      setData(result as T[])
    }
    setLoading(false)
  }, [
    table,
    options?.columns,
    options?.orderBy?.column,
    options?.orderBy?.ascending,
    options?.limit,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

export function usePagination<T>(
  fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
  pageSize = 10
) {
  const [data, setData] = useState<T[]>([])
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const totalPages = Math.max(1, Math.ceil(total / pageSize))

  const fetchPage = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const result = await fetchFn(p, pageSize)
      setData(result.data)
      setTotal(result.total)
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }, [fetchFn, pageSize])

  useEffect(() => {
    fetchPage(page)
  }, [page, fetchPage])

  return { data, loading, page, totalPages, total, setPage, refetch: () => fetchPage(page) }
}
