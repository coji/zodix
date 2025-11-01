# Zodix Examples (Zod v3)

This example project demonstrates usage of `@coji/zodix` with **Zod v3** for compatibility verification.

## Important: Use Zod v3 imports

When using `@coji/zodix` (without `/v4`), you must import from `zod/v3`:

```typescript
import { zx } from '@coji/zodix'
import { z } from 'zod/v3' // ← Important: use 'zod/v3', not just 'zod'
```

## Running the Examples

```bash
pnpm install
pnpm dev
```

## Example Routes

- Check the `/app/routes/` directory for example usage of Zodix
- `routes/index.tsx` describes each example route

## Zod v4 Examples

For Zod v4 examples (recommended), see the `examples/` directory
