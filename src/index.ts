import {
  parseForm,
  parseFormSafe,
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
} from './parsers'
import {
  BoolAsString,
  CheckboxAsString,
  IntAsString,
  NumAsString,
} from './schemas'

export {
  BoolAsString,
  CheckboxAsString,
  IntAsString,
  NumAsString,
  parseForm,
  parseFormSafe,
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
}

export const zx = {
  parseParams,
  parseParamsSafe,
  parseQuery,
  parseQuerySafe,
  parseForm,
  parseFormSafe,
  BoolAsString,
  CheckboxAsString,
  IntAsString,
  NumAsString,
}
