import * as z3 from 'zod/v3'
import type { ZodRawShapeCompat } from '../types/compat'

export function createObjectSchema(shape: ZodRawShapeCompat) {
  // v4/core はスキーマ作成をサポートしないため、v3を使用
  // ユーザーがv4スキーマを使用したい場合は、
  // 直接 zod/v4 または zod/v4/mini からインポートして
  // スキーマオブジェクトとして渡す必要がある
  return z3.object(shape as z3.ZodRawShape)
}
