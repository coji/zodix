import type * as z3 from 'zod/v3'
import type * as z4 from 'zod/v4/core'

export function isZodV4Schema(schema: unknown): schema is z4.$ZodType {
  return schema != null && typeof schema === 'object' && '_zod' in schema
}

export function isZodV3Schema(schema: unknown): schema is z3.ZodTypeAny {
  return (
    schema != null &&
    typeof schema === 'object' &&
    '_def' in schema &&
    !('_zod' in schema)
  )
}

export function isZodSchema(schema: unknown): boolean {
  return isZodV3Schema(schema) || isZodV4Schema(schema)
}
