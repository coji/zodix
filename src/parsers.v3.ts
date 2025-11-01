// Parser implementation for Zod v3
import type { Params } from 'react-router'
import * as z3 from 'zod/v3'
import { createErrorResponse } from './errors'

type Options<Parser = SearchParamsParser> = {
  message?: string
  status?: number
  parser?: Parser
}

type SearchParamsParser = (searchParams: URLSearchParams) => Record<string, any>
export type FormDataParser = (formData: FormData) => Record<string, any>

// For Zod v3, we use 'any' return types to avoid "Type instantiation is excessively deep"
// errors that occur with complex conditional types in Zod v3's type system
export type ParsedData<T> = any

export type SafeParsedData<T> = z3.SafeParseReturnType<any, any>

function isZodV3Schema(value: unknown): value is z3.ZodTypeAny {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_def' in value &&
    !('_zod' in value)
  )
}

export function parseParams<T>(
  params: Params,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const finalSchema = isZodV3Schema(schema)
      ? schema
      : z3.object(schema as Record<string, any>)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseParamsSafe<T>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodV3Schema(schema)
    ? schema
    : z3.object(schema as Record<string, any>)
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
    const finalSchema = isZodV3Schema(schema)
      ? schema
      : z3.object(schema as Record<string, any>)
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
  const finalSchema = isZodV3Schema(schema)
    ? schema
    : z3.object(schema as Record<string, any>)
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
    const finalSchema = isZodV3Schema(schema)
      ? schema
      : z3.object(schema as Record<string, any>)
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
  const finalSchema = isZodV3Schema(schema)
    ? schema
    : z3.object(schema as Record<string, any>)

  // Use Zod v3's safeParseAsync
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
