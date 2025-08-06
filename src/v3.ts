// Exports for Zod v3 (default)

// Export parser functions and types for v3
export {
  parseForm,
  parseFormSafe,
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
  type FormDataParser,
  type ParsedData,
  type SafeParsedData,
} from './parsers.v3'

export {
  BoolAsString,
  CheckboxAsString,
  IntAsString,
  NumAsString,
} from './schemas.v3'

export { createErrorResponse } from './errors'

// zx namespace for convenience
import {
  parseForm as _parseForm,
  parseFormSafe as _parseFormSafe,
  parseParams as _parseParams,
  parseParamsSafe as _parseParamsSafe,
  parseQuery as _parseQuery,
  parseQuerySafe as _parseQuerySafe,
} from './parsers.v3'
import {
  BoolAsString as _BoolAsString,
  CheckboxAsString as _CheckboxAsString,
  IntAsString as _IntAsString,
  NumAsString as _NumAsString,
} from './schemas.v3'

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
