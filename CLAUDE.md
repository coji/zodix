# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Development

```bash
pnpm install          # Install dependencies
pnpm run build        # Build the library (outputs to dist/)
pnpm run build:watch  # Build in watch mode
```

### Quality Checks

```bash
pnpm run validate     # Run all checks (lint, typecheck, test, format)
pnpm run lint         # Run Biome linter
pnpm run typecheck    # TypeScript type checking
pnpm run test         # Run Vitest tests
pnpm run format       # Check Prettier formatting
pnpm run format:fix   # Fix Prettier formatting
```

### Release

```bash
pnpm run release      # Release new version using np
```

### Testing Individual Files

```bash
pnpm vitest src/parsers.test.ts  # Run specific test file
pnpm vitest --watch              # Run tests in watch mode
```

## Architecture

### Library Purpose

Zodix is a TypeScript library providing Zod utilities for Remix applications. It simplifies parsing and validation of FormData and URLSearchParams in Remix loaders and actions while maintaining type safety.

### Core API Design

The library provides two API styles:

1. **Throwing functions** (`parseParams`, `parseForm`, `parseQuery`) - Throw 400 Response on validation failure for Remix CatchBoundary
2. **Safe functions** (`parseParamsSafe`, `parseFormSafe`, `parseQuerySafe`) - Return success/error objects for custom error handling

### Module Structure

```
src/
├── index.ts      # Main exports with zx namespace
├── parsers.ts    # Core parsing functions (FormData, URLSearchParams, Params)
├── schemas.ts    # Helper Zod schemas (BoolAsString, CheckboxAsString, IntAsString, NumAsString)
└── errors.ts     # Error handling utilities
```

### Key Implementation Details

- **Dual module format**: Outputs both ESM (dist/index.js) and CommonJS (dist/index.cjs)
- **Pure ESM package**: Uses `"type": "module"` in package.json
- **Zod compatibility**: Supports both Zod v3 and v4 as peer dependency
- **Schema flexibility**: Accepts both Zod object shapes and full Zod schemas
- **Custom parsers**: Supports custom URLSearchParams parser functions for non-standard query strings

### Testing Approach

- Unit tests use Vitest with global test functions enabled
- Tests cover all parsing functions, helper schemas, and error cases
- Type-level testing ensures API type correctness
- Test files are colocated with source files (\*.test.ts)

### Build Configuration

- **tsup**: Primary bundler for library output with TypeScript declarations
- **TypeScript**: Strict mode enabled with Node20 module resolution
- **Biome**: Linting with Git integration and recommended rules (noExplicitAny disabled)
- **Target**: Node.js 20+ with ES2022 features
