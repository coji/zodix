// Parser implementation for Zod v4
import type { Params } from 'react-router'
import * as z from 'zod/v4'
import { createErrorResponse } from './errors'

type Options<Parser = SearchParamsParser> = {
  message?: string
  status?: number
  parser?: Parser
}

type SearchParamsParser = (searchParams: URLSearchParams) => Record<string, any>
export type FormDataParser = (formData: FormData) => Record<string, any>

// Use flexible type constraints for broader compatibility with both Classic and Core APIs
// Support dynamic schemas with Record<string, any>
export type ParsedData<T> =
  T extends z.ZodType<any, any, any>
    ? z.output<T>
    : T extends Record<string, any>
      ? {
          [K in keyof T]: T[K] extends z.ZodType<any, any, any>
            ? z.output<T[K]>
            : never
        }
      : never

// Import ZodSafeParseResult type directly
import type { ZodSafeParseResult } from 'zod/v4/classic/parse'

export type SafeParsedData<T> =
  T extends z.ZodType<any, any, any>
    ? ZodSafeParseResult<z.output<T>>
    : T extends Record<string, any>
      ? ZodSafeParseResult<{
          [K in keyof T]: T[K] extends z.ZodType<any, any, any>
            ? z.output<T[K]>
            : never
        }>
      : never

/**
 * Type helper to infer the parsed output type from a schema.
 * Useful for explicitly typing variables when using dynamic schemas.
 *
 * @example
 * ```typescript
 * const mySchema = {
 *   q: z.string().optional(),
 *   page: zx.IntAsString,
 *   category: z.string().optional()
 * } as const
 *
 * type Params = InferParams<typeof mySchema>
 * // → { q: string | undefined, page: number, category: string | undefined }
 * ```
 */
export type InferParams<T> = ParsedData<T>

function isZodV4Schema(value: unknown): value is z.ZodTypeAny {
  return typeof value === 'object' && value !== null && '_zod' in value
}

export function parseParams<T>(
  params: Params,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : z.object(schema as Record<string, any>)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseParamsSafe<T>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : z.object(schema as Record<string, any>)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

export function parseQuery<T>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const searchParams = isURLSearchParams(request)
      ? request
      : getSearchParamsFromRequest(request)
    const params = parseSearchParams(searchParams, options?.parser)
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : z.object(schema as Record<string, any>)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseQuerySafe<T>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options,
): SafeParsedData<T> {
  const searchParams = isURLSearchParams(request)
    ? request
    : getSearchParamsFromRequest(request)
  const params = parseSearchParams(searchParams, options?.parser)
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : z.object(schema as Record<string, any>)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

export async function parseForm<T>(
  request: Request | FormData,
  schema: T,
  options?: Options<FormDataParser>,
): Promise<ParsedData<T>> {
  try {
    const formData =
      request instanceof FormData ? request : await request.formData()
    const params = options?.parser
      ? options.parser(formData)
      : parseFormData(formData)
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : z.object(schema as Record<string, any>)
    return (await finalSchema.parseAsync(params)) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export async function parseFormSafe<T>(
  request: Request | FormData,
  schema: T,
  options?: Options<FormDataParser>,
): Promise<SafeParsedData<T>> {
  const formData =
    request instanceof FormData ? request : await request.formData()
  const params = options?.parser
    ? options.parser(formData)
    : parseFormData(formData)
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : z.object(schema as Record<string, any>)
  return finalSchema.safeParseAsync(params) as Promise<SafeParsedData<T>>
}

// Helper functions
function isURLSearchParams(value: unknown): value is URLSearchParams {
  return value instanceof URLSearchParams
}

function getSearchParamsFromRequest(request: Request): URLSearchParams {
  return new URL(request.url).searchParams
}

const defaultSearchParamsParser: SearchParamsParser = (searchParams) => {
  const params: Record<string, string | string[]> = {}
  for (const [key, value] of searchParams.entries()) {
    if (!(key in params)) {
      params[key] = value
    } else if (Array.isArray(params[key])) {
      ;(params[key] as string[]).push(value)
    } else {
      params[key] = [params[key] as string, value]
    }
  }
  return params
}

function parseSearchParams(
  searchParams: URLSearchParams,
  parser?: SearchParamsParser,
): Record<string, any> {
  return parser ? parser(searchParams) : defaultSearchParamsParser(searchParams)
}

function parseFormData(formData: FormData): Record<string, any> {
  const params: Record<string, any> = {}
  for (const key of formData.keys()) {
    const values = formData.getAll(key)
    params[key] = values.length > 1 ? values : values[0]
  }
  return params
}
