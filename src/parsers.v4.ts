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

/**
 * Parses and validates URL parameters from React Router using a Zod schema.
 * Throws a 400 Response if validation fails, suitable for error boundaries.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param params - The params object from Route.LoaderArgs or Route.ActionArgs
 * @param schema - Zod schema or object shape defining the expected structure
 * @param options - Optional configuration (message, status, parser)
 * @returns Parsed and validated params with full type inference
 * @throws Response with 400 status if validation fails
 *
 * @example
 * ```typescript
 * // Using object shape (recommended for simple cases)
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const { userId, postId } = zx.parseParams(params, {
 *     userId: z.string(),
 *     postId: zx.IntAsString,
 *   })
 *   // userId is string, postId is number
 * }
 *
 * // Using Zod schema (for reusable schemas)
 * const ParamsSchema = z.object({
 *   userId: z.string(),
 *   postId: zx.IntAsString,
 * })
 *
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const { userId, postId } = zx.parseParams(params, ParamsSchema)
 * }
 *
 * // With custom error message
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const { postId } = zx.parseParams(
 *     params,
 *     { postId: zx.IntAsString },
 *     { message: "Invalid post ID", status: 400 }
 *   )
 * }
 * ```
 *
 * @see {@link parseParamsSafe} for non-throwing version
 * @see {@link https://github.com/coji/zodix/blob/main/docs/dynamic-schemas.md} for dynamic schema patterns
 */
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

/**
 * Safely parses and validates URL parameters from React Router using a Zod schema.
 * Returns a result object instead of throwing, suitable for custom error handling.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param params - The params object from Route.LoaderArgs or Route.ActionArgs
 * @param schema - Zod schema or object shape defining the expected structure
 * @returns Result object with { success: boolean, data?, error? }
 *
 * @example
 * ```typescript
 * export async function loader({ params }: Route.LoaderArgs) {
 *   const result = zx.parseParamsSafe(params, {
 *     userId: z.string(),
 *     postId: zx.IntAsString,
 *   })
 *
 *   if (!result.success) {
 *     return { error: result.error.issues }
 *   }
 *
 *   const { userId, postId } = result.data
 *   // Use validated data
 * }
 * ```
 *
 * @see {@link parseParams} for throwing version
 */
export function parseParamsSafe<T>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : z.object(schema as Record<string, any>)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

/**
 * Parses and validates query string parameters (URLSearchParams) using a Zod schema.
 * Throws a 400 Response if validation fails, suitable for error boundaries.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param request - Request object or URLSearchParams instance
 * @param schema - Zod schema or object shape defining the expected structure
 * @param options - Optional configuration (message, status, parser)
 * @returns Parsed and validated query params with full type inference
 * @throws Response with 400 status if validation fails
 *
 * @example
 * ```typescript
 * // Basic usage
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const { q, page } = zx.parseQuery(request, {
 *     q: z.string().optional(),
 *     page: zx.IntAsString.default(1),
 *   })
 *   // q is string | undefined, page is number
 * }
 *
 * // With dynamic schema (Zod v4)
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const categories = await getCategories()
 *
 *   const baseSchema = z.object({
 *     q: z.string().optional(),
 *   })
 *
 *   const dynamicFields = Object.fromEntries(
 *     categories.map(cat => [cat.id, z.string().optional()])
 *   )
 *
 *   const fullSchema = baseSchema.extend(dynamicFields)
 *   const params = zx.parseQuery(request, fullSchema)
 * }
 *
 * // With custom URLSearchParams parser
 * const customParser = (params: URLSearchParams) => {
 *   // Custom parsing logic for non-standard formats
 *   return Object.fromEntries(params)
 * }
 *
 * const { ids } = zx.parseQuery(
 *   request,
 *   { ids: z.array(z.string()) },
 *   { parser: customParser }
 * )
 * ```
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
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : z.object(schema as Record<string, any>)
    return finalSchema.parse(params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

/**
 * Safely parses and validates query string parameters using a Zod schema.
 * Returns a result object instead of throwing, suitable for custom error handling.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param request - Request object or URLSearchParams instance
 * @param schema - Zod schema or object shape defining the expected structure
 * @param options - Optional configuration (parser)
 * @returns Result object with { success: boolean, data?, error? }
 *
 * @example
 * ```typescript
 * export async function loader({ request }: Route.LoaderArgs) {
 *   const result = zx.parseQuerySafe(request, {
 *     q: z.string().min(1),
 *     page: zx.IntAsString,
 *   })
 *
 *   if (!result.success) {
 *     return { errors: result.error.issues }
 *   }
 *
 *   const { q, page } = result.data
 *   // Use validated data
 * }
 * ```
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
  const finalSchema = isZodV4Schema(schema)
    ? schema
    : z.object(schema as Record<string, any>)
  return finalSchema.safeParse(params) as SafeParsedData<T>
}

/**
 * Parses and validates FormData from a React Router action using a Zod schema.
 * Throws a 400 Response if validation fails, suitable for error boundaries.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param request - Request object or FormData instance
 * @param schema - Zod schema or object shape defining the expected structure
 * @param options - Optional configuration (message, status, parser)
 * @returns Promise of parsed and validated form data with full type inference
 * @throws Response with 400 status if validation fails
 *
 * @example
 * ```typescript
 * // Basic form parsing
 * export async function action({ request }: Route.ActionArgs) {
 *   const { email, password } = await zx.parseForm(request, {
 *     email: z.string().email(),
 *     password: z.string().min(8),
 *   })
 *   // email is string, password is string
 * }
 *
 * // With checkbox handling
 * export async function action({ request }: Route.ActionArgs) {
 *   const data = await zx.parseForm(request, {
 *     username: z.string(),
 *     rememberMe: zx.CheckboxAsString,
 *   })
 *   // data.rememberMe is boolean (true if "on", false if undefined)
 * }
 *
 * // With discriminated unions for multiple intents
 * const Schema = z.discriminatedUnion('intent', [
 *   z.object({ intent: z.literal('delete'), id: z.string() }),
 *   z.object({ intent: z.literal('create'), name: z.string() }),
 * ])
 *
 * export async function action({ request }: Route.ActionArgs) {
 *   const data = await zx.parseForm(request, Schema)
 *
 *   switch (data.intent) {
 *     case 'delete':
 *       // data is { intent: 'delete', id: string }
 *       return deleteItem(data.id)
 *     case 'create':
 *       // data is { intent: 'create', name: string }
 *       return createItem(data.name)
 *   }
 * }
 * ```
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
    const finalSchema = isZodV4Schema(schema)
      ? schema
      : z.object(schema as Record<string, any>)
    return (await finalSchema.parseAsync(params)) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

/**
 * Safely parses and validates FormData using a Zod schema.
 * Returns a result object instead of throwing, suitable for custom error handling.
 *
 * @template T - The schema type (Zod schema or object shape)
 * @param request - Request object or FormData instance
 * @param schema - Zod schema or object shape defining the expected structure
 * @param options - Optional configuration (parser)
 * @returns Promise of result object with { success: boolean, data?, error? }
 *
 * @example
 * ```typescript
 * export async function action({ request }: Route.ActionArgs) {
 *   const result = await zx.parseFormSafe(request, {
 *     email: z.string().email({ message: 'Invalid email' }),
 *     password: z.string().min(8, { message: 'Password too short' }),
 *   })
 *
 *   if (!result.success) {
 *     // Return validation errors to display in the UI
 *     return {
 *       errors: result.error.flatten().fieldErrors,
 *     }
 *   }
 *
 *   const { email, password } = result.data
 *   // Process validated form data
 *   return await login(email, password)
 * }
 * ```
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
