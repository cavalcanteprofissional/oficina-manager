import { NextResponse } from 'next/server'
import { ZodError, type ZodSchema } from 'zod'

export function validateBody<T>(schema: ZodSchema<T>, body: unknown): { data: T; error?: undefined } | { data?: undefined; error: NextResponse } {
  const result = schema.safeParse(body)
  if (!result.success) {
    const errors = result.error.flatten()
    return { error: NextResponse.json({ error: 'Dados inválidos', details: errors.fieldErrors }, { status: 400 }) }
  }
  return { data: result.data }
}
