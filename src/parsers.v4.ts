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

// Use Classic API types - ZodTypeAny supports both classic and core
export type ParsedData<T extends z.ZodRawShape | z.ZodTypeAny> =
  T extends z.ZodTypeAny
    ? z.output<T>
    : T extends z.ZodRawShape
      ? z.output<z.ZodObject<T>>
      : never

// Import ZodSafeParseResult type directly
import type { ZodSafeParseResult } from 'zod/v4/classic/parse'

export type SafeParsedData<T extends z.ZodRawShape | z.ZodTypeAny> =
  T extends z.ZodTypeAny
    ? ZodSafeParseResult<z.output<T>>
    : T extends z.ZodRawShape
      ? ZodSafeParseResult<z.output<z.ZodObject<T>>>
      : never

function isZodV4Schema(value: unknown): value is z.ZodTypeAny {
  return typeof value === 'object' && value !== null && '_zod' in value
}

export function parseParams<T extends z.ZodRawShape | z.ZodTypeAny>(
  params: Params,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : z.object(schema as z.ZodRawShape)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseParamsSafe<T extends z.ZodRawShape | z.ZodTypeAny>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : z.object(schema as z.ZodRawShape)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

export function parseQuery<T extends z.ZodRawShape | z.ZodTypeAny>(
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
      : z.object(schema as z.ZodRawShape)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseQuerySafe<T extends z.ZodRawShape | z.ZodTypeAny>(
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
    : z.object(schema as z.ZodRawShape)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

export async function parseForm<T extends z.ZodRawShape | z.ZodTypeAny>(
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
      : z.object(schema as z.ZodRawShape)
    return (await finalSchema.parseAsync(params)) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export async function parseFormSafe<T extends z.ZodRawShape | z.ZodTypeAny>(
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
    : z.object(schema as z.ZodRawShape)
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
