import type * as z3 from 'zod/v3'
import type * as z4 from 'zod/v4/core'

export type ZodSchemaCompat = z3.ZodTypeAny | z4.$ZodType
export type ZodRawShapeCompat = z3.ZodRawShape | Record<string, z4.$ZodType>
export type ZodObjectCompat = z3.ZodObject<any> | z4.$ZodObject

export type SafeParseResultCompat<Input, Output> =
  | z3.SafeParseReturnType<Input, Output>
  | { success: true; data: Output }
  | { success: false; error: z4.$ZodError }

export type OutputCompat<T extends ZodSchemaCompat> = T extends z3.ZodTypeAny
  ? z3.output<T>
  : T extends z4.$ZodType
    ? z4.output<T>
    : never

export type InputCompat<T extends ZodSchemaCompat> = T extends z3.ZodTypeAny
  ? z3.input<T>
  : T extends z4.$ZodType
    ? z4.input<T>
    : never
