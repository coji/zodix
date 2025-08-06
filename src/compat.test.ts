import { describe, expect, test } from 'vitest'
import * as z3 from 'zod/v3'
import { parseParams, parseParamsSafe } from './parsers'

describe('Zod v3 compatibility', () => {
  test('works with v3 schemas', () => {
    const schema = z3.object({ id: z3.string() })
    const result = parseParams({ id: 'test' }, schema)
    expect(result).toEqual({ id: 'test' })
  })

  test('works with v3 raw shape', () => {
    const shape = { id: z3.string() }
    const result = parseParams({ id: 'test' }, shape)
    expect(result).toEqual({ id: 'test' })
  })

  test('parseParamsSafe works with v3 schemas', () => {
    const schema = z3.object({ id: z3.string() })
    const result = parseParamsSafe({ id: 'test' }, schema)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual({ id: 'test' })
    }
  })

  test('parseParamsSafe handles v3 validation errors', () => {
    const schema = z3.object({ id: z3.number() })
    const result = parseParamsSafe({ id: 'test' }, schema)
    expect(result.success).toBe(false)
  })
})
