// Zod v4専用のパーサー実装
import type { Params } from 'react-router'
import { z } from 'zod/v4'
import type { ZodSafeParseResult } from 'zod/v4/classic/parse'
import * as z4 from 'zod/v4/core'
import { createErrorResponse } from './errors'

type Options<Parser = SearchParamsParser> = {
  message?: string
  status?: number
  parser?: Parser
}

type SearchParamsParser = (searchParams: URLSearchParams) => Record<string, any>
export type FormDataParser = (formData: FormData) => Record<string, any>

export type ParsedData<T extends Record<string, z4.$ZodType> | z4.$ZodType> =
  T extends z4.$ZodType
    ? z4.output<T>
    : T extends Record<string, z4.$ZodType>
      ? z4.output<z4.$ZodObject<T>>
      : never

export type SafeParsedData<
  T extends Record<string, z4.$ZodType> | z4.$ZodType,
> = T extends z4.$ZodType
  ? ZodSafeParseResult<z4.output<T>>
  : T extends Record<string, z4.$ZodType>
    ? ZodSafeParseResult<z4.output<z4.$ZodObject<T>>>
    : never

function isZodV4Schema(value: unknown): value is z4.$ZodType {
  return typeof value === 'object' && value !== null && '_zod' in value
}

function createV4ObjectSchema(
  shape: Record<string, z4.$ZodType>,
): z4.$ZodObject {
  // Zod v4 coreには`object`関数がないため、v4 classicのz.objectを使用
  // z.objectはZodObjectを返すが、内部的には$ZodObjectなので型アサーションが必要
  return z.object(shape as any) as z4.$ZodObject
}

export function parseParams<
  T extends Record<string, z4.$ZodType> | z4.$ZodType,
>(params: Params, schema: T, options?: Options): ParsedData<T> {
  try {
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : createV4ObjectSchema(schema as Record<string, z4.$ZodType>)
    return z4.parse(finalSchema, params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseParamsSafe<
  T extends Record<string, z4.$ZodType> | z4.$ZodType,
>(params: Params, schema: T): SafeParsedData<T> {
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : createV4ObjectSchema(schema as Record<string, z4.$ZodType>)
  return z4.safeParse(finalSchema, params) as SafeParsedData<T>
}

export function parseQuery<T extends Record<string, z4.$ZodType> | z4.$ZodType>(
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
      : createV4ObjectSchema(schema as Record<string, z4.$ZodType>)
    return z4.parse(finalSchema, params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export function parseQuerySafe<
  T extends Record<string, z4.$ZodType> | z4.$ZodType,
>(
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
    : createV4ObjectSchema(schema as Record<string, z4.$ZodType>)
  return z4.safeParse(finalSchema, params) as SafeParsedData<T>
}

export async function parseForm<
  T extends Record<string, z4.$ZodType> | z4.$ZodType,
>(
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
      : createV4ObjectSchema(schema as Record<string, z4.$ZodType>)
    return (await z4.parseAsync(finalSchema, params)) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

export async function parseFormSafe<
  T extends Record<string, z4.$ZodType> | z4.$ZodType,
>(
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
    : createV4ObjectSchema(schema as Record<string, z4.$ZodType>)
  return z4.safeParseAsync(finalSchema, params) as Promise<SafeParsedData<T>>
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
