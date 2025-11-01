import { zx } from '@coji/zodix'
import { Form } from 'react-router'
import { z } from 'zod/v3'
import type { Route } from './+types/filters'

// Example: Dynamic schema construction based on database configuration
// This is a real-world scenario where filter options come from a database or API

// Simulate fetching available filter categories from database/API
async function getAvailableFilterCategories() {
  // In a real app, this would be a database query or API call
  return [
    {
      id: 'category',
      name: 'Category',
      options: ['electronics', 'clothing', 'books'],
    },
    { id: 'brand', name: 'Brand', options: ['BrandA', 'BrandB', 'BrandC'] },
    {
      id: 'condition',
      name: 'Condition',
      options: ['new', 'used', 'refurbished'],
    },
    {
      id: 'price_range',
      name: 'Price Range',
      options: ['0-50', '50-100', '100+'],
    },
  ]
}

export async function loader({ request }: Route.LoaderArgs) {
  // Fetch available filter categories (this could change over time)
  const filterCategories = await getAvailableFilterCategories()

  // ========================================
  // Approach: URLSearchParams with Zod for known fields (Zod v3 Compatible)
  // ========================================
  // With Zod v3, using z.object().extend() for dynamic schemas can cause
  // "Type instantiation is excessively deep" errors. This approach avoids
  // that by parsing known fields with Zod and dynamic fields with URLSearchParams.

  const url = new URL(request.url)

  // Parse known fields with Zod
  const baseParams = zx.parseQuery(request, {
    q: z.string().optional(),
    page: zx.IntAsString.optional(),
  })

  // Parse dynamic filter fields directly from URLSearchParams
  const filters: Record<string, string | undefined> = {}
  for (const filter of filterCategories) {
    const value = url.searchParams.get(filter.id)
    filters[filter.id] = value || undefined
  }

  // Alternative approaches for Zod v4 (see docs/dynamic-schemas.md):
  //
  // APPROACH 1: z.object().extend() (works well with Zod v4, full type safety)
  // const baseSchema = z.object({
  //   q: z.string().optional(),
  //   page: zx.IntAsString.optional(),
  // })
  // const dynamicFields = Object.fromEntries(
  //   filterCategories.map(cat => [cat.id, z.string().optional()])
  // )
  // const fullSchema = baseSchema.extend(dynamicFields)
  // const parsed = zx.parseQuery(request, fullSchema)
  //
  // APPROACH 2: JSON Record (for truly dynamic keys)
  // const schema = z.object({
  //   filters: z.string().transform(s => JSON.parse(s)).pipe(z.record(z.string()))
  // })
  // URL: ?filters={"category":"books","status":"active"}

  const params: {
    q: string | undefined
    page: number
    [key: string]: string | number | undefined
  } = {
    q: baseParams.q,
    page: baseParams.page ?? 1,
    ...filters,
  }

  const results = searchProducts({
    query: params.q,
    page: params.page,
    filters,
  })

  return {
    params,
    results,
    filterCategories,
  }
}

export default function Filters({ loaderData }: Route.ComponentProps) {
  const { params, results, filterCategories } = loaderData

  return (
    <div>
      <h1>Dynamic Filters Example (Zod v3)</h1>
      <p style={{ color: '#666', fontSize: '14px' }}>
        This example demonstrates building a schema dynamically based on filter
        options fetched from a database or API.
      </p>

      <Form method="get">
        <div>
          <label>
            Search:
            <input name="q" defaultValue={params.q} placeholder="Search..." />
          </label>
        </div>

        {filterCategories.map(
          (filter: { id: string; name: string; options: string[] }) => (
            <div key={filter.id}>
              <label>
                {filter.name}:
                <select
                  name={filter.id}
                  defaultValue={(params[filter.id] as string) || ''}
                >
                  <option value="">All</option>
                  {filter.options.map((option: string) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ),
        )}

        <div>
          <label>
            Page:
            <input
              name="page"
              type="number"
              defaultValue={params.page}
              min="1"
            />
          </label>
        </div>

        <button type="submit">Search</button>
      </Form>

      <div>
        <h2>Results (Page {params.page})</h2>
        <pre>{JSON.stringify(results, null, 2)}</pre>
      </div>

      <div>
        <h2>Active Filters</h2>
        <pre>{JSON.stringify(params, null, 2)}</pre>
      </div>
    </div>
  )
}

// Mock search function
function searchProducts(params: {
  query?: string
  page: number
  filters: Record<string, string | undefined>
}) {
  const allProducts = [
    {
      id: 1,
      name: 'Laptop',
      category: 'electronics',
      brand: 'BrandA',
      condition: 'new',
      price_range: '100+',
    },
    {
      id: 2,
      name: 'T-Shirt',
      category: 'clothing',
      brand: 'BrandB',
      condition: 'new',
      price_range: '0-50',
    },
    {
      id: 3,
      name: 'Novel',
      category: 'books',
      brand: 'BrandC',
      condition: 'used',
      price_range: '0-50',
    },
    {
      id: 4,
      name: 'Smartphone',
      category: 'electronics',
      brand: 'BrandA',
      condition: 'refurbished',
      price_range: '50-100',
    },
    {
      id: 5,
      name: 'Jeans',
      category: 'clothing',
      brand: 'BrandB',
      condition: 'new',
      price_range: '50-100',
    },
  ]

  let results = allProducts

  // Apply search query
  if (params.query) {
    const query = params.query
    results = results.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase()),
    )
  }

  // Apply dynamic filters
  for (const [key, value] of Object.entries(params.filters)) {
    if (value) {
      results = results.filter((p) => p[key as keyof typeof p] === value)
    }
  }

  return results
}
