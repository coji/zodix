# Dynamic Schema Patterns in Zodix

This guide explains how to handle dynamic schemas in Zodix - schemas where the fields are not known at compile time but determined at runtime.

## Table of Contents

- [Static vs Dynamic Schemas](#static-vs-dynamic-schemas)
- [Three Approaches for Dynamic Schemas](#three-approaches-for-dynamic-schemas)
- [Comparison Table](#comparison-table)
- [Best Practices](#best-practices)
- [Zod v3 vs v4 Considerations](#zod-v3-vs-v4-considerations)
- [Real-World Examples](#real-world-examples)

## Static vs Dynamic Schemas

### Static Schema (Known at Compile Time)

```typescript
// All fields are known when you write the code
const schema = z.object({
  q: z.string().optional(),
  page: zx.IntAsString,
  category: z.string().optional(),
})

const parsed = zx.parseQuery(request, schema)
// ✨ Full type inference: parsed.q, parsed.page, parsed.category
```

### Dynamic Schema (Determined at Runtime)

```typescript
// Fields come from database/API at runtime
const filterCategories = await getAvailableFilterCategories()
// → [{ id: 'category', ... }, { id: 'brand', ... }, { id: 'condition', ... }]

// Need to build schema dynamically from this data
// Challenge: How to maintain type safety?
```

## Three Approaches for Dynamic Schemas

### Approach 1: z.object().extend() (Recommended)

**Best for**: Semi-dynamic schemas where you have some known fields plus runtime-determined fields.

**Pros**:

- ✅ Full type inference with Zod v4
- ✅ Validation for all fields
- ✅ Type-safe access to known fields
- ✅ Clean API

**Cons**:

- ⚠️ Limited type inference with Zod v3 (types infer as `any` for dynamic fields)
- ⚠️ Requires building schema object at runtime

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  // Fetch dynamic filter categories
  const filterCategories = await getAvailableFilterCategories()

  // 1. Define base schema with known fields
  const baseSchema = z.object({
    q: z.string().optional(),
    page: zx.IntAsString.optional(),
  })

  // 2. Build dynamic fields from runtime data
  const dynamicFields = Object.fromEntries(
    filterCategories.map((cat) => [cat.id, z.string().optional()]),
  )

  // 3. Extend base schema with dynamic fields
  const fullSchema = baseSchema.extend(dynamicFields)

  // 4. Parse with type inference (Zod v4)
  const parsed = zx.parseQuery(request, fullSchema)
  // ✨ parsed.q is string | undefined
  // ✨ parsed.page is number | undefined
  // ✨ parsed[category.id] is string | undefined (Zod v4 only)

  // Access dynamic fields
  for (const filter of filterCategories) {
    const value = parsed[filter.id] // Type-safe in v4
  }
}
```

**Important**: Do NOT add a type annotation like `Record<string, any>` to `dynamicFields`, as this will lose type inference:

```typescript
// ❌ DON'T: Loses type inference
const dynamicFields: Record<string, any> = Object.fromEntries(...)

// ✅ DO: Preserves type inference
const dynamicFields = Object.fromEntries(...)
```

### Approach 2: URLSearchParams (Simplest)

**Best for**: When you don't need Zod validation for dynamic fields, or when dealing with completely unknown query parameters.

**Pros**:

- ✅ Simple and straightforward
- ✅ No schema building required
- ✅ Works with any dynamic keys
- ✅ No dependency on Zod version

**Cons**:

- ❌ No validation for dynamic fields
- ❌ Manual type coercion required
- ❌ No type safety

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url)
  const filterCategories = await getAvailableFilterCategories()

  // Parse known fields with Zod
  const baseParams = zx.parseQuery(request, {
    q: z.string().optional(),
    page: zx.IntAsString.optional(),
  })

  // Access dynamic fields directly from URLSearchParams
  const filters: Record<string, string | null> = {}
  for (const filter of filterCategories) {
    filters[filter.id] = url.searchParams.get(filter.id)
  }

  return {
    q: baseParams.q,
    page: baseParams.page ?? 1,
    filters,
  }
}
```

### Approach 3: JSON Record (For Truly Dynamic Keys)

**Best for**: When you need validation for completely dynamic keys, or when dealing with complex nested structures.

**Pros**:

- ✅ Validates dynamic data
- ✅ Handles complex nested structures
- ✅ Single query parameter
- ✅ Type-safe with `z.record()`

**Cons**:

- ❌ Requires JSON encoding/decoding
- ❌ More complex URL structure
- ❌ Harder to work with in forms
- ❌ URL length limitations

```typescript
export async function loader({ request }: Route.LoaderArgs) {
  const schema = z.object({
    q: z.string().optional(),
    page: zx.IntAsString.optional(),
    // All dynamic filters in a single JSON parameter
    filters: z.string()
      .transform(s => JSON.parse(s))
      .pipe(z.record(z.string()))
      .optional(),
  })

  const parsed = zx.parseQuery(request, schema)

  return {
    q: parsed.q,
    page: parsed.page ?? 1,
    filters: parsed.filters ?? {},
  }
}

// In your component
export default function Component() {
  const filters = { category: 'books', brand: 'BrandA' }

  return (
    <Form method="get">
      <input name="q" />
      <input name="page" type="number" />
      <input
        name="filters"
        type="hidden"
        value={JSON.stringify(filters)}
      />
      <button type="submit">Search</button>
    </Form>
  )
}

// URL: ?q=laptop&page=1&filters={"category":"books","brand":"BrandA"}
```

## Comparison Table

| Feature          | z.object().extend()  | URLSearchParams      | JSON Record         |
| ---------------- | -------------------- | -------------------- | ------------------- |
| Type Safety (v4) | ✅ Full              | ❌ Manual            | ✅ Full             |
| Type Safety (v3) | ⚠️ Partial           | ❌ Manual            | ✅ Full             |
| Validation       | ✅ Yes               | ⚠️ Partial           | ✅ Yes              |
| URL Friendliness | ✅ Clean URLs        | ✅ Clean URLs        | ❌ Complex URLs     |
| Form Integration | ✅ Easy              | ✅ Easy              | ⚠️ Requires JS      |
| Runtime Overhead | ⚠️ Schema building   | ✅ Minimal           | ⚠️ JSON parsing     |
| Best Use Case    | Semi-dynamic filters | Fully dynamic params | Complex nested data |

## Best Practices

### 1. Centralized Schema Definitions

When dealing with dynamic filters across multiple routes, consider centralizing your schema logic:

```typescript
// lib/schemas/filters.ts
export async function createFilterSchema() {
  const filterCategories = await getAvailableFilterCategories()

  const baseSchema = z.object({
    q: z.string().optional(),
    page: zx.IntAsString.optional(),
  })

  const dynamicFields = Object.fromEntries(
    filterCategories.map((cat) => [cat.id, z.string().optional()]),
  )

  return {
    schema: baseSchema.extend(dynamicFields),
    categories: filterCategories,
  }
}

// routes/products.tsx
export async function loader({ request }: Route.LoaderArgs) {
  const { schema, categories } = await createFilterSchema()
  const parsed = zx.parseQuery(request, schema)
  // ...
}
```

### 2. Type Helpers for Dynamic Schemas

Use the `InferParams` type helper when you need explicit typing:

```typescript
import { zx, type InferParams } from '@coji/zodix'

const mySchema = z.object({
  q: z.string().optional(),
  page: zx.IntAsString.optional(),
})

type Params = InferParams<typeof mySchema>
// → { q: string | undefined, page: number | undefined }

// Useful when passing to other functions
function processFilters(params: Params) {
  // ...
}
```

### 3. Validation for Dynamic Field Values

Even with dynamic keys, you can validate the values:

```typescript
const filterCategories = await getAvailableFilterCategories()

const dynamicFields = Object.fromEntries(
  filterCategories.map((cat) => [
    cat.id,
    z.enum(cat.options as [string, ...string[]]).optional(),
  ]),
)

const fullSchema = baseSchema.extend(dynamicFields)
// Now each filter field only accepts its valid options
```

### 4. Caching Schema Definitions

If your dynamic fields don't change often, consider caching:

```typescript
import { unstable_cache } from 'react-router'

const getCachedFilterSchema = unstable_cache(
  async () => {
    const categories = await getAvailableFilterCategories()
    // Build and return schema...
  },
  ['filter-schema'],
  { revalidate: 3600 }, // Cache for 1 hour
)
```

## Zod v3 vs v4 Considerations

### Zod v4 (Recommended for Dynamic Schemas)

```typescript
import { z } from 'zod/v4'
import { zx } from '@coji/zodix'

const baseSchema = z.object({
  q: z.string().optional(),
  page: zx.IntAsString.optional(),
})

const dynamicFields = Object.fromEntries(
  categories.map((cat) => [cat.id, z.string().optional()]),
)

const fullSchema = baseSchema.extend(dynamicFields)
const parsed = zx.parseQuery(request, fullSchema)

// ✅ Full type inference works!
console.log(parsed.q) // string | undefined
console.log(parsed.page) // number | undefined
console.log(parsed[cat.id]) // string | undefined
```

### Zod v3 (Type Inference Limitations)

```typescript
import { z } from 'zod/v3'
import { zx } from '@coji/zodix'

const baseSchema = z.object({
  q: z.string().optional(),
  page: zx.IntAsString.optional(),
})

const dynamicFields = Object.fromEntries(
  categories.map((cat) => [cat.id, z.string().optional()]),
)

const fullSchema = baseSchema.extend(dynamicFields)
const parsed = zx.parseQuery(request, fullSchema)

// ⚠️ Type inference is limited
console.log(parsed.q) // any (not ideal)
console.log(parsed[cat.id]) // any (not ideal)

// Workaround: Use z.infer with explicit type
type FilterParams = z.infer<typeof fullSchema>
const typedParsed: FilterParams = parsed
// OR: Use explicit type assertion with validation
```

**Why the difference?**

Zod v3's type system has limitations with complex conditional types that cause "Type instantiation is excessively deep" errors. Zodix v3 implementation uses `any` as a return type to avoid these errors. Zod v4 improved its type system to handle these cases better.

**Recommendation**: If you're starting a new project and need dynamic schemas, use Zod v4. If you're on Zod v3, consider:

1. Using Approach 2 (URLSearchParams) for truly dynamic fields
2. Using Approach 3 (JSON Record) if you need validation
3. Upgrading to Zod v4 for better type inference

## Real-World Examples

### Example 1: E-commerce Product Filters

See `examples/app/routes/filters.tsx` (Zod v4) and `examples-v3/app/routes/filters.tsx` (Zod v3) for complete working examples.

### Example 2: Admin Dashboard with Dynamic Reports

```typescript
// Different reports have different filter parameters
async function getReportConfig(reportType: string) {
  // Fetch from database
  return {
    type: reportType,
    filters: [
      { id: 'startDate', type: 'date' },
      { id: 'endDate', type: 'date' },
      { id: 'department', type: 'string' },
      // ... more dynamic filters
    ],
  }
}

export async function loader({ request, params }: Route.LoaderArgs) {
  const { reportType } = params
  const config = await getReportConfig(reportType)

  const baseSchema = z.object({
    reportType: z.string(),
  })

  const dynamicFields = Object.fromEntries(
    config.filters.map((filter) => [
      filter.id,
      filter.type === 'date'
        ? z.string().datetime().optional()
        : z.string().optional(),
    ]),
  )

  const fullSchema = baseSchema.extend(dynamicFields)
  const filters = zx.parseQuery(request, fullSchema)

  const reportData = await generateReport(reportType, filters)

  return { config, filters, reportData }
}
```

### Example 3: Multi-Tenant SaaS with Tenant-Specific Fields

```typescript
async function getTenantConfig(tenantId: string) {
  // Each tenant can define custom fields
  return {
    id: tenantId,
    customFields: [
      { id: 'custom_field_1', label: 'Project Code' },
      { id: 'custom_field_2', label: 'Cost Center' },
    ],
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const tenantId = await getCurrentTenantId(request)
  const config = await getTenantConfig(tenantId)

  const baseSchema = z.object({
    search: z.string().optional(),
    page: zx.IntAsString.optional(),
  })

  const customFields = Object.fromEntries(
    config.customFields.map((field) => [field.id, z.string().optional()]),
  )

  const fullSchema = baseSchema.extend(customFields)
  const params = zx.parseQuery(request, fullSchema)

  return { config, params }
}
```

## Additional Resources

- [Zod v4 Migration Guide](https://zod.dev/v4-migration)
- [React Router Data Loading](https://reactrouter.com/en/main/guides/data-loading)
- [TypeScript Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html)
- [nuqs - Type-safe URL state management](https://nuqs.dev/) - Alternative approach using parser-based abstractions

## Summary

For most use cases with dynamic schemas:

1. **Use Approach 1 (z.object().extend())** if you're on Zod v4 and want full type safety
2. **Use Approach 2 (URLSearchParams)** if you need simplicity or are on Zod v3
3. **Use Approach 3 (JSON Record)** if you need validation for completely dynamic nested data

Remember: There's no "perfect" solution for dynamic schemas - each approach has trade-offs. Choose based on your specific requirements for type safety, validation, and developer experience.
