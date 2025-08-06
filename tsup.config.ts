import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/v4.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'zod',
    'zod/v3',
    'zod/v4',
    'zod/v4/core',
    'zod/v4/classic/parse',
    'react-router',
  ],
  treeshake: true,
  splitting: false,
})
