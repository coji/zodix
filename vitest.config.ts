/// <reference types="vitest" />

import { defineConfig } from 'vite'

export default defineConfig({
  test: {
    watch: false,
    globals: true,
    environment: 'node',
    include: ['./src/**/*.test.ts'],
    exclude: ['.*\\/node_modules\\/.*', '.*\\/build\\/.*'],
  },
})
