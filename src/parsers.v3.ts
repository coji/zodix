// Zod v3専用のパーサー実装
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

export type ParsedData<T extends z3.ZodRawShape | z3.ZodTypeAny> =
  T extends z3.ZodTypeAny
    ? z3.output<T>
    : T extends z3.ZodRawShape
      ? z3.output<z3.ZodObject<T>>
      : never

export type SafeParsedData<T extends z3.ZodRawShape | z3.ZodTypeAny> =
  T extends z3.ZodTypeAny
    ? z3.SafeParseReturnType<any, z3.output<T>>
    : T extends z3.ZodRawShape
      ? z3.SafeParseReturnType<any, z3.output<z3.ZodObject<T>>>
      : never

function isZodV3Schema(value: unknown): value is z3.ZodTypeAny {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_def' in value &&
    !('_zod' in value)
  )
}

function createV3ObjectSchema(
  shape: z3.ZodRawShape,
): z3.ZodObject<z3.ZodRawShape> {
  return z3.object(shape)
}

export function parseParams<T extends z3.ZodRawShape | z3.ZodTypeAny>(
  params: Params,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const finalSchema = isZodV3Schema(schema)
      ? (schema as z3.ZodTypeAny)
      : createV3ObjectSchema(schema as z3.ZodRawShape)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseParamsSafe<T extends z3.ZodRawShape | z3.ZodTypeAny>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodV3Schema(schema)
    ? (schema as z3.ZodTypeAny)
    : createV3ObjectSchema(schema as z3.ZodRawShape)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

export function parseQuery<T extends z3.ZodRawShape | z3.ZodTypeAny>(
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
      ? (schema as z3.ZodTypeAny)
      : createV3ObjectSchema(schema as z3.ZodRawShape)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseQuerySafe<T extends z3.ZodRawShape | z3.ZodTypeAny>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options,
): SafeParsedData<T> {
  const searchParams = isURLSearchParams(request)
    ? request
    : getSearchParamsFromRequest(request)
  const params = parseSearchParams(searchParams, options?.parser)
  const finalSchema = isZodV3Schema(schema)
    ? (schema as z3.ZodTypeAny)
    : createV3ObjectSchema(schema as z3.ZodRawShape)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

export async function parseForm<T extends z3.ZodRawShape | z3.ZodTypeAny>(
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
      ? (schema as z3.ZodTypeAny)
      : createV3ObjectSchema(schema as z3.ZodRawShape)
    return (await finalSchema.parseAsync(params)) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export async function parseFormSafe<T extends z3.ZodRawShape | z3.ZodTypeAny>(
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
    ? (schema as z3.ZodTypeAny)
    : createV3ObjectSchema(schema as z3.ZodRawShape)

  // Zod v3のsafeParseAsyncを使用
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
