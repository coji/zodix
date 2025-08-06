import type { Params } from 'react-router'
import { createObjectSchema } from './compat/object'
import { parseAsyncCompat, parseCompat, safeParseCompat } from './compat/parser'
import { createErrorResponse } from './errors'
import type {
  OutputCompat,
  SafeParseResultCompat,
  ZodRawShapeCompat,
  ZodSchemaCompat,
} from './types/compat'
import { isZodSchema } from './types/guards'

type Options<Parser = SearchParamsParser> = {
  /** Custom error message for when the validation fails. */
  message?: string
  /** Status code for thrown request when validation fails. */
  status?: number
  /** Custom URLSearchParams parsing function. */
  parser?: Parser
}

/**
 * Generic return type for parseX functions.
 */
type ParsedData<T extends ZodRawShapeCompat | ZodSchemaCompat> =
  T extends ZodSchemaCompat
    ? OutputCompat<T>
    : T extends ZodRawShapeCompat
      ? OutputCompat<ReturnType<typeof createObjectSchema>>
      : never

/**
 * Generic return type for parseXSafe functions.
 */
type SafeParsedData<T extends ZodRawShapeCompat | ZodSchemaCompat> =
  T extends ZodSchemaCompat
    ? SafeParseResultCompat<any, OutputCompat<T>>
    : T extends ZodRawShapeCompat
      ? SafeParseResultCompat<
          any,
          OutputCompat<ReturnType<typeof createObjectSchema>>
        >
      : never

/**
 * Parse and validate Params from LoaderArgs or ActionArgs. Throws an error if validation fails.
 * @param params - A Remix Params object.
 * @param schema - A Zod object shape or object schema to validate.
 * @throws {Response} - Throws an error Response if validation fails.
 */
export function parseParams<T extends ZodRawShapeCompat | ZodSchemaCompat>(
  params: Params,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const finalSchema = isZodSchema(schema)
      ? (schema as ZodSchemaCompat)
      : createObjectSchema(schema as ZodRawShapeCompat)
    return parseCompat(finalSchema, params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

/**
 * Parse and validate Params from LoaderArgs or ActionArgs. Doesn't throw if validation fails.
 * @param params - A Remix Params object.
 * @param schema - A Zod object shape or object schema to validate.
 * @returns {SafeParseReturnType} - An object with the parsed data or a ZodError.
 */
export function parseParamsSafe<T extends ZodRawShapeCompat | ZodSchemaCompat>(
  params: Params,
  schema: T,
): SafeParsedData<T> {
  const finalSchema = isZodSchema(schema)
    ? (schema as ZodSchemaCompat)
    : createObjectSchema(schema as ZodRawShapeCompat)
  return safeParseCompat(finalSchema, params) as SafeParsedData<T>
}

/**
 * Parse and validate URLSearchParams or a Request. Throws an error if validation fails.
 * @param request - A Request or URLSearchParams
 * @param schema - A Zod object shape or object schema to validate.
 * @throws {Response} - Throws an error Response if validation fails.
 */
export function parseQuery<T extends ZodRawShapeCompat | ZodSchemaCompat>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options,
): ParsedData<T> {
  try {
    const searchParams = isURLSearchParams(request)
      ? request
      : getSearchParamsFromRequest(request)
    const params = parseSearchParams(searchParams, options?.parser)
    const finalSchema = isZodSchema(schema)
      ? (schema as ZodSchemaCompat)
      : createObjectSchema(schema as ZodRawShapeCompat)
    return parseCompat(finalSchema, params) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

/**
 * Parse and validate URLSearchParams or a Request. Doesn't throw if validation fails.
 * @param request - A Request or URLSearchParams
 * @param schema - A Zod object shape or object schema to validate.
 * @returns {SafeParseReturnType} - An object with the parsed data or a ZodError.
 */
export function parseQuerySafe<T extends ZodRawShapeCompat | ZodSchemaCompat>(
  request: Request | URLSearchParams,
  schema: T,
  options?: Options,
): SafeParsedData<T> {
  const searchParams = isURLSearchParams(request)
    ? request
    : getSearchParamsFromRequest(request)
  const params = parseSearchParams(searchParams, options?.parser)
  const finalSchema = isZodSchema(schema)
    ? (schema as ZodSchemaCompat)
    : createObjectSchema(schema as ZodRawShapeCompat)
  return safeParseCompat(finalSchema, params) as SafeParsedData<T>
}

/**
 * Parse and validate FormData from a Request. Throws an error if validation fails.
 * @param request - A Request or FormData
 * @param schema - A Zod object shape or object schema to validate.
 * @throws {Response} - Throws an error Response if validation fails.
 */
export async function parseForm<
  T extends ZodRawShapeCompat | ZodSchemaCompat,
  Parser extends FormDataParser<any>,
>(
  request: Request | FormData,
  schema: T,
  options?: Options<Parser>,
): Promise<ParsedData<T>> {
  try {
    const formData = isFormData(request)
      ? request
      : await request.clone().formData()
    const data = await parseFormData(formData, options?.parser)
    const finalSchema = isZodSchema(schema)
      ? (schema as ZodSchemaCompat)
      : createObjectSchema(schema as ZodRawShapeCompat)
    return (await parseAsyncCompat(finalSchema, data)) as ParsedData<T>
  } catch (_error) {
    throw createErrorResponse(options)
  }
}

/**
 * Parse and validate FormData from a Request. Doesn't throw if validation fails.
 * @param request - A Request or FormData
 * @param schema - A Zod object shape or object schema to validate.
 * @returns {SafeParseReturnType} - An object with the parsed data or a ZodError.
 */
export async function parseFormSafe<
  T extends ZodRawShapeCompat | ZodSchemaCompat,
  Parser extends FormDataParser<any>,
>(
  request: Request | FormData,
  schema: T,
  options?: Options<Parser>,
): Promise<SafeParsedData<T>> {
  const formData = isFormData(request)
    ? request
    : await request.clone().formData()
  const data = await parseFormData(formData, options?.parser)
  const finalSchema = isZodSchema(schema)
    ? (schema as ZodSchemaCompat)
    : createObjectSchema(schema as ZodRawShapeCompat)
  try {
    const result = await parseAsyncCompat(finalSchema, data)
    return { success: true, data: result } as SafeParsedData<T>
  } catch (error) {
    return { success: false, error } as SafeParsedData<T>
  }
}

/**
 * The data returned from parsing a URLSearchParams object.
 */
type ParsedSearchParams = Record<string, string | string[]>

/**
 * Function signature to allow for custom URLSearchParams parsing.
 */
type SearchParamsParser<T = ParsedSearchParams> = (
  searchParams: URLSearchParams,
) => T

/**
 * The data returned from parsing a FormData object.
 */
type ParsedFormData = Record<string, string | string[] | File>

/**
 * Function signature to allow for custom FormData parsing.
 */
type FormDataParser<T = ParsedFormData> = (formData: FormData) => T

/**
 * Get the form data from a request as an object.
 */
function parseFormData(formData: FormData, customParser?: FormDataParser) {
  const parser = customParser || parseFormDataDefault
  return parser(formData)
}

/**
 * The default parser for FormData.
 * Get the form data as an object. Create arrays for duplicate keys.
 */
const parseFormDataDefault: FormDataParser = (formData) => {
  const values: ParsedFormData = {}
  for (const [key, value] of formData.entries()) {
    const currentVal = values[key]
    if (currentVal && Array.isArray(currentVal)) {
      currentVal.push(value.toString())
    } else if (value instanceof File) {
      values[key] = value.name
    } else if (currentVal) {
      values[key] = [currentVal.toString(), value]
    } else {
      values[key] = value
    }
  }
  return values
}

/**
 * Get the URLSearchParams as an object.
 */
function parseSearchParams(
  searchParams: URLSearchParams,
  customParser?: SearchParamsParser,
): ParsedSearchParams {
  const parser = customParser || parseSearchParamsDefault
  return parser(searchParams)
}

/**
 * The default parser for URLSearchParams.
 * Get the search params as an object. Create arrays for duplicate keys.
 */
const parseSearchParamsDefault: SearchParamsParser = (searchParams) => {
  const values: ParsedSearchParams = {}
  for (const [key, value] of searchParams) {
    const currentVal = values[key]
    if (currentVal && Array.isArray(currentVal)) {
      currentVal.push(value)
    } else if (currentVal) {
      values[key] = [currentVal, value]
    } else {
      values[key] = value
    }
  }
  return values
}

/**
 * Get the search params from a request.
 */
function getSearchParamsFromRequest(request: Request): URLSearchParams {
  const url = new URL(request.url)
  return url.searchParams
}

/**
 * Check if value is an instance of FormData.
 * This is a workaround for `instanceof` to support multiple platforms.
 */
function isFormData(value: unknown): value is FormData {
  return getObjectTypeName(value) === 'FormData'
}

/**
 * Check if value is an instance of URLSearchParams.
 * This is a workaround for `instanceof` to support multiple platforms.
 */
function isURLSearchParams(value: unknown): value is URLSearchParams {
  return getObjectTypeName(value) === 'URLSearchParams'
}

function getObjectTypeName(value: unknown): string {
  return toString.call(value).slice(8, -1)
}
