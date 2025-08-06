// Zod v4用のエクスポート
import type { ZodSafeParseResult } from 'zod/v4/classic/parse'
import type * as z4 from 'zod/v4/core'

// Zod v4 Classicの公開型を使用
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

// 実際の関数は共通実装を使い、型だけv4用にする
export {
  parseForm,
  parseFormSafe,
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
  type FormDataParser,
} from './parsers.v4'

export {
  BoolAsString,
  CheckboxAsString,
  IntAsString,
  NumAsString,
} from './schemas.v4'

export { createErrorResponse } from './errors'

// zx namespace for convenience
import {
  parseForm as _parseForm,
  parseFormSafe as _parseFormSafe,
  parseParams as _parseParams,
  parseParamsSafe as _parseParamsSafe,
  parseQuery as _parseQuery,
  parseQuerySafe as _parseQuerySafe,
} from './parsers.v4'
import {
  BoolAsString as _BoolAsString,
  CheckboxAsString as _CheckboxAsString,
  IntAsString as _IntAsString,
  NumAsString as _NumAsString,
} from './schemas.v4'

export const zx = {
  parseParams: _parseParams,
  parseParamsSafe: _parseParamsSafe,
  parseQuery: _parseQuery,
  parseQuerySafe: _parseQuerySafe,
  parseForm: _parseForm,
  parseFormSafe: _parseFormSafe,
  BoolAsString: _BoolAsString,
  CheckboxAsString: _CheckboxAsString,
  IntAsString: _IntAsString,
  NumAsString: _NumAsString,
}
