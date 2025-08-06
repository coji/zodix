import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['zod', 'zod/v3', 'zod/v4/core'],
  treeshake: true,
  splitting: false,
})
