# Zodix

[![Build Status](https://github.com/coji/zodix/actions/workflows/main.yml/badge.svg)](https://github.com/coji/zodix/actions/workflows/main.yml) [![npm version](https://img.shields.io/npm/v/@coji/zodix.svg?color=0c0)](https://www.npmjs.com/package/@coji/zodix)

Zodix is a collection of [Zod](https://github.com/colinhacks/zod) utilities for [React Router v7](https://reactrouter.com) loaders and actions. It abstracts the complexity of parsing and validating `FormData` and `URLSearchParams` so your loaders/actions stay clean and are strongly typed.

**✨ Now with full support for both Zod v3 and v4!**

React Router loaders often look like:

```ts
export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = params
  const url = new URL(request.url)
  const count = url.searchParams.get('count') || '10'
  if (typeof id !== 'string') {
    throw new Error('id must be a string')
  }
  const countNumber = parseInt(count, 10)
  if (isNaN(countNumber)) {
    throw new Error('count must be a number')
  }
  // Fetch data with id and countNumber
}
```

Here is the same loader with Zodix:

```ts
export async function loader({ params, request }: Route.LoaderArgs) {
  const { id } = zx.parseParams(params, { id: z.string() })
  const { count } = zx.parseQuery(request, { count: zx.NumAsString })
  // Fetch data with id and count
}
```

Check the [example app](/examples/app/routes) for complete examples of common patterns.

## Highlights

- **Full Zod v3 and v4 compatibility** - Works seamlessly with both versions
- Significantly reduce React Router action/loader bloat
- Avoid the oddities of FormData and URLSearchParams
- Tiny with no external dependencies ([Less than 1kb gzipped](https://bundlephobia.com/package/@coji/zodix))
- Use existing Zod schemas, or write them on the fly
- Custom Zod schemas for stringified numbers, booleans, and checkboxes
- Throw errors meant for React Router error boundaries by default
- Supports non-throwing parsing for custom validation/errors
- Works with all React Router runtimes (Node, Deno, Vercel, Cloudflare, etc)
- Full [unit test coverage](/src)

## Setup

Install with npm, yarn, pnpm, etc.

```sh
npm install @coji/zodix zod
```

### Zod Version Compatibility

Zodix supports both Zod v3 and v4 through separate import paths:

- **Zod v3**: Use `@coji/zodix` (requires `zod@^3.25.0` or later)
- **Zod v4**: Use `@coji/zodix/v4` (requires `zod@^4.0.0`)

```ts
// For Zod v3
import { zx } from '@coji/zodix'

// For Zod v4
import { zx } from '@coji/zodix/v4'
```

### Migration Guide

Upgrading from Zod v3 to v4? Follow these steps:

1. Update your Zod dependency: `npm install zod@^4.0.0`
2. Review and migrate your Zod schemas if needed - see [Zod v4 Changelog](https://zod.dev/v4/changelog) for breaking changes
3. Change your Zodix imports from `@coji/zodix` to `@coji/zodix/v4`
4. That's it! 🎉

## Usage

Import the `zx` object, or specific functions:

```ts
import { zx } from '@coji/zodix'
// import { parseParams, NumAsString } from '@coji/zodix';
```

### zx.parseParams(params: Params, schema: Schema)

Parse and validate the `Params` object from `Route.LoaderArgs['params']` or `Route.ActionArgs['params']` using a Zod shape:

```ts
export async function loader({ params }: Route.LoaderArgs) {
  const { userId, noteId } = zx.parseParams(params, {
    userId: z.string(),
    noteId: z.string(),
  })
}
```

The same as above, but using an existing Zod object schema:

```ts
// This is if you have many pages that share the same params.
export const ParamsSchema = z.object({ userId: z.string(), noteId: z.string() })

export async function loader({ params }: Route.LoaderArgs) {
  const { userId, noteId } = zx.parseParams(params, ParamsSchema)
}
```

### zx.parseForm(request: Request, schema: Schema)

Parse and validate `FormData` from a `Request` in a React Router action and avoid the tedious `FormData` dance:

```ts
export async function action({ request }: Route.ActionArgs) {
  const { email, password, saveSession } = await zx.parseForm(request, {
    email: z.string().email(),
    password: z.string().min(6),
    saveSession: zx.CheckboxAsString,
  })
}
```

Integrate with existing Zod schemas and models/controllers:

```ts
// db.ts
export const CreateNoteSchema = z.object({
  userId: z.string(),
  title: z.string(),
  category: NoteCategorySchema.optional(),
})

export function createNote(note: z.infer<typeof CreateNoteSchema>) {}
```

```ts
import { CreateNoteSchema, createNote } from './db'

export async function action({ request }: Route.ActionArgs) {
  const formData = await zx.parseForm(request, CreateNoteSchema)
  createNote(formData) // No TypeScript errors here
}
```

### zx.parseQuery(request: Request, schema: Schema)

Parse and validate the query string (search params) of a `Request`:

```ts
export async function loader({ request }: Route.LoaderArgs) {
  const { count, page } = zx.parseQuery(request, {
    // NumAsString parses a string number ("5") and returns a number (5)
    count: zx.NumAsString,
    page: zx.NumAsString,
  })
}
```

### zx.parseParamsSafe() / zx.parseFormSafe() / zx.parseQuerySafe()

These work the same as the non-safe versions, but don't throw when validation fails. They use [`z.parseSafe()`](https://github.com/colinhacks/zod#safeparse) and always return an object with the parsed data or an error.

```ts
export async function action(args: Route.ActionArgs) {
  const results = await zx.parseFormSafe(args.request, {
    email: z.string().email({ message: 'Invalid email' }),
    password: z
      .string()
      .min(8, { message: 'Password must be at least 8 characters' }),
  })
  return {
    success: results.success,
    error: results.error,
  }
}
```

Check the [login page example](/examples/app/routes/login.tsx) for a full example.

## Error Handling

### `parseParams()`, `parseForm()`, and `parseQuery()`

These functions throw a 400 Response when the parsing fails. This works nicely with [React Router error boundaries](https://reactrouter.com/en/main/route/error-element) and should be used for parsing things that should rarely fail and don't require custom error handling. You can pass a custom error message or status code.

```ts
export async function loader({ params }: Route.LoaderArgs) {
  const { postId } = zx.parseParams(
    params,
    { postId: zx.NumAsString },
    { message: "Invalid postId parameter", status: 400 }
  );
  const post = await getPost(postId);
  return { post };
}
export function ErrorBoundary() {
  const error = useRouteError();
  return <h1>Error: {error.statusText}</h1>;
}
```

Check the [post page example](/examples/app/routes/posts/$postId.tsx) for a full example.

### `parseParamsSafe()`, `parseFormSafe()`, and `parseQuerySafe()`

These functions are great for form validation because they don't throw when parsing fails. They always return an object with this shape:

```ts
{ success: boolean; error?: ZodError; data?: <parsed data>; }
```

You can then handle errors in the action and access them in the component using `useActionData()`. Check the [login page example](/examples/app/routes/login.tsx) for a full example.

## Helper Zod Schemas

Because `FormData` and `URLSearchParams` serialize all values to strings, you often end up with things like `"5"`, `"on"` and `"true"`. The helper schemas handle parsing and validating strings representing other data types and are meant to be used with the parse functions.

### Available Helpers

#### zx.BoolAsString

- `"true"` → `true`
- `"false"` → `false`
- `"notboolean"` → throws `ZodError`

#### zx.CheckboxAsString

- `"on"` → `true`
- `undefined` → `false`
- `"anythingbuton"` → throws `ZodError`

#### zx.IntAsString

- `"3"` → `3`
- `"3.14"` → throws `ZodError`
- `"notanumber"` → throws `ZodError`

#### zx.NumAsString

- `"3"` → `3`
- `"3.14"` → `3.14`
- `"notanumber"` → throws `ZodError`

See [the tests](/src/schemas.v4.test.ts) for more details.

### Usage

```ts
const Schema = z.object({
  isAdmin: zx.BoolAsString,
  agreedToTerms: zx.CheckboxAsString,
  age: zx.IntAsString,
  cost: zx.NumAsString,
})

const parsed = Schema.parse({
  isAdmin: 'true',
  agreedToTerms: 'on',
  age: '38',
  cost: '10.99',
})

/*
parsed = {
  isAdmin: true,
  agreedToTerms: true,
  age: 38,
  cost: 10.99
}
*/
```

## Zod v3/v4 Compatibility Details

### How It Works

Zodix provides separate import paths for Zod v3 and v4 compatibility:

1. **Use the appropriate import path** based on your Zod version
2. **Full type safety** is maintained for both versions
3. **Same API** across both versions - only the import path changes

### Using with Zod v3

```ts
import { z } from 'zod' // v3.x
import { zx } from '@coji/zodix' // Default path for v3

const schema = z.object({
  name: z.string(),
  age: zx.IntAsString,
})

export async function loader({ params }: Route.LoaderArgs) {
  const data = zx.parseParams(params, schema) // Works with Zod v3!
}
```

### Using with Zod v4

```ts
import { z } from 'zod' // v4.x
import { zx } from '@coji/zodix/v4' // Use v4 path

const schema = z.object({
  name: z.string(),
  age: zx.IntAsString,
})

export async function loader({ params }: Route.LoaderArgs) {
  const data = zx.parseParams(params, schema) // Works with Zod v4!
}
```

## Extras

### Custom `URLSearchParams` parsing

You may have URLs with query string that look like `?ids[]=1&ids[]=2` or `?ids=1,2` that aren't handled as desired by the built in `URLSearchParams` parsing.

You can pass a custom function, or use a library like [query-string](https://github.com/sindresorhus/query-string) to parse them with Zodix.

```ts
// Create a custom parser function
type ParserFunction = (
  params: URLSearchParams,
) => Record<string, string | string[]>
const customParser: ParserFunction = () => {
  /* ... */
}

// Parse non-standard search params
const search = new URLSearchParams(`?ids[]=id1&ids[]=id2`)
const { ids } = zx.parseQuery(
  request,
  { ids: z.array(z.string()) },
  { parser: customParser },
)

// ids = ['id1', 'id2']
```

### Actions with Multiple Intents

Zod discriminated unions are great for helping with actions that handle multiple intents like this:

```ts
// This adds type narrowing by the intent property
const Schema = z.discriminatedUnion('intent', [
  z.object({ intent: z.literal('delete'), id: z.string() }),
  z.object({ intent: z.literal('create'), name: z.string() }),
])

export async function action({ request }: Route.ActionArgs) {
  const data = await zx.parseForm(request, Schema)
  switch (data.intent) {
    case 'delete':
      // data is now narrowed to { intent: 'delete', id: string }
      return { success: true }
    case 'create':
      // data is now narrowed to { intent: 'create', name: string }
      return { success: true }
    default:
      // data is now narrowed to never. This will error if a case is missing.
      const _exhaustiveCheck: never = data
  }
}
```

## Acknowledgments

This project is a fork of [rileytomasek/zodix](https://github.com/rileytomasek/zodix). Thanks to Riley Tomasek for creating the original Zodix library.
