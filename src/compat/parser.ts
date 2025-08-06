import type * as z3 from 'zod/v3'
import * as z4 from 'zod/v4/core'
import type { OutputCompat, ZodSchemaCompat } from '../types/compat'
import { isZodV4Schema } from '../types/guards'

export function parseCompat<T extends ZodSchemaCompat>(
  schema: T,
  data: unknown,
): OutputCompat<T> {
  if (isZodV4Schema(schema)) {
    // v4/core の正しい使い方: z4.parse(schema, data)
    return z4.parse(schema, data) as OutputCompat<T>
  } else {
    return (schema as z3.ZodTypeAny).parse(data) as OutputCompat<T>
  }
}

export function safeParseCompat<T extends ZodSchemaCompat>(
  schema: T,
  data: unknown,
) {
  if (isZodV4Schema(schema)) {
    // v4/core の正しい使い方: z4.safeParse(schema, data)
    return z4.safeParse(schema, data)
  } else {
    return (schema as z3.ZodTypeAny).safeParse(data)
  }
}

export async function parseAsyncCompat<T extends ZodSchemaCompat>(
  schema: T,
  data: unknown,
): Promise<OutputCompat<T>> {
  if (isZodV4Schema(schema)) {
    // v4/core の正しい使い方: z4.parseAsync(schema, data)
    return z4.parseAsync(schema, data) as Promise<OutputCompat<T>>
  } else {
    return (schema as z3.ZodTypeAny).parseAsync(data) as Promise<
      OutputCompat<T>
    >
  }
}
