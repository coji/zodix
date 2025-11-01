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
// biome-ignore lint/correctness/noUnusedVariables: T is used for API consistency with v4
export type ParsedData<T> = any

// biome-ignore lint/correctness/noUnusedVariables: T is used for API consistency with v4
export type SafeParsedData<T> = z3.SafeParseReturnType<any, any>

/**
 * Type helper to infer the parsed output type from a schema.
 *
 * **Note for Zod v3 users**: Due to TypeScript limitations with Zod v3's type system,
 * this will infer as `any` when using Record-style dynamic schemas.
 * For better type safety with Zod v3, use `z.object().extend()` instead.
 *
 * @example
 * ```typescript
 * // With Zod v3, prefer z.object().extend() for type safety:
 * const baseSchema = z.object({
 *   q: z.string().optional(),
 *   page: zx.IntAsString.optional(),
 * })
 *
 * const dynamicFields = categories.reduce((acc, cat) => ({
 *   ...acc,
 *   [cat.id]: z.string().optional()
 * }), {})
 *
 * const fullSchema = baseSchema.extend(dynamicFields)
 * type Params = z.infer<typeof fullSchema>  // Full type inference!
 * ```
 */
export type InferParams<T> = ParsedData<T>

function isZodV3Schema(value: unknown): value is z3.ZodTypeAny {
  return (
    typeof value === 'object' &&
    value !== null &&
    '_def' in value &&
    !('_zod' in value)
  )
}

/**
 * Parses and validates URL parameters from React Router using a Zod schema.
 * Throws a 400 Response if validation fails, suitable for error boundaries.
 *
 * **Note for Zod v3 users**: Type inference may return `any` for complex schemas due to
 * TypeScript limitations. Runtime validation still works correctly.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param params - The params object from Route.LoaderArgs or Route.ActionArgs
 * @param schema - Zod schema or object shape defining the expected structure
 * @param options - Optional configuration (message, status, parser)
 * @returns Parsed and validated params
 * @throws Response with 400 status if validation fails
 *
 * @example
 * ```typescript
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const { userId, postId } = zx.parseParams(params, {
 *     userId: z.string(),
 *     postId: zx.IntAsString,
 *   })
 * }
 * ```
 *
 * @see {@link parseParamsSafe} for non-throwing version
 */
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

/**
 * Safely parses and validates URL parameters using a Zod schema.
 * Returns a result object instead of throwing.
 *
 * @see {@link parseParams} for throwing version
 */
export function parseParamsSafe<T>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodV3Schema(schema)
    ? schema
    : z3.object(schema as Record<string, any>)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

/**
 * Parses and validates query string parameters using a Zod schema.
 * Throws a 400 Response if validation fails.
 *
 * **Note for Zod v3 users**: For dynamic schemas, consider using URLSearchParams
 * directly to avoid TypeScript depth errors. See docs/dynamic-schemas.md
 *
 * @see {@link parseQuerySafe} for non-throwing version
 * @see {@link https://github.com/coji/zodix/blob/main/docs/dynamic-schemas.md} for dynamic schema patterns
 */
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

/**
 * Safely parses and validates query string parameters using a Zod schema.
 * Returns a result object instead of throwing.
 *
 * @see {@link parseQuery} for throwing version
 */
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

/**
 * Parses and validates FormData from a React Router action using a Zod schema.
 * Throws a 400 Response if validation fails.
 *
 * **Note for Zod v3 users**: Type inference may return `any` for complex schemas.
 * Runtime validation still works correctly.
 *
 * @see {@link parseFormSafe} for non-throwing version
 */
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

/**
 * Safely parses and validates FormData using a Zod schema.
 * Returns a result object instead of throwing.
 *
 * @see {@link parseForm} for throwing version
 */
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
