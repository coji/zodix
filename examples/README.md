# Zodix Examples (Zod v4)

This example project demonstrates usage of `@coji/zodix` with **Zod v4**.

## Important: Use Zod v4 imports

When using `@coji/zodix/v4`, you must import from `zod/v4`:

```typescript
import { zx } from '@coji/zodix/v4'
import { z } from 'zod/v4' // ← Important: use 'zod/v4', not just 'zod'
```

## Running the Examples

```bash
pnpm install
pnpm dev
```

## Example Routes

- Check the `/app/routes/` directory for example usage of Zodix
- `routes/index.tsx` describes each example route

## Zod v3 Examples

For Zod v3 examples, see the `examples-v3/` directory (coming soon)
